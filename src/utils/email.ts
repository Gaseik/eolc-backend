import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });
} 