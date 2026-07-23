const nodemailer = require('nodemailer');
const { welcomeTemplate, procurementRequestTemplate } = require('./emailTemplates');

/**
 * Configure Nodemailer SMTP Transporter
 * Defaulting to Google Workspace SMTP (smtp.gmail.com:587)
 */
function createTransporter() {
  const mailUser = process.env.MAIL_USER || 'info@superbeeaeronautics.com';
  const mailPass = process.env.MAIL_APP_PASSWORD;

  if (!mailPass) {
    console.warn('[EMAIL WARNING] MAIL_APP_PASSWORD environment variable is missing. Emails will not be delivered.');
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: mailUser,
      pass: mailPass
    },
    tls: {
      rejectUnauthorized: false // Ensure compatibility with corporate proxies/firewalls
    }
  });
}

/**
 * 1. Send Welcome Email to Newly Created User
 */
async function sendWelcomeEmail(user, plainPassword) {
  try {
    if (!user || !user.email) {
      console.error('[EMAIL ERROR] Cannot send welcome email: missing user email.');
      return;
    }

    const transporter = createTransporter();
    const mailFrom = process.env.MAIL_FROM || 'Superbee Aeronautics <info@superbeeaeronautics.com>';
    const htmlContent = welcomeTemplate({
      name: user.name,
      email: user.email,
      password: plainPassword,
      role_name: user.role_name,
      employee_id: user.employee_id,
      designation: user.designation
    });

    const info = await transporter.sendMail({
      from: mailFrom,
      to: user.email,
      subject: 'Welcome to Superbee Aeronautics Inventory Management System',
      html: htmlContent
    });

    console.log(`[EMAIL SUCCESS] Welcome email sent to ${user.email} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send welcome email to ${user?.email}:`, error.message);
  }
}

/**
 * 2. Send Procurement Request Alert Email to Admins
 */
async function sendProcurementRequestAlert(requestDetails, adminEmails) {
  try {
    if (!adminEmails || !Array.isArray(adminEmails) || adminEmails.length === 0) {
      console.warn('[EMAIL WARNING] No admin emails provided for procurement request alert.');
      return;
    }

    const transporter = createTransporter();
    const mailFrom = process.env.MAIL_FROM || 'Superbee Aeronautics <info@superbeeaeronautics.com>';
    const htmlContent = procurementRequestTemplate(requestDetails);

    const info = await transporter.sendMail({
      from: mailFrom,
      to: adminEmails.join(', '),
      subject: `[ALERT] New Procurement Request for Drone ${requestDetails.drone_number} (${requestDetails.uin_number})`,
      html: htmlContent
    });

    console.log(`[EMAIL SUCCESS] Procurement request alert sent to ${adminEmails.join(', ')} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send procurement request alert email:', error.message);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendProcurementRequestAlert
};
