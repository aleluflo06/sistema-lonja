import { Tipo, Comprador, Lote, Especie, Compra } from '../models/index.js';
import { aVista, dinero } from '../helpers/formato.js';

// Definición de los catálogos (cada uno genera su CRUD completo)
export default {
  tipos: {
    modelo: Tipo, pk: 'id_tpo', ruta: 'tipos', titulo: 'Tipos de especie', singular: 'tipo',
    campos: [{ name: 'nombre', label: 'Nombre', type: 'text', required: true, max: 30 }],
    columnas: [
      { label: 'ID', val: (r) => r.id_tpo },
      { label: 'Nombre', val: (r) => r.nombre },
    ],
  },

  compradores: {
    modelo: Comprador, pk: 'codigo_cpr', ruta: 'compradores', titulo: 'Compradores', singular: 'comprador',
    campos: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, max: 15 },
      { name: 'apellido_paterno', label: 'Apellido paterno', type: 'text', required: true, max: 15 },
      { name: 'apellido_materno', label: 'Apellido materno', type: 'text', max: 15 },
      { name: 'direccion', label: 'Dirección', type: 'text', required: true, max: 200 },
      { name: 'correo', label: 'Correo', type: 'email', required: true, max: 80 },
    ],
    columnas: [
      { label: 'Código', val: (r) => r.codigo_cpr },
      { label: 'Nombre', val: (r) => `${r.nombre} ${r.apellido_paterno} ${r.apellido_materno ?? ''}` },
      { label: 'Dirección', val: (r) => r.direccion },
      { label: 'Correo', val: (r) => r.correo },
    ],
  },

  lotes: {
    modelo: Lote, pk: 'id_lte', ruta: 'lotes', titulo: 'Lotes', singular: 'lote',
    include: [{ model: Compra, as: 'compra', required: false }],
    // Un lote comprado no se edita: cambiaría los kilos y el reporte ya no coincidiría con el total cobrado
    puedeEditar: (r) => !r.compra,
    bloquearEdicion: async (r) => ((await Compra.findByPk(r.id_lte))
      ? 'Este lote ya fue comprado y no se puede modificar. Si hubo un error, un administrador debe eliminar primero la compra.'
      : null),
    campos: [
      { name: 'kilos', label: 'Kilos', type: 'number', required: true, min: 0.01, maxNum: 99999999.99 },
      { name: 'numero_cajas', label: 'Número de cajas', type: 'number', entero: true, required: true, min: 1, maxNum: 32767 },
      { name: 'precio_kilo_salida', label: 'Precio por kilo de salida', type: 'number', required: true, min: 0.01, maxNum: 99999999.99 },
      { name: 'fecha', label: 'Fecha y hora', type: 'datetime-local', required: true, ahora: true },
    ],
    columnas: [
      { label: 'Lote', val: (r) => `#${r.id_lte}` },
      { label: 'Kilos', val: (r) => r.kilos },
      { label: 'Cajas', val: (r) => r.numero_cajas },
      { label: 'Precio salida/kg', val: (r) => dinero(r.precio_kilo_salida) },
      { label: 'Fecha', val: (r) => aVista(r.fecha) },
      { label: 'Estado', val: (r) => (r.compra ? 'Comprado' : 'Disponible') },
    ],
  },

  especies: {
    modelo: Especie, pk: 'id_epe', ruta: 'especies', titulo: 'Especies', singular: 'especie',
    include: [{ model: Tipo, as: 'tipo' }, { model: Lote, as: 'lote' }],
    campos: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, max: 25 },
      {
        name: 'id_lte', label: 'Lote', type: 'select', required: true,
        opciones: async () => (await Lote.findAll({ order: [['id_lte', 'DESC']] }))
          .map((l) => ({ value: l.id_lte, label: `Lote #${l.id_lte} (${l.kilos} kg)` })),
      },
      {
        name: 'id_tpo', label: 'Tipo', type: 'select', required: true,
        opciones: async () => (await Tipo.findAll({ order: [['nombre', 'ASC']] }))
          .map((t) => ({ value: t.id_tpo, label: t.nombre })),
      },
      { name: 'imagen', label: 'Imagen', type: 'file' },
    ],
    columnas: [
      { label: 'ID', val: (r) => r.id_epe },
      { label: 'Imagen', val: (r) => r.imagen, tipo: 'img' },
      { label: 'Nombre', val: (r) => r.nombre },
      { label: 'Tipo', val: (r) => r.tipo?.nombre },
      { label: 'Lote', val: (r) => `#${r.id_lte}` },
    ],
  },
};
