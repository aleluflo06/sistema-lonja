import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// Autenticación: revisa que exista un token válido; si no, manda al inicio
const rutaProteger = async (req, res, next) => {
  const { _token } = req.cookies;
  if (!_token) return res.redirect('/');

  try {
    const decoded = jwt.verify(_token, process.env.SC_JWT);
    const usuario = await Usuario.scope('sinClave').findByPk(decoded.id);
    if (!usuario || !usuario.confirmar) return res.clearCookie('_token').redirect('/');
    req.usuario = usuario;
    res.locals.usuario = usuario;
    return next();
  } catch (error) {
    return res.clearCookie('_token').redirect('/');
  }
};

export default rutaProteger;
