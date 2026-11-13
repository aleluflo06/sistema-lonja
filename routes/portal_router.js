import express from 'express';
import {
  requerirComprador, verPerfil, guardarPerfil, reglasPerfil, verCatalogo, comprar, historial,
} from '../controllers/portalController.js';
import soloComprador from '../middleware/soloComprador.js';

const router = express.Router();
router.use(soloComprador);
router.get('/', (req, res) => res.redirect('/portal/comprar'));
router.get('/perfil', verPerfil);
router.post('/perfil', reglasPerfil, guardarPerfil);
router.get('/comprar', requerirComprador, verCatalogo);
router.post('/comprar/:id', requerirComprador, comprar);
router.get('/historial', requerirComprador, historial);

export default router;