import { Usuario } from '../models/index.js';

const volver = (res, msg, esError = false) =>
  res.redirect(`/usuarios?${esError ? 'error' : 'mensaje'}=${encodeURIComponent(msg)}`);

export const lista = async (req, res) => {
  const usuarios = await Usuario.scope('sinClave').findAll({ order: [['id', 'DESC']] });
  res.render('usuarios/lista', {
    titulo: 'Usuarios', usuarios, mensaje: req.query.mensaje || null, error: req.query.error || null,
  });
};

// Autoriza o revoca el acceso (al autorizar también se da por confirmado el correo)
export const alternarAutorizacion = async (req, res) => {
  const u = await Usuario.findByPk(req.params.id);
  if (!u) return volver(res, 'El usuario no existe', true);
  if (u.id === req.usuario.id) return volver(res, 'No puedes cambiar tu propio acceso', true);
  u.autorizado = !u.autorizado;
  if (u.autorizado) { u.confirmar = true; u.token = null; }
  await u.save();
  return volver(res, u.autorizado ? 'Usuario autorizado' : 'Acceso revocado');
};

export const eliminar = async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return volver(res, 'No puedes eliminarte a ti mismo', true);
  await Usuario.destroy({ where: { id: req.params.id } });
  return volver(res, 'Usuario eliminado');
};
