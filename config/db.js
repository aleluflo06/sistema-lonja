import 'dotenv/config';
import { Sequelize } from 'sequelize';

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USUARIO, process.env.BD_CLAVE, {
  dialect: process.env.BD_DIALEC || 'mariadb',
  host: process.env.BD_HOST || '127.0.0.1',
  port: Number(process.env.BD_PORT || 3306),
  timezone: process.env.ZONA_OFFSET || '-06:00',
  define: { timestamps: false, freezeTableName: true },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: false,
});

export default db;
