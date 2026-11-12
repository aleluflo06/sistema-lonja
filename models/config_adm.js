import { Usuario } from './index.js';

// Crea el administrador inicial si no existe (datos en .env)
async function createInitialAdmin() {
  const { ADMIN_NOMBRE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('No se definieron ADMIN_EMAIL o ADMIN_PASSWORD. Saltando creación de admin.');
    return;
  }
  try {
    const existe = await Usuario.findOne({ where: { email: ADMIN_EMAIL.toLowerCase() } });
    if (existe) {
      console.log('El usuario administrador ya existe. No se requiere acción.');
      return;
    }
    await Usuario.create({
      nombre: ADMIN_NOMBRE || 'Administrador',
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      rol: 'admin',
      confirmar: true,
      autorizado: true,
    });
    console.log('Usuario administrador inicial creado exitosamente.');
  } catch (error) {
    console.error('Error al crear el usuario administrador inicial:', error);
  }
}

export default createInitialAdmin;
