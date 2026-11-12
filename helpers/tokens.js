import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const idGenera = () => crypto.randomBytes(16).toString('hex');

const JWTGenera = (info) =>
  jwt.sign({ id: info.id, nombre: info.nombre, rol: info.rol }, process.env.SC_JWT, { expiresIn: '2h' });

export { idGenera, JWTGenera };
