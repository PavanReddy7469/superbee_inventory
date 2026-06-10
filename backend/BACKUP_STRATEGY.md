# Backup Strategy — SBA-IMS

## Automated Backups (Azure MySQL Flexible Server)
- Automated backups: enabled, retention 7 days
- Geo-redundant backup: enabled
- Point-in-time restore: available within retention window

## Manual Backup Before Migrations
mysqldump -u sba_app -p superbee_ims > backup_$(date +%Y%m%d_%H%M%S).sql

## Backup Verification (run monthly)
- Restore to a staging instance
- Verify row counts match production
- Verify app boots successfully against restored DB

## Secrets Rotation Policy
- JWT_SECRET: rotate every 90 days
- DB_PASSWORD: rotate every 90 days
- After rotation: restart app server to pick up new env vars
- JWT rotation invalidates all active sessions (users re-login)
