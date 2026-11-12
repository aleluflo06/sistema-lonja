import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Especie = db.define('Especie', {
  id_epe: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(25), allowNull: false },
  id_lte: { type: DataTypes.INTEGER, allowNull: false },
  id_tpo: { type: DataTypes.SMALLINT, allowNull: false },
  imagen: { type: DataTypes.STRING(100), allowNull: true },
}, { tableName: 'especie' });

export default Especie;
