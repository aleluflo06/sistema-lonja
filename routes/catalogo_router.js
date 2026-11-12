import express from 'express';
import crearCatalogo, { reglas } from '../controllers/crudFactory.js';
import soloAdmin from '../middleware/soloAdmin.js';
import subirImagen from '../middleware/subirImagen.js';

// Router de un catálogo a partir de su configuración
export default function catalogoRouter(cfg) {
  const c = crearCatalogo(cfg);
  const router = express.Router();
  const validar = reglas(cfg.campos);

  router.get('/', c.lista);
  router.get('/crear', c.verCrear);
  router.post('/', subirImagen, validar, c.guardar);
  router.get('/:id/editar', c.editar);
  router.put('/:id', subirImagen, validar, c.actualizar);
  router.delete('/:id', soloAdmin, c.eliminar);
  return router;
}
