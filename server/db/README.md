# HeartGuard Database Management

This document provides instructions for managing the HeartGuard database, including running migrations, backups, and restores.

## Database Migrations

### Running Migrations

To apply pending migrations to your database:

```bash
# Using Drizzle Kit
npx drizzle-kit migrate

# Or using the custom migration script
npm run migrate
```

### Creating New Migrations

To create a new migration:

1. Create a new SQL file in the `migrations/` directory
2. Follow the naming convention: `YYYYMMDD_HHMMSS_<short_description>.sql`
3. Include both UP and DOWN sections in your migration

Example migration file:
```sql
-- Migration: 20241016_120000_add_example_table.sql
-- UP
CREATE TABLE example_table (
  id VARCHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

-- DOWN
DROP TABLE example_table;
```

### Migration Testing

To test migrations on a local database:

```bash
# Run migration tests
npm run test:migrations

# Run schema health checks
npm run check:schema
```

## Database Backup and Recovery

### Creating Backups

To create a full database backup:

```bash
# Using the backup script
./scripts/backup-database.sh

# Or manually with mysqldump
mysqldump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --events \
  -h localhost \
  -P 3307 \
  -u root \
  heartguard > backup.sql
```

### Restoring from Backup

To restore from a backup:

```bash
# Using the restore command
gunzip < /backups/heartguard/heartguard_full_20241015_020000.sql.gz | mysql -h localhost -P 3307 -u root heartguard

# Or from an uncompressed backup
mysql -h localhost -P 3307 -u root heartguard < backup.sql
```

## Database Monitoring

### Performance Metrics

Monitor these key metrics:
- Slow query count
- Longest running query time
- Connection count and usage
- InnoDB buffer pool hit ratio
- Disk I/O operations

### Schema Health Checks

Run weekly schema health reports:
```sql
-- Check for missing foreign keys
SELECT 
  'Missing Foreign Keys' AS check_type,
  COUNT(*) AS issue_count
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME IS NULL 
  AND TABLE_SCHEMA='heartguard';

-- Check for unused indexes
SELECT 
  'Unused Indexes' AS check_type,
  COUNT(*) AS issue_count
FROM information_schema.statistics s
LEFT JOIN information_schema.table_constraints tc
  ON s.index_name = tc.constraint_name
  AND s.table_schema = tc.table_schema
WHERE s.table_schema = 'heartguard'
  AND s.index_name != 'PRIMARY'
  AND tc.constraint_name IS NULL
  AND s.cardinality = 0;
```

## Troubleshooting

### Common Issues

1. **Migration failures**: Check the database logs and run the DOWN script for the failed migration
2. **Connection issues**: Verify the database is running and connection parameters are correct
3. **Performance issues**: Check slow query logs and index usage

### Emergency Procedures

1. **Database restore**: Follow the restore procedure in the backup section
2. **Rollback failed migration**: Run the DOWN script for the problematic migration
3. **High connection usage**: Check for connection leaks in the application code

## NPM Scripts

The following npm scripts are available for database operations:

- `npm run test:migrations` - Run migration tests
- `npm run check:schema` - Run schema health checks
- `npm run validate:data` - Run data validation scripts

## Contact

For database-related issues, contact the development team.

- Database Administrator: dba@heartguard.com
- Development Team Lead: lead-dev@heartguard.com