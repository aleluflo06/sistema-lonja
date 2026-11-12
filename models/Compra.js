import { DataTypes } from 'sequelize';
import db from '../config/db.js';

// Relación 1 a 1 con Lote: id_cmp es PK y a la vez FK de lote.id_lte
const Compra = db.define('Compra', {
  id_cmp: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  codigo_cpr: { type: DataTypes.SMALLINT, allowNull: false },
  precio_kilo_final: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  precio_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'compra' });

export default Compra;
