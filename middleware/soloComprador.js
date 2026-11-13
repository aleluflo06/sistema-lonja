// El portal de comprador es para usuarios con rol "usuario"; el admin vuelve a su panel
const soloComprador = (req, res, next) => {
  if (req.usuario?.rol !== 'usuario') return res.redirect('/inicio');
  next();
};

export default soloComprador;