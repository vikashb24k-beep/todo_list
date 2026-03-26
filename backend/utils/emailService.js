const nodemailer = require("nodemailer");

const MAIL_PROVIDER = (process.env.MAIL_PROVIDER || "resend").toLowerCase();
const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

const transporter =
  MAIL_PROVIDER === "smtp"
    ? nodemailer.createTransport({
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
      })
    : null;

async function sendViaResend({ to, subject, text }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API failed (${response.status}): ${body}`);
  }
}

async function sendViaSmtp({ to, subject, text }) {
  if (!transporter) {
    throw new Error("SMTP transporter is not configured");
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
  });
}

async function sendTaskReminderEmail({ to, name, title }) {
  const payload = {
    to,
    subject: "Reminder: Task Due",
    text: `Hey ${name}, it's time to: ${title}`,
  };

  if (MAIL_PROVIDER === "resend") {
    await sendViaResend(payload);
    return;
  }

  await sendViaSmtp(payload);
}

async function verifyEmailTransport() {
  if (MAIL_PROVIDER === "resend") {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[MAIL] RESEND_API_KEY is missing. Email reminders are disabled.");
      return;
    }

    if (!EMAIL_FROM) {
      console.warn("[MAIL] EMAIL_FROM is missing. Email reminders are disabled.");
      return;
    }

    console.log(`[MAIL] Provider=resend from=${EMAIL_FROM}`);
    return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[MAIL] EMAIL_USER or EMAIL_PASS is missing. Email reminders are disabled.");
    return;
  }

  try {
    await transporter.verify();
    console.log(
      `[MAIL] Provider=smtp ready host=${SMTP_HOST} port=${SMTP_PORT} secure=${SMTP_SECURE}`
    );
  } catch (error) {
    console.error(`[MAIL] SMTP verify failed: ${error.message}`);
  }
}

module.exports = {
  sendTaskReminderEmail,
  verifyEmailTransport,
};
