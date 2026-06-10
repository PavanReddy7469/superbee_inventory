// Helper middleware to perform action audit logging to the database
async function auditLog(pool, req, action, resource, resourceId, description) {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.headers ? req.headers['user-agent'] : null;
    const userId = req.user ? req.user.id : null;

    // FIX-09: Record state-modifying actions and authentication events in audit_logs table
    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, target_resource, resource_id, 
        description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, resource, resourceId || null, 
       description, ipAddress, userAgent || null]
    );
  } catch (err) {
    console.error(`[ERROR] Audit logging failed for action ${action}:`, err.message);
  }
}

module.exports = auditLog;
