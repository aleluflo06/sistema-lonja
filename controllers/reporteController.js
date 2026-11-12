import { Op } from 'sequelize';
import { Compra, Comprador, Lote, Especie } from '../models/index.js';
import { hoy, inicioFin } from '../helpers/formato.js';

export const diario = async (req, res) => {
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(req.query.fecha || '') ? req.query.fecha : hoy();
  const { inicio, fin } = inicioFin(fecha);

  const compras = await Compra.findAll({
    where: { fecha: { [Op.between]: [inicio, fin] } },
    include: [
      { model: Comprador, as: 'comprador' },
      { model: Lote, as: 'lote', include: [{ model: Especie, as: 'especies' }] },
    ],
    order: [['fecha', 'ASC']],
  });

  let totalKilos = 0;
  let totalImporte = 0;
  const porComprador = {};
  for (const c of compras) {
    const kilos = Number(c.lote.kilos);
    const importe = Number(c.precio_total);
    totalKilos += kilos;
    totalImporte += importe;
    const r = (porComprador[c.codigo_cpr] ??= {
      nombre: `${c.comprador.nombre} ${c.comprador.apellido_paterno}`, compras: 0, kilos: 0, importe: 0,
    });
    r.compras += 1; r.kilos += kilos; r.importe += importe;
  }

  res.render('reportes/diario', {
    titulo: 'Reporte diario', fecha, compras, totalKilos, totalImporte, resumen: Object.values(porComprador),
  });
};
