import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const {
      nombre,
      email,
      destino,
      personas,
      fechas,
      mensaje,
      website,
      form_start
    } = req.body || {};

    // Antispam: honeypot
    if (website) {
      return res.status(400).json({ ok: false, error: "Bot detectado" });
    }

    // Antispam: tiempo mínimo
    if (Date.now() - Number(form_start) < 1500) {
      return res.status(400).json({ ok: false, error: "Bot detectado" });
    }

    // Validación básica
    if (!nombre || !email || !destino || !personas || !fechas || !mensaje) {
      return res.status(400).json({ ok: false, error: "Faltan campos" });
    }

    await resend.emails.send({
      from: "Txector Routes <no-reply@txectorroutes.com>",
      to: "txectorroutes@gmail.com",
      reply_to: email,
      subject: `Nuevo mensaje de ${nombre}`,
      html: `
        <h2>Nuevo mensaje desde el formulario</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Destino:</strong> ${destino}</p>
        <p><strong>Personas:</strong> ${personas}</p>
        <p><strong>Fechas:</strong> ${fechas}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Error al enviar el correo" });
  }
}
