const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
});

async function sendTaskReminderEmail({ to, name, title }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Reminder: Task Due",
    text: `Hey ${name}, it's time to: ${title}`,
  };

  await transporter.sendMail(mailOptions);
}

async function verifyEmailTransport() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[MAIL] EMAIL_USER or EMAIL_PASS is missing. Email reminders are disabled.");
    return;
  }

  try {
    await transporter.verify();
    console.log(
      `[MAIL] SMTP connection ready host=${SMTP_HOST} port=${SMTP_PORT} secure=${SMTP_SECURE}`
    );
  } catch (error) {
    console.error(`[MAIL] SMTP verify failed: ${error.message}`);
  }
}

module.exports = {
  sendTaskReminderEmail,
  verifyEmailTransport,
};
