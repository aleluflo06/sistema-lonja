import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import db from './config/db.js';
import './models/index.js';
import createInitialAdmin from './models/config_adm.js';
import catalogos from './config/catalogos.js';
import { aInput, aVista, dinero } from './helpers/formato.js';

import rutaProteger from './middleware/protegerRutas.js';
import soloAdmin from './middleware/soloAdmin.js';
import router_login from './routes/login_router.js';
import catalogoRouter from './routes/catalogo_router.js';
import router_compras from './routes/compra_router.js';
import router_reportes from './routes/reporte_router.js';
import router_usuarios from './routes/usuario_router.js';
import router_portal from './routes/portal_router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Crear la aplicación
const app = express();

// Accesos a los datos del formulario
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Habilitar cookie parser
app.use(cookieParser());
// Permite PUT/DELETE 
app.use(methodOverride('_method'));

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ayudantes disponibles en todas las vistas
app.locals.aInput = aInput;
app.locals.aVista = aVista;
app.locals.dinero = dinero;

// Carpeta pública y Bootstrap
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));

// Routing
app.use('/', router_login);
for (const cfg of Object.values(catalogos)) {
  app.use(`/${cfg.ruta}`, rutaProteger, soloAdmin, catalogoRouter(cfg));
}
app.use('/compras', rutaProteger, soloAdmin, router_compras);
app.use('/reportes', rutaProteger, soloAdmin, router_reportes);
app.use('/usuarios', rutaProteger, router_usuarios);
app.use('/portal', rutaProteger, router_portal);

// 404 y errores
app.use((req, res) => res.status(404).render('error', { titulo: 'No encontrado', mensaje: 'La página no existe.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { titulo: 'Error', mensaje: 'Ocurrió un error interno del servidor.' });
});

const port = Number(process.env.PORT_BACKEND || 2800);

(async () => {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida.');
    await db.sync({ alter: process.env.DB_SYNC_ALTER === 'true' }); // crea las tablas si no existen
    console.log('Modelos sincronizados.');
    await createInitialAdmin();
    app.listen(port, () => console.log(`Esperando peticiones en http://localhost:${port}`));
  } catch (err) {
    console.error('Error al iniciar:', err);
  }
})();
