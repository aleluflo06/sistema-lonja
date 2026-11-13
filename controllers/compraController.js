import { body, validationResult } from 'express-validator';
import { Compra, Lote, Comprador, Especie } from '../models/index.js';
import { desdeInput } from '../helpers/formato.js';
import { rangoDe, filtroFecha } from '../helpers/rango.js';
import { mensajeError } from './crudFactory.js';

export const reglasCompra = [
  body('id_cmp').trim().isInt({ min: 1 }).withMessage('Selecciona un lote'),
  body('codigo_cpr').trim().isInt({ min: 1 }).withMessage('Selecciona un comprador'),
  body('precio_kilo_final').trim().isFloat({ gt: 0, max: 99999999 }).withMessage('El precio por kilo final debe ser mayor a 0'),
  body('fecha').trim().isISO8601().withMessage('La fecha no es válida'),
];

// Solo lotes que todavía no tienen compra
const datosFormulario = async () => {
  const lotes = await Lote.findAll({
    include: [
      { model: Compra, as: 'compra', required: false, attributes: [] },
      { model: Especie, as: 'especies', separate: true },
    ],
    where: { '$compra.id_cmp$': null },
    order: [['id_lte', 'DESC']],
  });
  const compradores = await Comprador.findAll({ order: [['nombre', 'ASC']] });
  return { lotes, compradores };
};

export const lista = async (req, res) => {
  const { desde, hasta } = rangoDe(req.query); // rango opcional: ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
  const compras = await Compra.findAll({
    where: filtroFecha({ desde, hasta }),
    include: [{ model: Comprador, as: 'comprador' }, { model: Lote, as: 'lote' }],
    order: [['fecha', 'DESC']],
  });
  const total = compras.reduce((s, c) => s + Number(c.precio_total), 0);
  res.render('compras/lista', {
    titulo: 'Compras', compras, total, desde: desde || '', hasta: hasta || '',
    mensaje: req.query.mensaje || null, error: req.query.error || null,
  });
};

export const verCrear = async (req, res) => {
  res.render('compras/formulario', {
    titulo: 'Registrar compra', ...(await datosFormulario()), registro: { fecha: new Date() }, errores: [],
  });
};

export const guardar = async (req, res) => {
  const errores = validationResult(req).array().map((e) => e.msg);

  if (!errores.length) {
    try {
      const { id_cmp, codigo_cpr, precio_kilo_final, fecha } = req.body;
      const lote = await Lote.findByPk(id_cmp, { include: [{ model: Compra, as: 'compra' }] });
      const comprador = await Comprador.findByPk(codigo_cpr);
      if (!lote) errores.push('El lote no existe');
      else if (lote.compra) errores.push('Ese lote ya fue comprado');
      if (!comprador) errores.push('El comprador no existe');

      if (!errores.length) {
        const total = (Number(lote.kilos) * Number(precio_kilo_final)).toFixed(2);
        await Compra.create({
          id_cmp: lote.id_lte,
          codigo_cpr: comprador.codigo_cpr,
          precio_kilo_final,
          precio_total: total,
          fecha: desdeInput(fecha),
        });
        return res.redirect('/compras?mensaje=' + encodeURIComponent('Compra registrada'));
      }
    } catch (err) {
      errores.push(mensajeError(err));
    }
  }
  res.status(422).render('compras/formulario', {
    titulo: 'Registrar compra', ...(await datosFormulario()), registro: req.body, errores,
  });
};

export const eliminar = async (req, res) => {
  await Compra.destroy({ where: { id_cmp: req.params.id } });
  res.redirect('/compras?mensaje=' + encodeURIComponent('Compra eliminada'));
};
