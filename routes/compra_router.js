import express from 'express';
import { lista, verCrear, guardar, eliminar, reglasCompra } from '../controllers/compraController.js';
import soloAdmin from '../middleware/soloAdmin.js';

const router = express.Router();
router.get('/', lista);
router.get('/crear', verCrear);
router.post('/', reglasCompra, guardar);
router.delete('/:id', soloAdmin, eliminar);

export default router;
