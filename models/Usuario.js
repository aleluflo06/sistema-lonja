import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

const Usuario = db.define(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(60), allowNull: false },
    email: { type: DataTypes.STRING(80), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(100), allowNull: false },
    rol: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'usuario' }, // admin | usuario
    confirmar: { type: DataTypes.BOOLEAN, defaultValue: false }, // correo confirmado
    autorizado: { type: DataTypes.BOOLEAN, defaultValue: false }, // autorizado por el administrador
    token: { type: DataTypes.STRING(64), allowNull: true },
  },
  {
    tableName: 'usuario',
    hooks: {
      beforeCreate: async (u) => { u.password = await bcrypt.hash(u.password, 10); },
      beforeUpdate: async (u) => { if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10); },
    },
    scopes: { sinClave: { attributes: { exclude: ['password', 'token'] } } },
  }
);

Usuario.prototype.verificandoClave = function (password) {
  return bcrypt.compare(password, this.password);
};

export default Usuario;
