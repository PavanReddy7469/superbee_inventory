/**
 * Email HTML templates for Superbee Aeronautics Inventory System
 */

const LOGO_URL = 'https://inventory.superbeeaeronautics.com/assets/superbee-BJ9dWAlS.png';

const baseTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
    .header img { height: 40px; margin-bottom: 8px; vertical-align: middle; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; tracking-wide; color: #ffffff; text-transform: uppercase; }
    .content { padding: 32px 24px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .table th { background: #f1f5f9; text-align: left; padding: 10px 12px; color: #475569; font-weight: 600; border-bottom: 1px solid #cbd5e1; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; text-align: center; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-indigo { background: #e0e7ff; color: #3730a3; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Superbee Aeronautics</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Inventory Management System</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0;">Superbee Aeronautics &copy; ${new Date().getFullYear()}. All rights reserved.</p>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">This is an automated system message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Welcome Email Template for New User
 */
exports.welcomeTemplate = ({ name, email, password, role_name, employee_id, designation }) => {
  const title = 'Welcome to Superbee Inventory System';
  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">Hello ${name},</h2>
    <p>Your user account has been successfully created in the <strong>Superbee Aeronautics Inventory Management System</strong>.</p>
    
    <div class="card">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">Your Account Details</h3>
      <table class="table" style="margin: 0;">
        <tr>
          <td style="font-weight: 600; width: 140px; color: #64748b;">Full Name</td>
          <td style="color: #0f172a;">${name}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">Login Email</td>
          <td style="color: #0f172a; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">Temporary Password</td>
          <td style="color: #4f46e5; font-family: monospace; font-size: 15px; font-weight: 700;">${password}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">Assigned Role</td>
          <td><span class="badge badge-indigo">${role_name || 'User'}</span></td>
        </tr>
        ${employee_id ? `<tr><td style="font-weight: 600; color: #64748b;">Employee ID</td><td style="color: #0f172a;">${employee_id}</td></tr>` : ''}
        ${designation ? `<tr><td style="font-weight: 600; color: #64748b;">Designation</td><td style="color: #0f172a;">${designation}</td></tr>` : ''}
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b; background: #fffbeeb; border-left: 4px solid #f59e0b; padding: 10px 12px; border-radius: 4px;">
      ⚠️ <strong>Security Notice:</strong> You will be prompted to change your password upon your initial login. Please keep your credentials secure.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://inventory.superbeeaeronautics.com/login" class="btn">Login to Inventory Portal</a>
    </div>
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
      <tr>
        <td style="text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="font-weight: 600; color: #0f172a;">${item.part_name || item.part_id || 'Part'}</td>
        <td style="font-family: monospace; color: #64748b;">${item.sku || '-'}</td>
        <td style="text-align: center; font-weight: 700; color: #4f46e5;">${item.quantity}</td>
      </tr>
    `).join('');
  } else {
    itemsTableRows = `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No items listed</td></tr>`;
  }

  const formattedDate = created_at ? new Date(created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const bodyContent = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="margin: 0; color: #0f172a; font-size: 18px;">🚨 New Procurement Request</h2>
    </div>
    <p style="margin-top: 4px;">A new part procurement request has been submitted by <strong>${requested_by || 'Assembly Engineer'}</strong> and requires admin review.</p>

    <div class="card">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Drone & Request Information</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; width: 120px;">Drone Number:</td>
          <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${drone_number}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">UIN Number:</td>
          <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${uin_number}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Requested By:</td>
          <td style="padding: 4px 0; color: #0f172a;">${requested_by}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;">Date & Time:</td>
          <td style="padding: 4px 0; color: #64748b; font-size: 13px;">${formattedDate} IST</td>
        </tr>
        ${notes ? `<tr><td style="padding: 4px 0; color: #64748b;">Notes / Purpose:</td><td style="padding: 4px 0; color: #334155; font-style: italic;">${notes}</td></tr>` : ''}
      </table>
    </div>

    <h3 style="margin-top: 24px; margin-bottom: 8px; font-size: 15px; color: #0f172a;">Requested Parts List</h3>
    <table class="table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>Part Name</th>
          <th>SKU</th>
          <th style="width: 70px; text-align: center;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTableRows}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 28px;">
      <a href="https://inventory.superbeeaeronautics.com/dashboard/ae-requests" class="btn">View & Approve Request in Portal</a>
    </div>
  `;

  return baseTemplate(title, bodyContent);
};
