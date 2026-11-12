import express from 'express';
import { diario } from '../controllers/reporteController.js';

const router = express.Router();
router.get('/diario', diario);

export default router;
