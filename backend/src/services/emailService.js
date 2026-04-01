import nodemailer from 'nodemailer';

let transporter = null;
let isEthereal = false;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    isEthereal = process.env.SMTP_HOST.includes('ethereal');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    if (isEthereal) {
      console.log(`[Email] Using Ethereal: ${process.env.SMTP_USER}`);
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
    console.log(`[Email] Ethereal test account: ${testAccount.user} / ${testAccount.pass}`);
  }

  return transporter;
}

export async function sendVerificationCode(to, code) {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: '"PickUp Time" <noreply@pickuptime.app>',
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

  // Build preview URL for Ethereal
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
