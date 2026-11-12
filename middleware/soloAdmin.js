// Autorización: solo el rol "admin" puede continuar
const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).render('error', { titulo: 'Acceso denegado', mensaje: 'No tienes permisos para esta acción.' });
  }
  next();
};

export default soloAdmin;
