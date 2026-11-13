import express from 'express';
import { lista, eliminar } from '../controllers/usuarioController.js';
import soloAdmin from '../middleware/soloAdmin.js';

const router = express.Router();
router.use(soloAdmin);
router.get('/', lista);
router.delete('/:id', eliminar);

export default router;