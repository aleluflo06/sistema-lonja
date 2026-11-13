import { Op } from 'sequelize';
import { hoy, inicioFin } from './formato.js';

const esFecha = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(new Date(`${s}T00:00:00Z`));

// Lee ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD (también acepta ?fecha= como un solo día).
// obligatorio = true  -> si no mandan nada usa el día de hoy (reporte)
// obligatorio = false -> el rango puede quedar abierto (listas)
export const rangoDe = (q = {}, obligatorio = false) => {
  let desde = esFecha(q.desde) ? q.desde : (esFecha(q.fecha) ? q.fecha : null);
  let hasta = esFecha(q.hasta) ? q.hasta : (esFecha(q.fecha) ? q.fecha : null);
  if (obligatorio) { desde ??= hasta ?? hoy(); hasta ??= desde; }
  if (desde && hasta && desde > hasta) [desde, hasta] = [hasta, desde];
  return { desde, hasta };
};

// Condición de Sequelize para la columna "fecha" de compra
export const filtroFecha = ({ desde, hasta }) => {
  const f = {};
  if (desde) f[Op.gte] = inicioFin(desde).inicio;
  if (hasta) f[Op.lte] = inicioFin(hasta).fin;
  return desde || hasta ? { fecha: f } : {};
};