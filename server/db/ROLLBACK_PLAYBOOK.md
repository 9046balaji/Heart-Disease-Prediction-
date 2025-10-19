# Database Rollback Playbook

This document provides step-by-step instructions for rolling back database migrations in case of failures.

## Emergency Rollback Procedures

### 1. Identify the Problematic Migration

1. Check application logs for error messages
2. Identify the most recent migration that was applied
3. Determine if the migration failed during UP or DOWN execution

### 2. Stop Application Services

```bash
# Stop the application services to prevent further database access
sudo systemctl stop heartguard-app
```

### 3. Backup Current Database State

Before performing any rollback operations, create a backup of the current database state:

```bash
# Create a backup with timestamp
mysqldump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  -h localhost \
  -P 3307 \
  -u root \
  heartguard > heartguard_rollback_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 4. Execute Rollback

#### For a Single Failed Migration

1. Locate the migration file for the failed migration
2. Execute the DOWN section of the migration:

```sql
-- Run the DOWN script for the failed migration
-- Example:
-- Extract and run only the DOWN section from the migration file
-- mysql -h localhost -P 3307 -u root heartguard < migration_file_down_section.sql
```

Or using the command line:
```bash
# Extract and run only the DOWN section from the migration file
# This is a simplified example - in practice, you would parse the SQL file
# and extract only the DOWN portion
# mysql -h localhost -P 3307 -u root heartguard < migration_file_down_section.sql
```

#### For Multiple Migrations

1. Identify all migrations that need to be rolled back
2. Execute the DOWN sections in reverse order (most recent first)

```bash
# Example rollback sequence
# Extract and run only the DOWN sections from the migration files in reverse order
# This is a simplified example - in practice, you would parse the SQL files
# and extract only the DOWN portions
# mysql -h localhost -P 3307 -u root heartguard < migration_1203_down_section.sql
# mysql -h localhost -P 3307 -u root heartguard < migration_1202_down_section.sql
# mysql -h localhost -P 3307 -u root heartguard < migration_1201_down_section.sql
# mysql -h localhost -P 3307 -u root heartguard < migration_1200_down_section.sql
```

### 5. Verify Rollback Success

After executing the rollback:

1. Check database schema matches expected state
2. Validate data integrity
3. Run smoke tests to ensure basic functionality

```sql
-- Check table structure
SHOW TABLES;

-- Check constraints
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'heartguard';

-- Check indexes
SHOW INDEX FROM food_logs;
```

### 6. Run Validation Tests

```bash
# Run data validation scripts
npm run validate:data

# Run application tests
npm run test
```

### 7. Resume Services

Once rollback is confirmed successful:

1. Start application services
2. Monitor for issues
3. Notify stakeholders

```bash
# Start the application services
sudo systemctl start heartguard-app

# Monitor application logs
tail -f /var/log/heartguard/app.log
```

## Specific Rollback Scenarios

### Schema Normalization Rollback

If normalization migrations need to be rolled back:

1. Execute DOWN scripts in reverse order
2. Verify JSON columns are restored with data
3. Check foreign key constraints are removed

### Index Addition Rollback

If index additions cause performance issues:

1. Drop the problematic indexes
2. Monitor query performance
3. Consider alternative indexing strategies

### Partitioning Rollback

If partitioning causes issues:

1. Merge partitions back to single table
2. Rebuild indexes
3. Validate data integrity

## Contact Information

For critical rollback situations, contact:

- Database Administrator: dba@heartguard.com
- Development Team Lead: lead-dev@heartguard.com
- Infrastructure Team: infra@heartguard.com

## Appendices

### A. Common MySQL Commands for Rollback

```sql
-- Show current database schema
SHOW TABLES;

-- Show table structure
DESCRIBE table_name;

-- Show constraints
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'heartguard' AND TABLE_NAME = 'table_name';

-- Show indexes
SHOW INDEX FROM table_name;

-- Drop a constraint
ALTER TABLE table_name DROP FOREIGN KEY constraint_name;

-- Drop an index
DROP INDEX index_name ON table_name;
```

### B. Emergency Contact List

- Primary DBA: dba@heartguard.com
- Secondary DBA: backup-dba@heartguard.com
- DevOps Team: devops@heartguard.com
- Management Escalation: ctod@heartguard.com