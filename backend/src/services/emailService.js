import nodemailer from 'nodemailer';

let transporter = null;
let isEthereal = false;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    isEthereal = process.env.SMTP_HOST.includes('ethereal');
    const port = parseInt(process.env.SMTP_PORT || '587');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`[Email] SMTP: ${process.env.SMTP_HOST}:${port}`);
    if (isEthereal) {
      console.log(`[Email] Inbox: https://ethereal.email/messages`);
    }
  } else {
    const testAccount = await nodemailer.createTestAccount();
    isEthereal = true;
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Ethereal: ${testAccount.user} / ${testAccount.pass}`);
  }

  return transporter;
}

// Use SMTP_FROM env var, fallback to onboarding@resend.dev for Resend, or noreply for others
function getFromAddress() {
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM;
  if (process.env.SMTP_HOST?.includes('resend')) return '"PickUp Time" <onboarding@resend.dev>';
  return '"PickUp Time" <noreply@pickuptime.app>';
}

export async function sendVerificationCode(to, code) {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: getFromAddress(),
    to,
    subject: `Tu codigo de verificacion: ${code}`,
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 420px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #D946EF); border-radius: 12px; padding: 12px 16px;">
            <span style="color: white; font-size: 20px; font-weight: bold; letter-spacing: -0.5px;">PT</span>
          </div>
        </div>
        <h2 style="text-align: center; color: #1a1a1a; font-size: 22px; margin-bottom: 8px;">Verifica tu email</h2>
        <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 32px;">
          Ingresa este codigo en PickUp Time para continuar con tu registro.
        </p>
        <div style="text-align: center; background: #F5F3FF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7C3AED;">${code}</span>
        </div>
        <p style="text-align: center; color: #999; font-size: 12px;">
          Este codigo expira en 10 minutos.<br/>
          Si no solicitaste esto, ignora este email.
        </p>
      </div>
    `,
  });

  let previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (!previewUrl && isEthereal) {
    previewUrl = 'https://ethereal.email/messages';
  }

  if (previewUrl) {
    console.log(`[Email] Preview: ${previewUrl}`);
  }
  console.log(`[Email] Sent to ${to}, messageId: ${info.messageId}`);

  return { messageId: info.messageId, previewUrl };
}
