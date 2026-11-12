import nodemailer from 'nodemailer';

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const correoRegistro = async ({ nombre, email, token }) => {
  const enlace = `${process.env.URL_BACKEND}:${process.env.PORT_BACKEND}/confirmarinscripcion/${token}`;

  // Sin credenciales de correo: se muestra el enlace en la consola (útil en desarrollo)
  if (!process.env.CORREO_USER || !process.env.CORREO_PASS) {
    console.log(`[CORREO NO CONFIGURADO] Enlace de confirmación para ${email}: ${enlace}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.CORREO_HOST,
    port: Number(process.env.CORREO_PORT),
    secure: false,
    auth: { user: process.env.CORREO_USER, pass: process.env.CORREO_PASS },
  });

  await transport.sendMail({
    from: `"Lonja Veracruz" <${process.env.CORREO_USER}>`,
    to: email,
    subject: 'Confirma tu registro en Lonja Veracruz',
    html: `
      <p>Hola ${esc(nombre)}, para terminar tu registro confirma tu cuenta:</p>
      <p><a href="${enlace}">Confirmar cuenta</a></p>
      <p>Si no solicitaste el registro, ignora este mensaje.</p>`,
  });
};

export { correoRegistro };
