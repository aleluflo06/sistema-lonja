import { body, validationResult } from 'express-validator';
import { Compra, Lote, Comprador, Especie, Tipo } from '../models/index.js';
import { rangoDe, filtroFecha } from '../helpers/rango.js';
import { mensajeError } from './crudFactory.js';

const volver = (res, ruta, msg, esError = false) =>
  res.redirect(`${ruta}?${esError ? 'error' : 'mensaje'}=${encodeURIComponent(msg)}`);

// El comprador del usuario se enlaza por correo (el correo ya fue confirmado al registrarse)
export const requerirComprador = async (req, res, next) => {
  const comprador = await Comprador.findOne({ where: { correo: req.usuario.email } });
  if (!comprador) return res.redirect('/portal/perfil');
  req.comprador = comprador;
  next();
};

// ---------- Mis datos (crea o actualiza el comprador) ----------
export const reglasPerfil = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 15 }).withMessage('El nombre admite máximo 15 caracteres'),
  body('apellido_paterno').trim().notEmpty().withMessage('El apellido paterno es obligatorio').bail()
    .isLength({ max: 15 }).withMessage('El apellido paterno admite máximo 15 caracteres'),
  body('apellido_materno').trim().optional({ values: 'falsy' })
    .isLength({ max: 15 }).withMessage('El apellido materno admite máximo 15 caracteres'),
  body('direccion').trim().notEmpty().withMessage('La dirección es obligatoria').bail()
    .isLength({ max: 200 }).withMessage('La dirección admite máximo 200 caracteres'),
];

export const verPerfil = async (req, res) => {
  const existente = await Comprador.findOne({ where: { correo: req.usuario.email } });
  res.render('portal/perfil', {
    titulo: 'Mis datos',
    registro: existente || { nombre: req.usuario.nombre.slice(0, 15) },
    nuevo: !existente, errores: [], mensaje: req.query.mensaje || null,
  });
};

export const guardarPerfil = async (req, res) => {
  const errores = validationResult(req).array().map((e) => e.msg);
  const existente = await Comprador.findOne({ where: { correo: req.usuario.email } });

  if (!errores.length) {
    try {
      const { nombre, apellido_paterno, apellido_materno, direccion } = req.body;
      const datos = { nombre, apellido_paterno, apellido_materno: apellido_materno || null, direccion };
      if (existente) await existente.update(datos);
      else await Comprador.create({ ...datos, correo: req.usuario.email });
      return res.redirect(existente
        ? '/portal/perfil?mensaje=' + encodeURIComponent('Datos actualizados')
        : '/portal/comprar');
    } catch (err) {
      errores.push(mensajeError(err));
    }
  }
  res.status(422).render('portal/perfil', {
    titulo: 'Mis datos', registro: req.body, nuevo: !existente, errores, mensaje: null,
  });
};

// ---------- Comprar: lotes activos que todavía no se compran ----------
export const verCatalogo = async (req, res) => {
  const lotes = await Lote.findAll({
    where: { activo: true, '$compra.id_cmp$': null },
    include: [
      { model: Compra, as: 'compra', required: false, attributes: [] },
      { model: Especie, as: 'especies', separate: true, include: [{ model: Tipo, as: 'tipo' }] },
    ],
    order: [['id_lte', 'DESC']],
  });
  res.render('portal/comprar', {
    titulo: 'Comprar', lotes, mensaje: req.query.mensaje || null, error: req.query.error || null,
  });
};

export const comprar = async (req, res) => {
  try {
    const lote = await Lote.findByPk(req.params.id, { include: [{ model: Compra, as: 'compra', required: false }] });
    if (!lote || !lote.activo) return volver(res, '/portal/comprar', 'Ese lote ya no está disponible', true);
    if (lote.compra) return volver(res, '/portal/comprar', 'Ese lote ya fue comprado', true);

    const total = (Number(lote.kilos) * Number(lote.precio_kilo_salida)).toFixed(2);
    await Compra.create({
      id_cmp: lote.id_lte,
      codigo_cpr: req.comprador.codigo_cpr,
      precio_kilo_final: lote.precio_kilo_salida, // el comprador paga el precio de salida
      precio_total: total,
      fecha: new Date(),
    });
    return volver(res, '/portal/historial', `Compraste el lote #${lote.id_lte}`);
  } catch (err) {
    // id_cmp es llave primaria: si dos personas compran a la vez, solo una entra
    if (err.name === 'SequelizeUniqueConstraintError') return volver(res, '/portal/comprar', 'Ese lote ya fue comprado', true);
    return volver(res, '/portal/comprar', mensajeError(err), true);
  }
};

// ---------- Historial de compras (solo las del comprador, con rango opcional) ----------
export const historial = async (req, res) => {
  const { desde, hasta } = rangoDe(req.query);
  const compras = await Compra.findAll({
    where: { codigo_cpr: req.comprador.codigo_cpr, ...filtroFecha({ desde, hasta }) },
    include: [{ model: Lote, as: 'lote', include: [{ model: Especie, as: 'especies' }] }],
    order: [['fecha', 'DESC']],
  });
  const total = compras.reduce((s, c) => s + Number(c.precio_total), 0);
  res.render('portal/historial', {
    titulo: 'Historial de compras', compras, total, desde: desde || '', hasta: hasta || '',
    mensaje: req.query.mensaje || null,
  });
};