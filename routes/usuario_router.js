import express from 'express';
import { lista, alternarAutorizacion, eliminar } from '../controllers/usuarioController.js';
import soloAdmin from '../middleware/soloAdmin.js';

const router = express.Router();
router.use(soloAdmin);
router.get('/', lista);
router.put('/:id/autorizar', alternarAutorizacion);
router.delete('/:id', eliminar);

export default router;
