# Arsip Data PBB Next.js

Aplikasi web untuk mengelola dan menampilkan data arsip SPPT (Surat Pemberitahuan Pajak Terutang) dan STTS (Surat Tanda Terima Setoran) dari tiga kecamatan.

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: bcryptjs + jose (JWT)
- **Validation**: zod
- **Excel Export**: exceljs
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="your-secret-key-here"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
ADMIN_NAME="Administrator"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Seed the database:
```bash
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
├── (public)/              # Public-facing pages
├── (panel)/              # Admin panel
│   └── admin/
├── api/                  # Route handlers
├── actions/              # Server Actions
components/               # Reusable UI components
lib/                      # Utilities and configurations
prisma/                   # Database schema and migrations
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct PostgreSQL connection (for migrations)
- `AUTH_SECRET`: Secret key for JWT signing
- `ADMIN_USERNAME`: Initial admin username
- `ADMIN_PASSWORD`: Initial admin password
- `ADMIN_NAME`: Initial admin display name

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

The build command should be: `prisma generate && next build`
