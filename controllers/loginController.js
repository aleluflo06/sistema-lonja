import { Op } from 'sequelize';
import { body, validationResult } from 'express-validator';
import { idGenera, JWTGenera } from '../helpers/tokens.js';
import { correoRegistro } from '../helpers/correos.js';
import { hoy, inicioFin } from '../helpers/formato.js';
import { Usuario, Compra, Lote } from '../models/index.js';

export const reglasRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 60 }).withMessage('El nombre admite máximo 60 caracteres'),
  body('email').trim().toLowerCase().isEmail().withMessage('El correo no es válido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('password2').custom((v, { req }) => v === req.body.password).withMessage('Las contraseñas no coinciden'),
];

export const reglasLogin = [
  body('email').trim().toLowerCase().notEmpty().withMessage('El correo no debe ser vacío'),
  body('password').notEmpty().withMessage('El password no debe ser vacío'),
];

const vistaLogin = (res, errores = [], mensaje = null) =>
  res.render('login/login', { titulo: 'Iniciar sesión', mensaje, errores });

export const login = (req, res) => vistaLogin(res);

const vistaRegistro = (res, persona = null, errores = []) =>
  res.render('login/loginformulario', { titulo: 'Registro', persona, errores });

export const verRegistro = (req, res) => vistaRegistro(res);

export const registrologin = async (req, res) => {
  const val = validationResult(req);
  if (!val.isEmpty()) return vistaRegistro(res, req.body, val.array().map((e) => e.msg));

  const { nombre, email, password } = req.body;
  if (await Usuario.findOne({ where: { email } })) {
    return vistaRegistro(res, req.body, ['El correo ya está registrado']);
  }

  const token = idGenera();
  await Usuario.create({ nombre, email, password, rol: 'usuario', token });
  correoRegistro({ nombre, email, token }).catch((e) => console.error('No se pudo enviar el correo:', e.message));

  res.render('login/confirmacion', {
    titulo: 'Registro',
    pagina: 'Revisa tu correo',
    mensaje: 'Te enviamos un enlace para confirmar tu cuenta. Después, un administrador deberá autorizar tu acceso.',
    enlace: '/',
  });
};

export const confirmarIncripcionEnlace = async (req, res) => {
  const persona = await Usuario.findOne({ where: { token: req.params.token } });
  if (!persona) {
    return res.render('login/confirmacion', {
      titulo: 'Confirmación',
      pagina: 'No se pudo confirmar tu cuenta',
      mensaje: 'El enlace no es válido o ya fue utilizado.',
      enlace: '/',
    });
  }
  persona.token = null;
  persona.confirmar = true;
  await persona.save();

  res.render('login/confirmacion', {
    titulo: 'Confirmación',
    pagina: 'Cuenta confirmada',
    mensaje: 'Tu correo fue confirmado. Un administrador debe autorizar tu acceso antes de que puedas entrar.',
    enlace: '/',
  });
};

export const credenciales = async (req, res) => {
  const val = validationResult(req);
  if (!val.isEmpty()) return vistaLogin(res, val.array(), 'Credenciales no válidas');

  const { email, password } = req.body;
  const us = await Usuario.findOne({ where: { email } });

  if (!us || !(await us.verificandoClave(password))) {
    return vistaLogin(res, [{ msg: 'Revisa las credenciales' }], 'Credenciales no válidas');
  }
  if (!us.confirmar) {
    return vistaLogin(res, [{ msg: 'Tu cuenta no tiene confirmación, revisa tu correo' }], 'Acceso denegado');
  }
  if (!us.autorizado) {
    return vistaLogin(res, [{ msg: 'Un administrador aún no autoriza tu acceso' }], 'Acceso denegado');
  }

  const token = JWTGenera({ id: us.id, nombre: us.nombre, rol: us.rol });
  return res
    .cookie('_token', token, {
      httpOnly: true, // no accesible desde JavaScript del navegador
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // true cuando haya HTTPS
      maxAge: 2 * 60 * 60 * 1000, // 2 horas
    })
    .redirect('/inicio');
};

export const principal = async (req, res) => {
  const { inicio, fin } = inicioFin(hoy());
  const comprasHoy = await Compra.findAll({ where: { fecha: { [Op.between]: [inicio, fin] } } });
  const lotesDisponibles = await Lote.count({
    include: [{ model: Compra, as: 'compra', required: false, attributes: [] }],
    where: { '$compra.id_cmp$': null },
    distinct: true,
    col: 'id_lte',
  });
  const totalHoy = comprasHoy.reduce((s, c) => s + Number(c.precio_total), 0);
  res.render('index', { titulo: 'Inicio', numCompras: comprasHoy.length, totalHoy, lotesDisponibles });
};

export const cerrarsesion = (req, res) => {
  res.clearCookie('_token', { httpOnly: true, sameSite: 'lax' });
  return res.redirect('/');
};
