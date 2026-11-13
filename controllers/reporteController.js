import { Compra, Comprador, Lote, Especie } from '../models/index.js';
import { aInput } from '../helpers/formato.js';
import { rangoDe, filtroFecha } from '../helpers/rango.js';

// Reporte de los días dentro del rango: /reportes/diario?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
// (sin parámetros = hoy; ?fecha=AAAA-MM-DD sigue funcionando como un solo día)
export const diario = async (req, res) => {
  const { desde, hasta } = rangoDe(req.query, true);

  const compras = await Compra.findAll({
    where: filtroFecha({ desde, hasta }),
    include: [
      { model: Comprador, as: 'comprador' },
      { model: Lote, as: 'lote', include: [{ model: Especie, as: 'especies' }] },
    ],
    order: [['fecha', 'ASC']],
  });

  let totalKilos = 0;
  let totalImporte = 0;
  const porDia = {};
  const porComprador = {};
  for (const c of compras) {
    const kilos = Number(c.lote.kilos);
    const importe = Number(c.precio_total);
    totalKilos += kilos;
    totalImporte += importe;

    // Agrupa por día (en la zona horaria de la lonja); salen en orden porque las compras vienen ordenadas
    const dia = aInput(c.fecha).slice(0, 10);
    const d = (porDia[dia] ??= { fecha: dia, compras: [], kilos: 0, importe: 0 });
    d.compras.push(c); d.kilos += kilos; d.importe += importe;

    const r = (porComprador[c.codigo_cpr] ??= {
      nombre: `${c.comprador.nombre} ${c.comprador.apellido_paterno}`, compras: 0, kilos: 0, importe: 0,
    });
    r.compras += 1; r.kilos += kilos; r.importe += importe;
  }

  res.render('reportes/diario', {
    titulo: 'Reporte diario', desde, hasta, compras, dias: Object.values(porDia),
    totalKilos, totalImporte, resumen: Object.values(porComprador),
  });
};