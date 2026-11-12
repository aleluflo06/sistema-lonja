import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destino = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(destino, { recursive: true });

const extensiones = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, destino),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + extensiones[file.mimetype]),
  }),
  fileFilter: (req, file, cb) =>
    extensiones[file.mimetype] ? cb(null, true) : cb(new Error('La imagen debe ser JPG, PNG, WEBP o GIF')),
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('imagen');

// No lanza el error: lo deja en req.errorSubida para mostrarlo en el formulario
export default (req, res, next) =>
  upload(req, res, (err) => {
    if (err) req.errorSubida = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen no debe pasar de 2 MB' : err.message;
    next();
  });
