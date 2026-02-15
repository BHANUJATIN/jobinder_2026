const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

async function sendVerificationEmail(to, token) {
  const url = `${env.frontendUrl}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Verify your email - Jobinder',
    html: `
      <h2>Welcome to Jobinder!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Verify Email</a>
      <p>Or copy this link: ${url}</p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

async function sendPasswordResetEmail(to, token) {
  const url = `${env.frontendUrl}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Reset your password - Jobinder',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>Or copy this link: ${url}</p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
