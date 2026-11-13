import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { desdeInput } from '../helpers/formato.js';

const carpetaUploads = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'uploads');

// Borra una imagen subida (solo dentro de public/uploads, nunca fuera de esa carpeta)
const quitarArchivo = (ruta) => {
  if (!ruta || !String(ruta).startsWith('/uploads/')) return;
  fs.promises.unlink(path.join(carpetaUploads, path.basename(ruta))).catch(() => {});
};

// Reglas de validación generadas a partir de la definición de campos
export const reglas = (campos) =>
  campos.filter((c) => c.type !== 'file' && c.type !== 'checkbox').map((c) => {
    let v = body(c.name).trim();
    if (c.required) v = v.notEmpty().withMessage(`${c.label} es obligatorio`).bail();
    else v = v.optional({ values: 'falsy' });

    if (c.type === 'email') v = v.isEmail().withMessage(`${c.label} no es un correo válido`).bail();
    if (c.type === 'number') {
      const op = { min: c.min ?? 0, max: c.maxNum ?? 99999999 };
      v = (c.entero ? v.isInt(op) : v.isFloat(op))
        .withMessage(`${c.label} debe ser un número${c.entero ? ' entero' : ''} entre ${op.min} y ${op.max}`).bail();
    }
    if (c.type === 'select') v = v.isInt({ min: 1 }).withMessage(`Selecciona ${c.label}`).bail();
    if (c.type === 'datetime-local') v = v.isISO8601().withMessage(`${c.label} no es una fecha válida`).bail();
    if (c.max) v = v.isLength({ max: c.max }).withMessage(`${c.label} admite máximo ${c.max} caracteres`);
    return v;
  });

export const mensajeError = (err) => {
  if (err.name === 'SequelizeUniqueConstraintError') return 'Ya existe un registro con ese valor (dato duplicado, por ejemplo el correo).';
  if (err.name === 'SequelizeForeignKeyConstraintError') return 'No se puede completar: el registro está relacionado con otros datos.';
  if (err.name === 'SequelizeValidationError') return err.errors.map((e) => e.message).join(', ');
  console.error(err);
  return 'Ocurrió un error al guardar.';
};

const cargarOpciones = async (campos) => {
  const o = {};
  for (const c of campos) if (c.type === 'select') o[c.name] = await c.opciones();
  return o;
};

const normalizar = (campos, bodyReq, file) => {
  const d = {};
  for (const c of campos) {
    if (c.type === 'file') { if (file) d[c.name] = '/uploads/' + file.filename; continue; }
    if (c.type === 'checkbox') { d[c.name] = bodyReq[c.name] === 'on'; continue; }
    const v = bodyReq[c.name];
    if (v === undefined || v === '') d[c.name] = null;
    else d[c.name] = c.type === 'datetime-local' ? desdeInput(v) : v;
  }
  return d;
};

// Genera lista / crear / editar / eliminar para cualquier catálogo
export default function crearCatalogo(cfg) {
  const { modelo, pk, ruta, campos, include = [] } = cfg;

  const form = async (res, { registro, action, errores = [], error = null, status = 200 }) =>
    res.status(status).render('crud/formulario', {
      titulo: cfg.titulo, cfg, registro, action, errores, error, opciones: await cargarOpciones(campos),
    });

  const lista = async (req, res) => {
    const registros = await modelo.findAll({ include, order: [[pk, 'DESC']] });
    res.render('crud/lista', {
      titulo: cfg.titulo, cfg, registros, mensaje: req.query.mensaje || null, error: req.query.error || null,
    });
  };

  const verCrear = (req, res) => {
    const registro = {};
    campos.forEach((c) => {
      if (c.ahora) registro[c.name] = new Date();
      if (c.defecto !== undefined) registro[c.name] = c.defecto;
    });
    return form(res, { registro, action: `/${ruta}` });
  };

  const erroresDe = (req) => {
    const e = validationResult(req).array().map((x) => x.msg);
    if (req.errorSubida) e.push(req.errorSubida);
    // Si el formulario es inválido, la imagen ya subida por multer no debe quedarse en disco
    if (e.length && req.file) quitarArchivo('/uploads/' + req.file.filename);
    return e;
  };

  const camposArchivo = campos.filter((c) => c.type === 'file').map((c) => c.name);

  const guardar = async (req, res) => {
    const errores = erroresDe(req);
    if (errores.length) return form(res, { registro: req.body, action: `/${ruta}`, errores, status: 422 });
    try {
      await modelo.create(normalizar(campos, req.body, req.file));
      res.redirect(`/${ruta}?mensaje=${encodeURIComponent('Registro guardado')}`);
    } catch (err) {
      if (req.file) quitarArchivo('/uploads/' + req.file.filename);
      return form(res, { registro: req.body, action: `/${ruta}`, error: mensajeError(err), status: 400 });
    }
  };

  const editar = async (req, res) => {
    const registro = await modelo.findByPk(req.params.id);
    if (!registro) return res.redirect(`/${ruta}?error=${encodeURIComponent('El registro no existe')}`);
    const bloqueo = cfg.bloquearEdicion && (await cfg.bloquearEdicion(registro));
    if (bloqueo) return res.redirect(`/${ruta}?error=${encodeURIComponent(bloqueo)}`);
    return form(res, { registro, action: `/${ruta}/${registro[pk]}?_method=PUT` });
  };

  const actualizar = async (req, res) => {
    const registro = await modelo.findByPk(req.params.id);
    if (!registro) return res.redirect(`/${ruta}?error=${encodeURIComponent('El registro no existe')}`);
    const bloqueo = cfg.bloquearEdicion && (await cfg.bloquearEdicion(registro));
    if (bloqueo) {
      if (req.file) quitarArchivo('/uploads/' + req.file.filename);
      return res.redirect(`/${ruta}?error=${encodeURIComponent(bloqueo)}`);
    }
    const action = `/${ruta}/${registro[pk]}?_method=PUT`;
    const errores = erroresDe(req);
    if (errores.length) return form(res, { registro: { ...req.body, [pk]: registro[pk] }, action, errores, status: 422 });
    try {
      const anteriores = camposArchivo.map((n) => registro[n]);
      await registro.update(normalizar(campos, req.body, req.file));
      if (req.file) anteriores.forEach(quitarArchivo); // la imagen reemplazada ya no se necesita
      res.redirect(`/${ruta}?mensaje=${encodeURIComponent('Registro actualizado')}`);
    } catch (err) {
      if (req.file) quitarArchivo('/uploads/' + req.file.filename);
      return form(res, { registro: { ...req.body, [pk]: registro[pk] }, action, error: mensajeError(err), status: 400 });
    }
  };

  const eliminar = async (req, res) => {
    try {
      const registro = await modelo.findByPk(req.params.id);
      await modelo.destroy({ where: { [pk]: req.params.id } });
      if (registro) camposArchivo.forEach((n) => quitarArchivo(registro[n]));
      res.redirect(`/${ruta}?mensaje=${encodeURIComponent('Registro eliminado')}`);
    } catch (err) {
      res.redirect(`/${ruta}?error=${encodeURIComponent(mensajeError(err))}`);
    }
  };

  return { lista, verCrear, guardar, editar, actualizar, eliminar };
}
