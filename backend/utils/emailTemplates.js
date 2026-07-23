/**
 * Email HTML templates for Superbee Aeronautics Inventory System
 * Fully inline-styled for 100% compatibility with Mobile Gmail, Outlook, Apple Mail & Webmail.
 */

const LOGO_URL = 'https://inventory.superbeeaeronautics.com/assets/superbee-BJ9dWAlS.png';

const baseTemplate = (title, bodyContent) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);">
          
          <!-- Top Header with Dark Navy & Gold Border Accent -->
          <tr>
            <td align="center" style="background-color: #0f172a; padding: 30px 20px; border-bottom: 4px solid #f59e0b;">
              <img src="${LOGO_URL}" alt="Superbee Aeronautics" style="height: 48px; width: auto; display: block; margin-bottom: 10px;" />
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">SUPERBEE AERONAUTICS</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 500; letter-spacing: 0.5px;">INVENTORY MANAGEMENT PORTAL</p>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 32px 28px; background-color: #ffffff;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #475569;">Superbee Aeronautics &copy; ${new Date().getFullYear()}. All rights reserved.</p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">This is an automated system notification. Please do not reply directly to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Welcome Email Template for New User
 */
exports.welcomeTemplate = ({ name, email, password, role_name, employee_id, designation }) => {
  const title = 'Welcome to Superbee Inventory System';
  const roleDisplay = (role_name || 'User').toUpperCase();
  
  const bodyContent = `
    <!-- Greeting -->
    <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Hello ${name}, 👋</h2>
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.6;">
      Welcome aboard! Your user account has been successfully created in the <strong>Superbee Aeronautics Inventory Management System</strong>. Below are your official account credentials and details:
    </p>

    <!-- Account Details Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px; background-color: #e0e7ff; border-bottom: 1px solid #c7d2fe; border-top-left-radius: 11px; border-top-right-radius: 11px;">
          <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #3730a3; text-transform: uppercase; letter-spacing: 0.8px;">🔑 YOUR ACCOUNT CREDENTIALS</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Full Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Login Email:</td>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 700; font-size: 15px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Temporary Password:</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; background-color: #e0e7ff; color: #4338ca; padding: 6px 14px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 800; border: 1px solid #c7d2fe; letter-spacing: 1px;">${password}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Assigned Role:</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; background-color: #0f172a; color: #f59e0b; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${roleDisplay}</span>
              </td>
            </tr>
            ${employee_id ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Employee ID:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${employee_id}</td>
            </tr>` : ''}
            ${designation ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Designation:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${designation}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <!-- Security Warning Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 28px;">
      <tr>
        <td style="padding: 14px 16px; font-size: 13px; color: #92400e; line-height: 1.5;">
          ⚠️ <strong>Security Notice:</strong> You will be prompted to update your password immediately upon your initial login. Please keep these credentials confidential.
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://inventory.superbeeaeronautics.com/login" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">Login to Portal &rarr;</a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(title, bodyContent);
};

/**
 * 2. Procurement Request Admin Alert Template
 */
exports.procurementRequestTemplate = ({ drone_number, uin_number, items, requested_by, created_at, notes }) => {
  const title = 'New Procurement Request Submitted';

  let itemsTableRows = '';
  if (Array.isArray(items) && items.length > 0) {
    itemsTableRows = items.map((item, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td align="center" style="padding: 10px 12px; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.part_name || item.part_id || 'Part'}</td>
        <td style="padding: 10px 12px; font-family: 'Courier New', Courier, monospace; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${item.sku || '-'}</td>
        <td align="center" style="padding: 10px 12px; font-weight: 800; color: #4f46e5; border-bottom: 1px solid #e2e8f0; font-size: 15px;">${item.quantity}</td>
      </tr>
    `).join('');
  } else {
    itemsTableRows = `
      <tr>
        <td colspan="4" align="center" style="padding: 16px; color: #94a3b8; font-size: 13px;">No items specified</td>
      </tr>
    `;
  }

  const formattedDate = created_at ? new Date(created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const bodyContent = `
    <!-- Header Badge -->
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🚨 ACTION REQUIRED</span>
      <h2 style="margin: 10px 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 800;">New Procurement Request Submitted</h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">A new part procurement request has been submitted by <strong>${requested_by || 'Assembly Engineer'}</strong> and is awaiting your approval.</p>
    </div>

    <!-- Details Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px; background-color: #0f172a; border-top-left-radius: 11px; border-top-right-radius: 11px;">
          <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.8px;">📋 REQUEST INFORMATION</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 18px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 130px;">Drone Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800; font-size: 15px;">${drone_number}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">UIN Number:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${uin_number}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Requested By:</td>
              <td style="padding: 6px 0; color: #334155; font-weight: 600;">${requested_by}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Date & Time:</td>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px;">${formattedDate} IST</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Notes:</td>
              <td style="padding: 6px 0; color: #334155; font-style: italic;">${notes}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
    </table>

    <!-- Requested Parts Table -->
    <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Requested Parts Breakdown</h3>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
      <thead>
        <tr style="background-color: #0f172a;">
          <th align="center" style="padding: 10px 12px; color: #f8fafc; font-size: 12px; font-weight: 700; text-transform: uppercase; width: 40px;">#</th>
          <th align="left" style="padding: 10px 12px; color: #f8fafc; font-size: 12px; font-weight: 700; text-transform: uppercase;">Part Name</th>
          <th align="left" style="padding: 10px 12px; color: #f8fafc; font-size: 12px; font-weight: 700; text-transform: uppercase;">SKU</th>
          <th align="center" style="padding: 10px 12px; color: #f8fafc; font-size: 12px; font-weight: 700; text-transform: uppercase; width: 60px;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTableRows}
      </tbody>
    </table>

    <!-- Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://inventory.superbeeaeronautics.com/dashboard/ae-requests" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">Review Request in Portal &rarr;</a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(title, bodyContent);
};
