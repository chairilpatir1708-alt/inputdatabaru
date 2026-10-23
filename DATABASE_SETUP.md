# Database Setup Guide

## Prerequisites

Before setting up the database, ensure you have:

1. **PostgreSQL** installed and running (version 12 or higher recommended)
2. **Node.js** and **npm** installed
3. All project dependencies installed:
   ```bash
   npm install
   ```

## Step 1: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and update the database connection strings:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/arsip_pbb"
   DIRECT_URL="postgresql://username:password@localhost:5432/arsip_pbb"
   ```

   Replace:
   - `username` with your PostgreSQL username
   - `password` with your PostgreSQL password
   - `localhost:5432` with your PostgreSQL host and port
   - `arsip_pbb` with your desired database name

3. Set a secure authentication secret (minimum 32 characters):
   ```env
   AUTH_SECRET="your-secure-random-string-here-min-32-chars"
   ```

   You can generate a secure random string using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. Configure the initial admin credentials:
   ```env
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="your-secure-password-here"
   ADMIN_NAME="Administrator"
   ```

## Step 2: Create the Database

Create the PostgreSQL database if it doesn't exist:

```sql
CREATE DATABASE arsip_pbb;
```

Or using psql command line:
```bash
createdb arsip_pbb
```

## Step 3: Run Database Migrations

Apply the database schema by running:

```bash
npx prisma migrate deploy
```

This will:
- Create all tables (arsip_sppt, arsip_stts, kecamatan, desa, admin_user)
- Set up all indexes and constraints
- Establish foreign key relationships

## Step 4: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view the database structure.

Alternatively, you can run:
```bash
npx prisma db pull
```

## Step 5: Seed Initial Data

After migrations are complete, run the seed script to populate initial data:

```bash
npm run db:seed
```

This will create:
- Three Kecamatan records (Caringin, Cigombong, Cijeruk)
- 30 Desa records across the three Kecamatan
- Initial admin user account

## Troubleshooting

### Connection Refused Error

If you get a connection refused error:
1. Check that PostgreSQL is running
2. Verify the host and port in DATABASE_URL
3. Ensure the database user has proper permissions

### Authentication Failed

If authentication fails:
1. Verify the username and password in DATABASE_URL
2. Check PostgreSQL pg_hba.conf for authentication settings
3. Ensure the user has CREATE privileges on the database

### Database Does Not Exist

If the database doesn't exist:
1. Create it using `createdb arsip_pbb` or via SQL
2. Make sure the database name in DATABASE_URL matches

### Migration Already Applied

If you see "migration already applied":
- The migration has already been run successfully
- No action needed unless you want to reset the database

To reset the database (⚠️ will delete all data):
```bash
npx prisma migrate reset
```

## Production Deployment

For production environments (e.g., Vercel):

1. Set up a PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
2. Configure DATABASE_URL and DIRECT_URL in the platform's environment variables
3. Run migrations after deployment:
   ```bash
   npx prisma migrate deploy
   ```
4. Ensure AUTH_SECRET is a strong, unique value in production
5. Set secure admin credentials

## Next Steps

After database setup:
1. ✅ Database schema created
2. ⏭️ Initial data seeded
3. ⏭️ Import historical SPPT/STTS data (if available)
4. ⏭️ Start the development server: `npm run dev`
5. ⏭️ Access admin panel at: http://localhost:3000/admin/login

## Migration Files

Migration files are located in: `prisma/migrations/`

Current migrations:
- `20240101000000_init` - Initial database schema

See `prisma/migrations/README.md` for more details about migrations.
