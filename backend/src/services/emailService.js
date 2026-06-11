const transporter = require('../config/mailer');

const enviarCorreoCotizacionPublica = async ({ cliente, cotizacion, datos }) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('ADMIN_EMAIL no está configurado');
    return;
  }

  const mailOptions = {
    from: `"CC Motors" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: 'Nueva cotización en revisión - CC Motors',
    text: `
Se ha recibido una nueva solicitud de cotización desde la website pública de CC Motors.

Estado: En revisión

Datos del cliente:
Nombre: ${cliente.nombre}
Apellido: ${cliente.apellido}
Documento: ${cliente.documento}
Teléfono: ${cliente.telefono}
Correo: ${cliente.correo}
Dirección: ${cliente.direccion}

Datos del vehículo:
ID Vehículo: ${cotizacion.id_vehiculo}
Precio estimado: ${cotizacion.precio_estimado}

Mensaje del cliente:
${datos.mensaje || 'Sin mensaje'}

La cotización quedó registrada en el sistema administrativo para su revisión.
    `
  };

  console.log('Intentando enviar correo...');
  console.log('ADMIN_EMAIL:', adminEmail);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);

  const info = await transporter.sendMail(mailOptions);

  console.log('Correo enviado correctamente:', info.messageId);
};

module.exports = {
  enviarCorreoCotizacionPublica
};