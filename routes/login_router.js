import express from 'express';
import {
  login, verRegistro, registrologin, confirmarIncripcionEnlace, credenciales, principal, cerrarsesion,
  reglasRegistro, reglasLogin,
} from '../controllers/loginController.js';
import rutaProteger from '../middleware/protegerRutas.js';

const router_login = express.Router();

router_login.get('/', login);
router_login.get('/ver_registro', verRegistro);
router_login.post('/registrar_login', reglasRegistro, registrologin);
router_login.get('/confirmarinscripcion/:token', confirmarIncripcionEnlace);
router_login.post('/credenciales', reglasLogin, credenciales);
router_login.get('/inicio', rutaProteger, principal);
router_login.get('/cerrarsesion', cerrarsesion);

export default router_login;
