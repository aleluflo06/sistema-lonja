import { Usuario } from '../models/index.js';

const volver = (res, msg, esError = false) =>
  res.redirect(`/usuarios?${esError ? 'error' : 'mensaje'}=${encodeURIComponent(msg)}`);

export const lista = async (req, res) => {
  const usuarios = await Usuario.scope('sinClave').findAll({ order: [['id', 'DESC']] });
  res.render('usuarios/lista', {
    titulo: 'Usuarios', usuarios, mensaje: req.query.mensaje || null, error: req.query.error || null,
  });
};

export const eliminar = async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return volver(res, 'No puedes eliminarte a ti mismo', true);
  await Usuario.destroy({ where: { id: req.params.id } });
  return volver(res, 'Usuario eliminado');
};