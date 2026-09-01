// POST /api/contact — receives the contact form and emails the lead to
// Inplant, so every consultation is captured even if the visitor never
// finishes the WhatsApp step. Runs as a Vercel serverless function
// (Node.js runtime) — no server to manage, deploys with the static site.

const { Resend } = require('resend');

const MAX_LEN = { name: 120, phone: 40, query: 2000 };

function clean(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[\r\n]+/g, ' ').slice(0, maxLen);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = req.body || {};
  const name = clean(body.name, MAX_LEN.name);
  const phone = clean(body.phone, MAX_LEN.phone);
  // query keeps its own newlines (multi-line textarea) — only trim/cap it.
  const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_LEN.query) : '';

  if (!name || !phone || !query) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  const resend = new Resend(apiKey);
  const toEmail = process.env.CONTACT_TO_EMAIL || 'hola@inplant.com.ar';
  // onboarding@resend.dev works without a verified domain — swap for a
  // real @inplant.com.ar address once the domain is verified in Resend.
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Inplant Web <onboarding@resend.dev>';

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: undefined, // the form doesn't collect an email, phone is the callback channel
      subject: `Nueva consulta de ${name} — sitio web`,
      text: `Nombre: ${name}\nTeléfono: ${phone}\n\nConsulta:\n${query}`,
      html: `
        <div style="font-family:sans-serif;font-size:15px;color:#2A2A2A;line-height:1.6">
          <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
          <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Consulta:</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(query)}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#888;font-size:12px">Enviado desde el formulario de contacto de inplant.com.ar</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ ok: false, error: 'email_provider_error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Unexpected error sending contact email:', err);
    return res.status(500).json({ ok: false, error: 'unexpected_error' });
  }
};
