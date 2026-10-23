# Database Migrations

## Initial Migration (init)

This directory contains the initial database migration for the Arsip PBB application.

### Migration Details

**Migration:** `20240101000000_init`

This migration creates the following tables:
- `arsip_sppt` - Stores SPPT (Surat Pemberitahuan Pajak Terutang) archive data
- `arsip_stts` - Stores STTS (Surat Tanda Terima Setoran) archive data
- `kecamatan` - Master data for districts
- `desa` - Master data for villages (with foreign key to kecamatan)
- `admin_user` - Admin user authentication data

### Running Migrations

⚠️ **IMPORTANT:** Before running migrations, ensure you have:

1. A PostgreSQL database instance running and accessible
2. Set up the `.env` file with proper database credentials:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database"
   DIRECT_URL="postgresql://username:password@host:port/database"
   ```

3. Installed all dependencies including Prisma:
   ```bash
   npm install
   ```

### To Apply Migrations

When the database is available, run:

```bash
npx prisma migrate deploy
```

Or for development environment with interactive prompts:

```bash
npx prisma migrate dev
```

### Verifying Migrations

After running migrations, verify the database schema:

```bash
npx prisma db pull
```

### Reset Database (Development Only)

To reset the database and reapply all migrations:

```bash
npx prisma migrate reset
```

⚠️ **WARNING:** This will delete all data in the database!

## Migration Requirements

This migration satisfies the following requirements from the specification:
- Requirement 1.1: ArsipSppt model with all fields and constraints
- Requirement 1.2: ArsipStts model with identical structure
- Requirement 1.3: Kecamatan model with relation to Desa
- Requirement 1.4: Desa model with foreign key to Kecamatan (onDelete: Cascade)
- Requirement 1.5: AdminUser model for authentication

## Next Steps

After running migrations:
1. Run the seed script to populate initial data (`npm run db:seed`)
2. Import historical data from SQLite database if available
3. Create the initial admin user account
