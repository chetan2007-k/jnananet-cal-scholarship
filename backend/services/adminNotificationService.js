const nodemailer = require("nodemailer");

const OFFICIAL_EMAIL = "jnananet.team@gmail.com";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER || OFFICIAL_EMAIL;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;

  if (!smtpPassword) {
    throw new Error("SMTP_APP_PASSWORD is not configured for admin email notifications.");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  return transporter;
}

function getAdminEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || OFFICIAL_EMAIL;
}

async function sendSupportTicketNotification({
  studentName = "Student",
  userEmail = "Not provided",
  category = "General",
  message = "",
}) {
  const smtpUser = process.env.SMTP_USER || OFFICIAL_EMAIL;
  const adminEmail = getAdminEmail();

  const text = `A new support ticket has been submitted.

Student Name: ${studentName}
Email: ${userEmail}
Category: ${category}
Message: ${message}

Please check the admin panel for more details.

JnanaNet System Notification`;

  await getTransporter().sendMail({
    from: `JnanaNet Team <${smtpUser}>`,
    to: adminEmail,
    subject: "New Support Ticket – JnanaNet",
    text,
  });
}

async function sendContactFormNotification({
  name = "Visitor",
  email = "Not provided",
  message = "",
}) {
  const smtpUser = process.env.SMTP_USER || OFFICIAL_EMAIL;
  const adminEmail = getAdminEmail();

  const text = `A new contact form message has been received.

Name: ${name}
Email: ${email}
Message: ${message}

Please review and respond if needed.`;

  await getTransporter().sendMail({
    from: `JnanaNet Team <${smtpUser}>`,
    to: adminEmail,
    subject: "New Contact Form Submission – JnanaNet",
    text,
  });
}

module.exports = {
  sendSupportTicketNotification,
  sendContactFormNotification,
};
