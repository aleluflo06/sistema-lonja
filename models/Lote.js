import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Lote = db.define('Lote', {
  id_lte: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  kilos: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  numero_cajas: { type: DataTypes.SMALLINT, allowNull: false },
  precio_kilo_salida: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, // visible para compradores
}, { tableName: 'lote' });

export default Lote;
