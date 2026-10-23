# Design Document: Arsip Data PBB Next.js

## Overview

### Purpose

The Arsip Data PBB application is a migration from Laravel to Next.js that manages and displays archival data for two types of tax documents: SPPT (Surat Pemberitahuan Pajak Terutang) and STTS (Surat Tanda Terima Setoran) across three districts. The system tracks document counts per year, per district, per village, categorized into 5 "Buku" categories based on tax amounts.

### Goals

- Migrate existing Laravel application to modern Next.js stack
- Maintain data integrity during migration from SQLite to PostgreSQL
- Provide public access to view and export tax archive data
- Enable administrators to manage data and master records securely
- Deploy to Vercel's free tier with optimal performance

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ App Router | Server-side rendering, routing, and API |
| Language | TypeScript | Type safety and developer experience |
| Styling | Tailwind CSS | Responsive utility-first styling |
| Database | PostgreSQL | Relational data storage |
| ORM | Prisma | Type-safe database access |
| Authentication | bcryptjs + jose | Password hashing and JWT tokens |
| Validation | zod | Runtime schema validation |
| Excel Export | exceljs | Spreadsheet generation |
| Deployment | Vercel | Hosting and serverless functions |

### Key Design Principles

1. **Server-First Architecture**: Leverage Next.js server components for data fetching to reduce client bundle size
2. **Component Reusability**: Share common UI components between SPPT and STTS features
3. **Type Safety**: Use TypeScript and Prisma for end-to-end type safety
4. **Security by Default**: JWT in httpOnly cookies, middleware protection, input validation
5. **Performance**: Database query optimization, proper indexing, dynamic rendering
6. **Indonesian Localization**: Number formatting with dot separators, Indonesian error messages

---

## Architecture

### Application Structure

The application follows Next.js 14+ App Router conventions with route groups for organizational separation:

```
app/
├── (public)/              # Public-facing pages (no auth required)
│   ├── page.tsx          # SPPT archive view at /
│   ├── stts/
│   │   └── page.tsx      # STTS archive view at /stts
│   └── layout.tsx        # Public layout with minimal chrome
│
├── (panel)/              # Admin panel (auth required)
│   └── admin/
│       ├── login/
│       │   └── page.tsx  # Login page
│       ├── dashboard/
│       │   └── page.tsx  # Admin dashboard
│       ├── data/
│       │   └── page.tsx  # SPPT data management
│       ├── data-stts/
│       │   └── page.tsx  # STTS data management
│       ├── tahun/
│       │   └── page.tsx  # SPPT year management
│       ├── tahun-stts/
│       │   └── page.tsx  # STTS year management
│       ├── kecamatan/
│       │   ├── page.tsx              # Kecamatan list
│       │   └── [id]/
│       │       └── desas/
│       │           └── page.tsx      # Desa management
│       ├── profile/
│       │   └── page.tsx  # Admin profile
│       └── layout.tsx    # Admin layout with navigation
│
├── api/                  # Route handlers
│   ├── export/
│   │   └── route.ts      # SPPT Excel export (nodejs runtime)
│   └── stts/
│       └── export/
│           └── route.ts  # STTS Excel export (nodejs runtime)
│
├── actions/              # Server Actions for data mutations
│   ├── auth.ts           # Login, logout, session management
│   ├── arsip-sppt.ts     # SPPT CRUD operations
│   ├── arsip-stts.ts     # STTS CRUD operations
│   ├── kecamatan.ts      # Kecamatan CRUD with transaction handling
│   ├── desa.ts           # Desa CRUD with transaction handling
│   └── profile.ts        # Profile update operations
│
├── components/           # Reusable UI components
│   ├── ArsipView.tsx     # Shared SPPT/STTS display component
│   ├── DataEditor.tsx    # Shared data entry grid
│   ├── Filters.tsx       # Filter controls with query params
│   ├── SummaryCards.tsx  # Statistics display
│   ├── DataTable.tsx     # Responsive table component
│   ├── HistoryTable.tsx  # Yearly summary table
│   ├── AdminNav.tsx      # Admin navigation bar
│   ├── ExportButton.tsx  # Excel export trigger
│   └── ui/               # Base UI components (buttons, inputs, cards)
│
├── lib/                  # Utilities and configurations
│   ├── prisma.ts         # Prisma client singleton
│   ├── auth.ts           # JWT utilities, session validation
│   ├── format.ts         # Number formatting utilities
│   ├── validation.ts     # Zod schemas
│   └── rate-limit.ts     # Login rate limiting
│
├── middleware.ts         # Route protection middleware
├── loading.tsx           # Global loading state
├── error.tsx             # Global error boundary
└── not-found.tsx         # 404 page
```

### Data Flow Patterns

#### 1. Public Data Display Flow

```
User Browser
    ↓
Server Component (page.tsx)
    ↓ (fetch data via Prisma)
Database (PostgreSQL)
    ↓ (return data)
Server Component (render HTML)
    ↓
User Browser (hydrated page)
```

**Characteristics:**
- Server-side rendering for SEO and performance
- No client-side state management needed for display
- Query parameters for filtering (tahun, kecamatan, desa)
- Dynamic rendering (no static generation due to data changes)

#### 2. Admin Data Mutation Flow

```
User Browser (form interaction)
    ↓
Client Component (form with onSubmit)
    ↓ (call Server Action)
Server Action (validate with zod)
    ↓ (check session, validate input)
Database (Prisma transaction)
    ↓ (return result)
Server Action (return success/error)
    ↓
Client Component (revalidate path, show feedback)
    ↓
User Browser (updated UI)
```

**Characteristics:**
- Server Actions for mutations (type-safe, no API routes needed)
- Session validation in every action
- Input validation with zod schemas
- Optimistic UI updates where appropriate
- Path revalidation after mutations

#### 3. Excel Export Flow

```
User Browser (click export button)
    ↓
Client Component (navigate to /api/export)
    ↓
Route Handler (nodejs runtime)
    ↓ (fetch filtered data)
Database (Prisma query)
    ↓ (generate Excel with exceljs)
Route Handler (stream binary data)
    ↓
User Browser (download file)
```

**Characteristics:**
- Route Handler (not Server Action) for binary response
- nodejs runtime required for exceljs compatibility
- Respects query parameters for filtering
- Streaming response for large files

#### 4. Authentication Flow

```
User Browser (submit credentials)
    ↓
Server Action (login)
    ↓ (hash comparison with bcryptjs)
Database (AdminUser lookup)
    ↓ (create JWT with jose)
Server Action (set httpOnly cookie)
    ↓ (redirect to dashboard)
User Browser
```

**Protected Route Access:**
```
User Browser (navigate to /admin/*)
    ↓
Middleware (check JWT cookie)
    ↓ (verify with jose)
JWT Valid?
    ├─ Yes → Allow access
    └─ No  → Redirect to /admin/login
```

---

## Components and Interfaces

### Core Components

#### 1. ArsipView Component

**Purpose:** Shared display component for both SPPT and STTS archive views

**Props:**
```typescript
interface ArsipViewProps {
  type: 'sppt' | 'stts'
  data: ArsipData[]
  filters: {
    tahun?: number
    kecamatan?: string
    desa?: string
    search?: string
  }
  years: number[]
  kecamatans: { nama: string, urutan: number }[]
  desas: { nama: string, kecamatan: string, urutan: number }[]
}

interface ArsipData {
  kecamatan: string
  desa: string
  buku1: number
  buku2: number
  buku3: number
  buku4: number
  buku5: number
  total: number
}
```

**Responsibilities:**
- Render filter controls (Tahun, Kecamatan, Desa, Search)
- Display 6 summary cards (Buku 1-5 totals + grand total)
- Render data table with formatted numbers
- Show legend explaining Buku categories
- Display "Riwayat Per Tahun" section
- Provide Excel export button

**Implementation Notes:**
- Server component for initial render
- Client components for interactive filters
- URL query parameters for filter state
- Shared between `/` and `/stts` routes

#### 2. DataEditor Component

**Purpose:** Shared data entry grid for SPPT and STTS admin pages

**Props:**
```typescript
interface DataEditorProps {
  type: 'sppt' | 'stts'
  tahun: number
  kecamatan: string
  desas: { id: string, nama: string, urutan: number }[]
  initialData: Map<string, BukuData> // keyed by desa name
  onSave: (desa: string, data: BukuData) => Promise<Result>
}

interface BukuData {
  buku1: number
  buku2: number
  buku3: number
  buku4: number
  buku5: number
}

type Result = { success: true } | { success: false, error: string }
```

**Responsibilities:**
- Render grid with one row per Desa
- Provide formatted inputs for Buku 1-5
- Calculate and display Total automatically
- Handle number formatting (dots for thousands)
- Validate input (non-negative integers)
- Save per row with loading state
- Display success/error feedback per row

**Implementation Notes:**
- Client component for input handling
- Debounced formatting as user types
- Optimistic UI updates on save
- Server Action calls for persistence

#### 3. Filters Component

**Purpose:** Reusable filter controls with query parameter synchronization

**Props:**
```typescript
interface FiltersProps {
  years: number[]
  kecamatans: string[]
  desas: string[]
  currentFilters: {
    tahun?: number
    kecamatan?: string
    desa?: string
    search?: string
  }
}
```

**Responsibilities:**
- Render select dropdowns for Tahun, Kecamatan, Desa
- Render search input
- Update URL query parameters on change
- Filter Desa dropdown based on selected Kecamatan
- Trigger page revalidation on filter change

**Implementation Notes:**
- Client component with useSearchParams and useRouter
- Controlled inputs synced to URL
- Cascade filtering (Desa filtered by Kecamatan)

#### 4. AdminNav Component

**Purpose:** Navigation bar for admin panel

**Props:**
```typescript
interface AdminNavProps {
  currentPath: string
  userName: string
}
```

**Responsibilities:**
- Render navigation links with active state highlighting
- Display user name
- Provide logout button
- Link to public view
- Responsive collapsible menu on mobile

**Implementation Notes:**
- Client component for interactive behavior
- Uses next/link for navigation
- Calls logout Server Action

### Utility Modules

#### lib/format.ts

**Purpose:** Number formatting utilities for Indonesian locale

```typescript
export function formatNumber(value: number | null | undefined): string {
  // Returns empty string for 0, null, undefined
  // Returns number with dot separators for others
  // Example: 1234567 → "1.234.567"
}

export function parseNumber(value: string): number {
  // Removes dot separators and parses to integer
  // Example: "1.234.567" → 1234567
  // Returns 0 for invalid input
}

export function formatInputValue(value: string): string {
  // Formats as user types in input field
  // Handles partial input gracefully
}
```

#### lib/auth.ts

**Purpose:** JWT and session management utilities

```typescript
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface SessionPayload {
  userId: string
  username: string
  name: string
  iat: number
  exp: number
}

export async function createSession(user: { id: string, username: string, name: string }): Promise<void> {
  // Create JWT token with 8-hour expiration
  // Set httpOnly, secure (in production), sameSite=lax cookie
}

export async function getSession(): Promise<SessionPayload | null> {
  // Read cookie, verify JWT, return payload or null
}

export async function deleteSession(): Promise<void> {
  // Clear session cookie
}

export async function requireSession(): Promise<SessionPayload> {
  // Get session or throw error (for use in Server Actions)
}
```

**Implementation Details:**
- Use `jose` library for JWT operations
- Secret key from `process.env.AUTH_SECRET`
- Token expiration: 8 hours (28800 seconds)
- Cookie settings: httpOnly=true, secure=production, sameSite=lax, path=/

#### lib/validation.ts

**Purpose:** Zod schemas for input validation

```typescript
import { z } from 'zod'

export const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
})

export const BukuDataSchema = z.object({
  buku1: z.number().int().min(0).max(999999),
  buku2: z.number().int().min(0).max(999999),
  buku3: z.number().int().min(0).max(999999),
  buku4: z.number().int().min(0).max(999999),
  buku5: z.number().int().min(0).max(999999),
})

export const YearSchema = z.number().int().min(2000).max(2100)

export const KecamatanSchema = z.object({
  nama: z.string().min(1).max(100),
  urutan: z.number().int().min(0),
})

export const DesaSchema = z.object({
  nama: z.string().min(1).max(100),
  urutan: z.number().int().min(0),
  kecamatanId: z.string().uuid(),
})

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(50).optional(),
  oldPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
})
```

#### lib/rate-limit.ts

**Purpose:** Rate limiting for login attempts

```typescript
interface RateLimitEntry {
  count: number
  resetAt: number
}

const attempts = new Map<string, RateLimitEntry>()

export function checkRateLimit(ip: string): { allowed: boolean, remaining: number } {
  // Check if IP has exceeded 5 attempts in 15 minutes
  // Clean up expired entries
  // Return allowed status and remaining attempts
}

export function incrementAttempts(ip: string): void {
  // Increment attempt counter for IP
}

export function resetAttempts(ip: string): void {
  // Clear attempts for IP (on successful login)
}
```

**Implementation Notes:**
- In-memory storage (sufficient for Vercel serverless)
- 5 attempts per 15 minutes per IP
- Automatic cleanup of expired entries
- IP extracted from request headers (x-forwarded-for or x-real-ip)

---

## Data Models

### Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations with connection pooling
}

// Archive models - store document counts per year/district/village

model ArsipSppt {
  id         String   @id @default(uuid())
  tahun      Int
  kecamatan  String
  desa       String
  buku1      Int      @default(0)
  buku2      Int      @default(0)
  buku3      Int      @default(0)
  buku4      Int      @default(0)
  buku5      Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([tahun, kecamatan, desa])
  @@index([tahun])
  @@index([kecamatan])
  @@index([desa])
  @@map("arsip_sppt")
}

model ArsipStts {
  id         String   @id @default(uuid())
  tahun      Int
  kecamatan  String
  desa       String
  buku1      Int      @default(0)
  buku2      Int      @default(0)
  buku3      Int      @default(0)
  buku4      Int      @default(0)
  buku5      Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([tahun, kecamatan, desa])
  @@index([tahun])
  @@index([kecamatan])
  @@index([desa])
  @@map("arsip_stts")
}

// Master data models - reference data for districts and villages

model Kecamatan {
  id        String   @id @default(uuid())
  nama      String   @unique
  urutan    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  desas     Desa[]

  @@index([urutan])
  @@map("kecamatan")
}

model Desa {
  id           String   @id @default(uuid())
  kecamatanId  String
  nama         String
  urutan       Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  kecamatan    Kecamatan @relation(fields: [kecamatanId], references: [id], onDelete: Cascade)

  @@unique([kecamatanId, nama])
  @@index([kecamatanId])
  @@index([urutan])
  @@map("desa")
}

// Authentication model

model AdminUser {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hashed
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admin_user")
}
```

### Model Relationships and Constraints

#### ArsipSppt & ArsipStts

**Purpose:** Store document counts for tax archives

**Key Design Decisions:**
1. **Denormalized kecamatan/desa names:** Names are stored as strings rather than foreign keys to preserve historical data when master data changes
2. **Unique constraint:** Ensures only one record per year/district/village combination
3. **Indexes:** Optimize queries by tahun, kecamatan, desa (common filter fields)
4. **Default values:** buku1-5 default to 0 for easier data entry

**Why Denormalization?**
- When a Kecamatan or Desa name changes, we need to preserve historical accuracy
- Archive records should reflect the name used at that time
- Transaction updates maintain consistency when names change

#### Kecamatan & Desa

**Purpose:** Master data for administrative boundaries

**Key Design Decisions:**
1. **Cascade delete:** When Kecamatan is deleted, all related Desa records are deleted
2. **Unique nama:** Kecamatan names must be globally unique; Desa names must be unique within their Kecamatan
3. **urutan field:** Controls display order in dropdowns and tables
4. **No foreign keys to archives:** Archive tables store names as strings, not IDs

**Relationship:**
- One-to-many: Kecamatan → Desa
- Cascade delete preserves data integrity for master data
- Archive data (ArsipSppt, ArsipStts) is intentionally NOT cascade deleted

#### AdminUser

**Purpose:** Store admin authentication credentials

**Key Design Decisions:**
1. **Hashed passwords:** Never store plain text; use bcryptjs with salt rounds = 10
2. **Unique username:** Username is the login identifier
3. **Simple model:** No roles/permissions yet (can be extended later)

### Database Query Patterns

#### 1. Public Data Display Queries

**Query for filtered archives:**
```typescript
const data = await prisma.arsipSppt.findMany({
  where: {
    tahun: filters.tahun,
    kecamatan: filters.kecamatan ? filters.kecamatan : undefined,
    desa: filters.desa ? filters.desa : undefined,
    OR: filters.search ? [
      { kecamatan: { contains: filters.search, mode: 'insensitive' } },
      { desa: { contains: filters.search, mode: 'insensitive' } },
    ] : undefined,
  },
  orderBy: [
    { kecamatan: 'asc' },
    { desa: 'asc' },
  ],
})
```

**Performance:** Indexes on tahun, kecamatan, desa enable efficient filtering

#### 2. Admin Data Entry Query

**Query for specific year + kecamatan:**
```typescript
const data = await prisma.arsipSppt.findMany({
  where: {
    tahun: selectedYear,
    kecamatan: selectedKecamatan,
  },
})

const desas = await prisma.desa.findMany({
  where: { kecamatan: { nama: selectedKecamatan } },
  orderBy: { urutan: 'asc' },
})
```

**Upsert pattern for saving:**
```typescript
await prisma.arsipSppt.upsert({
  where: {
    tahun_kecamatan_desa: {
      tahun: selectedYear,
      kecamatan: selectedKecamatan,
      desa: selectedDesa,
    },
  },
  update: {
    buku1,
    buku2,
    buku3,
    buku4,
    buku5,
    updatedAt: new Date(),
  },
  create: {
    tahun: selectedYear,
    kecamatan: selectedKecamatan,
    desa: selectedDesa,
    buku1,
    buku2,
    buku3,
    buku4,
    buku5,
  },
})
```

#### 3. Name Update Transaction

**When Kecamatan name changes:**
```typescript
await prisma.$transaction(async (tx) => {
  // Update Kecamatan master record
  await tx.kecamatan.update({
    where: { id: kecamatanId },
    data: { nama: newNama },
  })

  // Update all SPPT records with old name
  await tx.arsipSppt.updateMany({
    where: { kecamatan: oldNama },
    data: { kecamatan: newNama },
  })

  // Update all STTS records with old name
  await tx.arsipStts.updateMany({
    where: { kecamatan: oldNama },
    data: { kecamatan: newNama },
  })
})
```

**When Desa name changes:**
```typescript
await prisma.$transaction(async (tx) => {
  const desa = await tx.desa.findUnique({
    where: { id: desaId },
    include: { kecamatan: true },
  })

  // Update Desa master record
  await tx.desa.update({
    where: { id: desaId },
    data: { nama: newNama },
  })

  // Update all SPPT records with old name and kecamatan
  await tx.arsipSppt.updateMany({
    where: {
      kecamatan: desa.kecamatan.nama,
      desa: oldNama,
    },
    data: { desa: newNama },
  })

  // Update all STTS records with old name and kecamatan
  await tx.arsipStts.updateMany({
    where: {
      kecamatan: desa.kecamatan.nama,
      desa: oldNama,
    },
    data: { desa: newNama },
  })
})
```

**Transaction Guarantees:**
- All updates succeed or all rollback
- No partial updates across tables
- Maintains data consistency

#### 4. Year Management Queries

**Add new year (empty):**
```typescript
const desaCombos = await prisma.desa.findMany({
  include: { kecamatan: true },
})

await prisma.arsipSppt.createMany({
  data: desaCombos.map(desa => ({
    tahun: newYear,
    kecamatan: desa.kecamatan.nama,
    desa: desa.nama,
    buku1: 0,
    buku2: 0,
    buku3: 0,
    buku4: 0,
    buku5: 0,
  })),
  skipDuplicates: true,
})
```

**Add new year (copy from another year):**
```typescript
const sourceRecords = await prisma.arsipSppt.findMany({
  where: { tahun: sourceYear },
})

await prisma.arsipSppt.createMany({
  data: sourceRecords.map(record => ({
    tahun: newYear,
    kecamatan: record.kecamatan,
    desa: record.desa,
    buku1: record.buku1,
    buku2: record.buku2,
    buku3: record.buku3,
    buku4: record.buku4,
    buku5: record.buku5,
  })),
  skipDuplicates: true,
})
```

**Delete year:**
```typescript
await prisma.arsipSppt.deleteMany({
  where: { tahun: yearToDelete },
})
```

---

## Error Handling

### Error Handling Strategy

The application implements a multi-layered error handling approach:

#### 1. Client-Side Error Boundaries

**Global Error Boundary** (`app/error.tsx`):
```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
        <p className="text-gray-700 mb-6">
          Mohon maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="w-full bg-emerald-700 text-white py-2 px-4 rounded hover:bg-emerald-600"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
```

**Not Found Page** (`app/not-found.tsx`):
```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Halaman tidak ditemukan</p>
        <a href="/" className="mt-6 inline-block text-emerald-700 hover:underline">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}
```

#### 2. Server Action Error Handling

**Pattern for all Server Actions:**
```typescript
'use server'

import { z } from 'zod'
import { requireSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string }

export async function saveArsipData(
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. Validate session
    await requireSession()

    // 2. Parse and validate input
    const rawData = {
      tahun: parseInt(formData.get('tahun') as string),
      kecamatan: formData.get('kecamatan') as string,
      desa: formData.get('desa') as string,
      buku1: parseInt(formData.get('buku1') as string) || 0,
      // ... other fields
    }

    const validated = BukuDataSchema.parse(rawData)

    // 3. Perform database operation
    await prisma.arsipSppt.upsert({
      // ... upsert logic
    })

    // 4. Revalidate affected paths
    revalidatePath('/admin/data')
    revalidatePath('/')

    return { success: true }

  } catch (error) {
    // 5. Handle errors with Indonesian messages
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Data tidak valid: ' + error.errors[0].message,
      }
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        success: false,
        error: 'Sesi Anda telah berakhir. Silakan login kembali.',
      }
    }

    console.error('Error saving arsip data:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan saat menyimpan data.',
    }
  }
}
```

**Indonesian Error Messages:**
```typescript
// lib/error-messages.ts
export const ErrorMessages = {
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  INVALID_INPUT: 'Data yang Anda masukkan tidak valid.',
  DUPLICATE_ENTRY: 'Data sudah ada. Silakan gunakan nama lain.',
  NOT_FOUND: 'Data tidak ditemukan.',
  DATABASE_ERROR: 'Terjadi kesalahan pada database.',
  NETWORK_ERROR: 'Tidak dapat terhubung ke server.',
  RATE_LIMIT: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.',
  INVALID_CREDENTIALS: 'Username atau password salah.',
  WEAK_PASSWORD: 'Password harus minimal 8 karakter.',
  USERNAME_TAKEN: 'Username sudah digunakan.',
} as const
```

#### 3. Form Validation Errors

**Client-Side Validation:**
```typescript
'use client'

import { useState } from 'react'

export function DataEntryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const result = await saveArsipData(formData)

      if (!result.success) {
        setErrors({ form: result.error })
      } else {
        // Show success feedback
      }
    } catch (error) {
      setErrors({ form: 'Terjadi kesalahan jaringan.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  )
}
```

#### 4. Database Error Handling

**Prisma Error Handling:**
```typescript
import { Prisma } from '@prisma/client'

function handlePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return 'Data sudah ada. Silakan gunakan nama lain.'
    }
    
    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return 'Data terkait tidak ditemukan.'
    }
    
    // Record not found
    if (error.code === 'P2025') {
      return 'Data tidak ditemukan.'
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'Data tidak valid.'
  }

  return 'Terjadi kesalahan pada database.'
}
```

#### 5. Authentication Error Handling

**Login Errors:**
```typescript
export async function login(
  username: string,
  password: string
): Promise<ActionResult> {
  try {
    // Check rate limit
    const ip = getClientIp()
    const rateLimit = checkRateLimit(ip)
    
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
      }
    }

    // Validate input
    const validated = LoginSchema.parse({ username, password })

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { username: validated.username },
    })

    if (!user) {
      incrementAttempts(ip)
      return {
        success: false,
        error: 'Username atau password salah.',
      }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(validated.password, user.password)

    if (!passwordMatch) {
      incrementAttempts(ip)
      return {
        success: false,
        error: 'Username atau password salah.',
      }
    }

    // Create session
    await createSession({
      userId: user.id,
      username: user.username,
      name: user.name,
    })

    // Reset rate limit on success
    resetAttempts(ip)

    return { success: true }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Username atau password tidak valid.',
      }
    }

    console.error('Login error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan saat login.',
    }
  }
}
```

#### 6. Loading States

**Global Loading** (`app/loading.tsx`):
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
        <p className="mt-4 text-gray-600">Memuat...</p>
      </div>
    </div>
  )
}
```

**Component-Level Loading:**
```typescript
'use client'

export function SaveButton({ isLoading }: { isLoading: boolean }) {
  return (
    <button disabled={isLoading} className="...">
      {isLoading ? (
        <>
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          Menyimpan...
        </>
      ) : (
        'Simpan'
      )}
    </button>
  )
}
```

### Error Recovery Strategies

1. **Transient Errors**: Retry button on error boundaries
2. **Validation Errors**: Inline field-level feedback
3. **Authentication Errors**: Redirect to login with return URL
4. **Network Errors**: Offline detection and retry mechanism
5. **Database Errors**: Transaction rollback, log for investigation

---

## Testing Strategy

### Testing Approach

The application uses a **dual testing approach** combining unit tests and property-based tests:

#### 1. Unit Testing

**Framework:** Vitest + React Testing Library

**Scope:**
- Component rendering and interactions
- Form validation logic
- Number formatting utilities
- Error handling paths
- API integration points

**Example Unit Tests:**

**Testing Number Formatting:**
```typescript
// lib/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatNumber, parseNumber, formatInputValue } from './format'

describe('formatNumber', () => {
  it('formats numbers with dot separators', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
    expect(formatNumber(1000)).toBe('1.000')
    expect(formatNumber(100)).toBe('100')
  })

  it('returns empty string for zero and null', () => {
    expect(formatNumber(0)).toBe('')
    expect(formatNumber(null)).toBe('')
    expect(formatNumber(undefined)).toBe('')
  })
})

describe('parseNumber', () => {
  it('parses formatted strings to integers', () => {
    expect(parseNumber('1.234.567')).toBe(1234567)
    expect(parseNumber('1.000')).toBe(1000)
    expect(parseNumber('100')).toBe(100)
  })

  it('returns 0 for invalid input', () => {
    expect(parseNumber('')).toBe(0)
    expect(parseNumber('abc')).toBe(0)
  })
})
```

**Testing Components:**
```typescript
// components/SummaryCards.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryCards } from './SummaryCards'

describe('SummaryCards', () => {
  it('displays formatted totals for each Buku', () => {
    const data = [
      { buku1: 100, buku2: 200, buku3: 300, buku4: 400, buku5: 500 },
      { buku1: 50, buku2: 100, buku3: 150, buku4: 200, buku5: 250 },
    ]

    render(<SummaryCards data={data} />)

    expect(screen.getByText('150')).toBeInTheDocument() // buku1 total
    expect(screen.getByText('300')).toBeInTheDocument() // buku2 total
    expect(screen.getByText('1.200')).toBeInTheDocument() // grand total
  })

  it('displays zero totals when data is empty', () => {
    render(<SummaryCards data={[]} />)

    // Should show empty or zero for all cards
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(6)
  })
})
```

**Testing Server Actions:**
```typescript
// actions/arsip-sppt.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveArsipData } from './arsip-sppt'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  requireSession: vi.fn().mockResolvedValue({
    userId: '1',
    username: 'admin',
    name: 'Admin User',
  }),
}))

describe('saveArsipData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves valid data successfully', async () => {
    const formData = new FormData()
    formData.set('tahun', '2024')
    formData.set('kecamatan', 'Caringin')
    formData.set('desa', 'Cimande')
    formData.set('buku1', '100')
    formData.set('buku2', '200')
    formData.set('buku3', '300')
    formData.set('buku4', '400')
    formData.set('buku5', '500')

    const result = await saveArsipData(formData)

    expect(result.success).toBe(true)
  })

  it('rejects negative values', async () => {
    const formData = new FormData()
    formData.set('buku1', '-100')

    const result = await saveArsipData(formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain('tidak valid')
  })

  it('requires authentication', async () => {
    vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'))

    const formData = new FormData()
    const result = await saveArsipData(formData)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Sesi')
  })
})
```

#### 2. Integration Testing

**Scope:**
- Full page rendering with real database queries (test database)
- Excel export functionality
- Transaction handling for name updates
- Authentication flow end-to-end

**Example Integration Tests:**

**Testing Name Update Transaction:**
```typescript
// actions/kecamatan.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { updateKecamatanName } from './kecamatan'
import { prisma } from '@/lib/prisma'

describe('updateKecamatanName transaction', () => {
  let kecamatanId: string

  beforeAll(async () => {
    // Setup test data
    const kec = await prisma.kecamatan.create({
      data: { nama: 'Test Kecamatan', urutan: 1 },
    })
    kecamatanId = kec.id

    await prisma.arsipSppt.create({
      data: {
        tahun: 2024,
        kecamatan: 'Test Kecamatan',
        desa: 'Test Desa',
        buku1: 100,
      },
    })

    await prisma.arsipStts.create({
      data: {
        tahun: 2024,
        kecamatan: 'Test Kecamatan',
        desa: 'Test Desa',
        buku1: 50,
      },
    })
  })

  afterAll(async () => {
    // Cleanup
    await prisma.arsipSppt.deleteMany({ where: { tahun: 2024 } })
    await prisma.arsipStts.deleteMany({ where: { tahun: 2024 } })
    await prisma.kecamatan.delete({ where: { id: kecamatanId } })
  })

  it('updates kecamatan name across all tables in transaction', async () => {
    const result = await updateKecamatanName(kecamatanId, 'New Kecamatan Name')

    expect(result.success).toBe(true)

    // Verify Kecamatan updated
    const kec = await prisma.kecamatan.findUnique({
      where: { id: kecamatanId },
    })
    expect(kec?.nama).toBe('New Kecamatan Name')

    // Verify SPPT records updated
    const sppt = await prisma.arsipSppt.findFirst({
      where: { tahun: 2024, desa: 'Test Desa' },
    })
    expect(sppt?.kecamatan).toBe('New Kecamatan Name')

    // Verify STTS records updated
    const stts = await prisma.arsipStts.findFirst({
      where: { tahun: 2024, desa: 'Test Desa' },
    })
    expect(stts?.kecamatan).toBe('New Kecamatan Name')
  })
})
```

**Testing Excel Export:**
```typescript
// api/export/route.integration.test.ts
import { describe, it, expect } from 'vitest'
import { GET } from './route'
import ExcelJS from 'exceljs'

describe('Excel Export', () => {
  it('generates valid Excel file with correct data', async () => {
    const request = new Request('http://localhost:3000/api/export?tahun=2024')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('spreadsheet')

    // Parse Excel content
    const buffer = await response.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    expect(worksheet).toBeDefined()

    // Check headers
    const headerRow = worksheet.getRow(1)
    expect(headerRow.getCell(1).value).toBe('Kecamatan')
    expect(headerRow.getCell(2).value).toBe('Desa')
    expect(headerRow.getCell(3).value).toBe('Buku 1')
  })
})
```

#### 3. Manual Testing Checklist

**Pre-Deployment Checklist:**

- [ ] **Authentication**
  - [ ] Login with valid credentials redirects to dashboard
  - [ ] Login with invalid credentials shows error
  - [ ] Rate limiting blocks after 5 failed attempts
  - [ ] Logout clears session and redirects to home
  - [ ] Protected routes redirect to login when not authenticated

- [ ] **Public Pages**
  - [ ] SPPT page loads with correct data
  - [ ] STTS page loads with correct data
  - [ ] Filters work (year, kecamatan, desa, search)
  - [ ] Summary cards show correct totals
  - [ ] Data table displays formatted numbers
  - [ ] Excel export downloads correct file
  - [ ] Responsive on mobile (375px width)
  - [ ] Hidden admin access (triple-click title)

- [ ] **Admin Pages**
  - [ ] Dashboard shows correct statistics
  - [ ] Data entry page saves changes
  - [ ] Number formatting works as user types
  - [ ] Year management adds/deletes years
  - [ ] Copy year duplicates data correctly
  - [ ] Kecamatan CRUD operations work
  - [ ] Desa CRUD operations work
  - [ ] Name updates propagate to archives
  - [ ] Profile updates work (name, username, password)

- [ ] **Error Handling**
  - [ ] Form validation shows Indonesian errors
  - [ ] Network errors display user-friendly messages
  - [ ] 404 page displays for invalid routes
  - [ ] Error boundary catches React errors

- [ ] **Performance**
  - [ ] Pages load in < 2 seconds
  - [ ] Filtering is responsive (< 500ms)
  - [ ] Excel export completes in < 5 seconds
  - [ ] No layout shift on page load

#### 4. Performance Testing

**Metrics to Monitor:**
- **Time to First Byte (TTFB)**: < 500ms
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

**Performance Optimization Techniques:**
1. Server Components for data fetching
2. Dynamic rendering (no static generation for data pages)
3. Database query optimization with indexes
4. Streaming responses for large Excel files
5. Code splitting with Next.js automatic optimization
6. Image optimization (if images are added later)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The Arsip Data PBB application has several areas suitable for property-based testing. Most functionality (CRUD operations, UI rendering, Excel export, transactions) is better served by integration tests and example-based unit tests. However, the following pure functions and round-trip operations have universal properties that should hold across all valid inputs:

### Property 1: Number Formatting Round-Trip Preservation

*For any* non-negative integer value, formatting the number with Indonesian thousand separators (dots) and then parsing it back SHALL produce the original integer value.

**Validates: Requirements 5.6, 22.1, 22.4**

**Rationale:** Number formatting is a pure function used throughout the application for display and data entry. The round-trip property ensures no data loss occurs during format/parse cycles, which is critical for data integrity in the data entry workflow.

**Test Implementation:**
```typescript
// lib/format.property.test.ts
import { fc, test } from '@fast-check/vitest'
import { formatNumber, parseNumber } from './format'

test.prop([fc.integer({ min: 0, max: 999999 })])(
  'Feature: arsip-pbb-nextjs, Property 1: Number formatting round-trip preserves value',
  (value) => {
    const formatted = formatNumber(value)
    const parsed = parseNumber(formatted)
    expect(parsed).toBe(value)
  }
)

test.prop([fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^\d+(\.\d{3})*$/.test(s))])(
  'Feature: arsip-pbb-nextjs, Property 1: Parsing then formatting preserves format',
  (formattedStr) => {
    const parsed = parseNumber(formattedStr)
    const formatted = formatNumber(parsed)
    // Format may differ for trailing zeros, but value is preserved
    expect(parseNumber(formatted)).toBe(parseNumber(formattedStr))
  }
)
```

### Property 2: Buku Value Validation Boundary Enforcement

*For any* integer value, validation SHALL accept the value if and only if it is between 0 and 999999 (inclusive).

**Validates: Requirements 9.9, 21.2**

**Rationale:** Buku values represent document counts and must be non-negative integers within database storage limits. Property-based testing ensures validation correctly handles all boundary conditions and edge cases across the entire valid range.

**Test Implementation:**
```typescript
// lib/validation.property.test.ts
import { fc, test } from '@fast-check/vitest'
import { BukuDataSchema } from './validation'

test.prop([fc.integer({ min: 0, max: 999999 })])(
  'Feature: arsip-pbb-nextjs, Property 2: Valid buku values pass validation',
  (value) => {
    const result = BukuDataSchema.safeParse({
      buku1: value,
      buku2: 0,
      buku3: 0,
      buku4: 0,
      buku5: 0,
    })
    expect(result.success).toBe(true)
  }
)

test.prop([fc.oneof(
  fc.integer({ max: -1 }),
  fc.integer({ min: 1000000 })
)])(
  'Feature: arsip-pbb-nextjs, Property 2: Invalid buku values fail validation',
  (value) => {
    const result = BukuDataSchema.safeParse({
      buku1: value,
      buku2: 0,
      buku3: 0,
      buku4: 0,
      buku5: 0,
    })
    expect(result.success).toBe(false)
  }
)
```

### Property 3: Year Validation Range Enforcement

*For any* integer value, year validation SHALL accept the value if and only if it is between 2000 and 2100 (inclusive).

**Validates: Requirements 21.3**

**Rationale:** Year values must be within a reasonable range for tax archive data. This property ensures the application correctly handles historical data (2000+) and future years up to 2100, while rejecting invalid years.

**Test Implementation:**
```typescript
// lib/validation.property.test.ts
import { fc, test } from '@fast-check/vitest'
import { YearSchema } from './validation'

test.prop([fc.integer({ min: 2000, max: 2100 })])(
  'Feature: arsip-pbb-nextjs, Property 3: Valid years pass validation',
  (year) => {
    const result = YearSchema.safeParse(year)
    expect(result.success).toBe(true)
  }
)

test.prop([fc.oneof(
  fc.integer({ max: 1999 }),
  fc.integer({ min: 2101 })
)])(
  'Feature: arsip-pbb-nextjs, Property 3: Invalid years fail validation',
  (year) => {
    const result = YearSchema.safeParse(year)
    expect(result.success).toBe(false)
  }
)
```

### Property 4: JWT Session Round-Trip Preservation

*For any* valid user session payload (userId, username, name), signing the payload to a JWT token and then verifying and decoding it SHALL produce equivalent user data.

**Validates: Requirements 26.5**

**Rationale:** JWT tokens are used for authentication and session management. The round-trip property ensures that user data is preserved accurately through the encode/decode cycle, which is critical for security and user identity verification.

**Test Implementation:**
```typescript
// lib/auth.property.test.ts
import { fc, test } from '@fast-check/vitest'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'test-secret-key')

test.prop([
  fc.record({
    userId: fc.uuid(),
    username: fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
    name: fc.string({ minLength: 1, maxLength: 100 }),
  })
])(
  'Feature: arsip-pbb-nextjs, Property 4: JWT signing and verification preserves user data',
  async (userData) => {
    // Sign JWT
    const token = await new SignJWT(userData)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .setIssuedAt()
      .sign(secret)

    // Verify and decode
    const { payload } = await jwtVerify(token, secret)

    // Check user data is preserved
    expect(payload.userId).toBe(userData.userId)
    expect(payload.username).toBe(userData.username)
    expect(payload.name).toBe(userData.name)
    
    // iat and exp are added by JWT library, so they should exist
    expect(payload.iat).toBeDefined()
    expect(payload.exp).toBeDefined()
  }
)
```

#### Property Test Configuration

All property-based tests SHALL:
- Run with minimum 100 iterations per property (configured in vitest)
- Use `fast-check` library for TypeScript property-based testing
- Tag each test with format: `Feature: arsip-pbb-nextjs, Property {number}: {description}`
- Be located in files with `.property.test.ts` extension
- Use generators that cover edge cases (0, max values, boundaries)

**Vitest Configuration for Property Tests:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

```typescript
// vitest.setup.ts
import { configureGlobal } from '@fast-check/vitest'

configureGlobal({
  numRuns: 100, // Minimum iterations per property test
  verbose: true,
})
```

### Non-Property Test Coverage

The following requirements are NOT suitable for property-based testing and SHALL be covered by integration tests and example-based unit tests:

- **Database transactions** (Req 1.6, 1.7): Integration tests with test database
- **Authentication flow** (Req 3.1): Integration tests with bcrypt and cookie verification
- **Excel export** (Req 7): Integration tests verifying file structure with 2-3 examples
- **CRUD operations** (Req 9, 11): Unit tests with mocked database, integration tests for end-to-end
- **UI rendering** (Req 5, 6, 18, 19): Component tests with React Testing Library
- **Error handling** (Req 20): Example-based unit tests for each error scenario
- **Rate limiting** (Req 3.3): Unit tests with time manipulation

---

## Deployment Configuration

### Environment Variables

**File:** `.env.example`

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/database?schema=public"

# Authentication
AUTH_SECRET="generate-a-random-secret-here-min-32-chars"

# Initial Admin User (for seeding)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="changeme123"
ADMIN_NAME="Administrator"

# Node Environment
NODE_ENV="production"
```

**Environment Variable Descriptions:**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled for Prisma Client) | Yes | `postgresql://user:pass@host/db` |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations, no pooling) | Yes* | `postgresql://user:pass@host/db` |
| `AUTH_SECRET` | Secret key for JWT signing (min 32 characters) | Yes | Generated with `openssl rand -base64 32` |
| `ADMIN_USERNAME` | Initial admin username for database seeding | Yes | `admin` |
| `ADMIN_PASSWORD` | Initial admin password (change after first login) | Yes | `SecureP@ssw0rd` |
| `ADMIN_NAME` | Initial admin display name | Yes | `System Administrator` |
| `NODE_ENV` | Node environment (`development` or `production`) | No | `production` |

*Note: `DIRECT_URL` is only required when using connection pooling services like PgBouncer (Vercel Postgres, Neon, Supabase)

### Package.json Scripts

```json
{
  "name": "arsip-pbb-nextjs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "test": "vitest --run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.12.0",
    "prisma": "^5.12.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "zod": "^3.22.0",
    "exceljs": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "postcss": "^8",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.4.0",
    "@vitest/ui": "^1.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@fast-check/vitest": "^0.0.9",
    "tsx": "^4.7.0"
  }
}
```

### Next.js Configuration

**File:** `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force dynamic rendering for pages that query database
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig
```

### Prisma Configuration

**Seed Script:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed Kecamatan
  const caringin = await prisma.kecamatan.upsert({
    where: { nama: 'Caringin' },
    update: {},
    create: { nama: 'Caringin', urutan: 1 },
  })

  const cigombong = await prisma.kecamatan.upsert({
    where: { nama: 'Cigombong' },
    update: {},
    create: { nama: 'Cigombong', urutan: 2 },
  })

  const cijeruk = await prisma.kecamatan.upsert({
    where: { nama: 'Cijeruk' },
    update: {},
    create: { nama: 'Cijeruk', urutan: 3 },
  })

  // Seed Desa for Caringin
  const caringinDesas = [
    'Caringin', 'Ciderum', 'Ciherang Pondok', 'Cimande', 'Cimande Hilir',
    'Cinagara', 'Lemah Duhur', 'Muara Jaya', 'Pancawati', 'Pasir Buncir',
    'Pasir Muncang', 'Tangkil'
  ]
  
  for (let i = 0; i < caringinDesas.length; i++) {
    await prisma.desa.upsert({
      where: {
        kecamatanId_nama: {
          kecamatanId: caringin.id,
          nama: caringinDesas[i],
        },
      },
      update: {},
      create: {
        kecamatanId: caringin.id,
        nama: caringinDesas[i],
        urutan: i + 1,
      },
    })
  }

  // Seed Desa for Cigombong
  const cigombongDesas = [
    'Ciadeg', 'Ciburayut', 'Ciburuy', 'Cigombong', 'Cisalada',
    'Pasir Jaya', 'Srogol', 'Tugu Jaya', 'Watesjaya'
  ]
  
  for (let i = 0; i < cigombongDesas.length; i++) {
    await prisma.desa.upsert({
      where: {
        kecamatanId_nama: {
          kecamatanId: cigombong.id,
          nama: cigombongDesas[i],
        },
      },
      update: {},
      create: {
        kecamatanId: cigombong.id,
        nama: cigombongDesas[i],
        urutan: i + 1,
      },
    })
  }

  // Seed Desa for Cijeruk
  const cijerukDesas = [
    'Cibalung', 'Cijeruk', 'Cipelang', 'Cipicung', 'Palasari',
    'Sukaharja', 'Tajur Halang', 'Tanjungsari', 'Warung Menteng'
  ]
  
  for (let i = 0; i < cijerukDesas.length; i++) {
    await prisma.desa.upsert({
      where: {
        kecamatanId_nama: {
          kecamatanId: cijeruk.id,
          nama: cijerukDesas[i],
        },
      },
      update: {},
      create: {
        kecamatanId: cijeruk.id,
        nama: cijerukDesas[i],
        urutan: i + 1,
      },
    })
  }

  // Seed Admin User
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  )

  await prisma.adminUser.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashedPassword,
      name: process.env.ADMIN_NAME || 'Administrator',
    },
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Middleware Configuration

**File:** `middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### Tailwind Configuration

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### Vercel Deployment Steps

#### 1. Database Setup

**Option A: Vercel Postgres**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Create Postgres database
vercel postgres create

# Connect to project
vercel env pull .env.local
```

**Option B: Neon (Recommended for free tier)**
1. Create account at https://neon.tech
2. Create new project
3. Copy connection strings:
   - `DATABASE_URL`: Use pooled connection string
   - `DIRECT_URL`: Use direct connection string

**Option C: Supabase**
1. Create account at https://supabase.com
2. Create new project
3. Copy connection strings from Settings → Database

#### 2. Environment Variables

In Vercel dashboard:
1. Go to Project → Settings → Environment Variables
2. Add all variables from `.env.example`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_NAME`

#### 3. Database Migration

**Option A: Using Vercel CLI**
```bash
# Push schema to database
vercel env pull .env.local
npx prisma db push

# Run seed
npm run db:seed
```

**Option B: Using GitHub Actions**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
        run: npx prisma db push
      
      - name: Run seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          ADMIN_NAME: ${{ secrets.ADMIN_NAME }}
        run: npm run db:seed
```

#### 4. Deploy to Vercel

**Via GitHub Integration (Recommended):**
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push

**Via CLI:**
```bash
vercel --prod
```

#### 5. Post-Deployment

1. **Verify deployment**: Visit your production URL
2. **Test login**: Navigate to /admin/login, use seeded credentials
3. **Change admin password**: Go to /admin/profile
4. **Import historical data**: Run migration script for SQLite data

### Data Migration from SQLite

**Migration Script:** `scripts/migrate-from-sqlite.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import Database from 'better-sqlite3'
import path from 'path'

const prisma = new PrismaClient()

async function migrate() {
  console.log('Starting migration from SQLite...')

  // Open SQLite database
  const sqlite = new Database(path.join(__dirname, '../data/old-database.sqlite'))

  // Migrate SPPT data
  const spptRows = sqlite.prepare('SELECT * FROM arsip_sppt').all()
  
  for (const row of spptRows) {
    await prisma.arsipSppt.upsert({
      where: {
        tahun_kecamatan_desa: {
          tahun: row.tahun,
          kecamatan: row.kecamatan,
          desa: row.desa,
        },
      },
      update: {
        buku1: row.buku1 || 0,
        buku2: row.buku2 || 0,
        buku3: row.buku3 || 0,
        buku4: row.buku4 || 0,
        buku5: row.buku5 || 0,
      },
      create: {
        tahun: row.tahun,
        kecamatan: row.kecamatan,
        desa: row.desa,
        buku1: row.buku1 || 0,
        buku2: row.buku2 || 0,
        buku3: row.buku3 || 0,
        buku4: row.buku4 || 0,
        buku5: row.buku5 || 0,
      },
    })
  }

  console.log(`Migrated ${spptRows.length} SPPT records`)

  // Migrate STTS data
  const sttsRows = sqlite.prepare('SELECT * FROM arsip_stts').all()
  
  for (const row of sttsRows) {
    await prisma.arsipStts.upsert({
      where: {
        tahun_kecamatan_desa: {
          tahun: row.tahun,
          kecamatan: row.kecamatan,
          desa: row.desa,
        },
      },
      update: {
        buku1: row.buku1 || 0,
        buku2: row.buku2 || 0,
        buku3: row.buku3 || 0,
        buku4: row.buku4 || 0,
        buku5: row.buku5 || 0,
      },
      create: {
        tahun: row.tahun,
        kecamatan: row.kecamatan,
        desa: row.desa,
        buku1: row.buku1 || 0,
        buku2: row.buku2 || 0,
        buku3: row.buku3 || 0,
        buku4: row.buku4 || 0,
        buku5: row.buku5 || 0,
      },
    })
  }

  console.log(`Migrated ${sttsRows.length} STTS records`)

  sqlite.close()
  await prisma.$disconnect()
  
  console.log('Migration completed successfully!')
}

migrate().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
```

**Run migration:**
```bash
# After deploying to production
npx tsx scripts/migrate-from-sqlite.ts
```

---

## Security Considerations

### 1. Authentication Security

**JWT Token Security:**
- Tokens stored in httpOnly cookies (not accessible via JavaScript)
- Secure flag enabled in production (HTTPS only)
- SameSite=Lax prevents CSRF attacks
- 8-hour expiration reduces token lifetime risk
- Secret key minimum 32 characters from environment variable

**Password Security:**
- bcryptjs with 10 salt rounds (industry standard)
- Passwords never logged or displayed
- Password strength validation (minimum 8 characters)
- Rate limiting on login (5 attempts per 15 minutes)

### 2. Input Validation

**Server-Side Validation:**
- All inputs validated with zod schemas
- Type checking enforced at runtime
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's automatic escaping

**Validation Rules:**
```typescript
// Integer validation with bounds
z.number().int().min(0).max(999999)

// String validation with length limits
z.string().min(1).max(100)

// Alphanumeric username
z.string().regex(/^[a-zA-Z0-9]+$/)

// Year range validation
z.number().int().min(2000).max(2100)
```

### 3. Database Security

**Prisma Best Practices:**
- Connection pooling for performance
- Parameterized queries prevent SQL injection
- Transaction isolation for data consistency
- Row-level locking where needed

**Access Control:**
- Database credentials in environment variables
- Separate read/write credentials (if needed in future)
- Connection string not exposed in client code

### 4. API Security

**Server Actions:**
- All mutations require session validation
- CSRF protection via Next.js built-in mechanisms
- Rate limiting on sensitive operations

**Route Handlers:**
- Session validation for protected routes
- Input sanitization before processing
- Binary response sanitization for Excel export

### 5. Deployment Security

**Environment Variables:**
- Never commit `.env` files to version control
- Use `.env.example` for documentation only
- Rotate `AUTH_SECRET` regularly
- Change default admin password immediately

**HTTPS Enforcement:**
- Vercel provides HTTPS by default
- Secure cookies only work over HTTPS in production
- HSTS headers recommended

### 6. Client-Side Security

**React Best Practices:**
- Use dangerouslySetInnerHTML only when absolutely necessary (not used in this app)
- Sanitize user input before rendering
- Validate data on both client and server

**CSP Headers (Future Enhancement):**
```typescript
// Add to next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
]
```

---

## Performance Optimization

### 1. Database Query Optimization

**Indexes:**
- All filter fields indexed (tahun, kecamatan, desa)
- Composite unique index on [tahun, kecamatan, desa]
- urutan field indexed for sorting

**Query Patterns:**
- Use `findMany` with `where` clause for filtering
- Use `select` to fetch only needed fields
- Use `include` sparingly (only when relations needed)
- Batch operations with `createMany` and `updateMany`

### 2. Server Components

**Benefits:**
- Zero JavaScript sent to client for data display
- Reduced bundle size
- Better SEO with server-rendered HTML
- Automatic code splitting

**Implementation:**
```typescript
// app/(public)/page.tsx - Server Component
export default async function HomePage({ searchParams }) {
  // Data fetching on server
  const data = await prisma.arsipSppt.findMany({
    where: {
      tahun: searchParams.tahun ? parseInt(searchParams.tahun) : undefined,
    },
  })

  // Render on server
  return <ArsipView data={data} />
}
```

### 3. Dynamic Rendering

**Strategy:**
- All pages use dynamic rendering (no static generation)
- Data changes frequently (admin updates)
- Filters use query parameters (different for each user)

**Configuration:**
```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 4. Excel Export Optimization

**Streaming Response:**
```typescript
// Stream large files instead of loading into memory
const buffer = await workbook.xlsx.writeBuffer()
return new Response(buffer, {
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
  },
})
```

**Pagination (Future Enhancement):**
- For very large exports (>10,000 rows), implement pagination
- Generate multiple sheets if needed
- Add progress indicator

### 5. Client-Side Optimization

**Code Splitting:**
- Next.js automatically splits by route
- Client components loaded only when needed
- Dynamic imports for heavy components

**Asset Optimization:**
- Tailwind CSS purges unused styles
- No images currently (text-only app)
- If images added later, use Next.js Image component

### 6. Caching Strategy

**Server Actions:**
- Use `revalidatePath()` after mutations
- Cache static data (Kecamatan, Desa lists) with `unstable_cache`

**API Routes:**
- Cache headers for static resources
- No caching for dynamic data

---

## Accessibility Compliance

### 1. Semantic HTML

**Structure:**
- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic elements (`<nav>`, `<main>`, `<section>`, `<article>`)
- Use `<button>` for actions, `<a>` for navigation
- Use `<table>` with proper headers for data tables

### 2. ARIA Labels

**Interactive Elements:**
```typescript
<button aria-label="Export ke Excel">
  <DownloadIcon />
</button>

<input
  type="search"
  aria-label="Cari kecamatan atau desa"
  placeholder="Cari..."
/>

<select aria-label="Filter tahun">
  <option value="">Semua Tahun</option>
</select>
```

### 3. Keyboard Navigation

**Requirements:**
- All interactive elements reachable via Tab
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate dropdowns
- Focus indicators visible (not removed)

**Implementation:**
```typescript
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSave()
    }
  }}
  className="focus:ring-2 focus:ring-emerald-500 focus:outline-none"
>
  Simpan
</button>
```

### 4. Color Contrast

**WCAG AA Compliance:**
- Text on background: minimum 4.5:1 contrast ratio
- Large text (18pt+): minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio

**Color Palette:**
- Text: #374151 (gray-700) on #FFFFFF (white) = 10.4:1 ✓
- Primary: #047857 (emerald-700) on #FFFFFF = 4.6:1 ✓
- Error: #DC2626 (red-600) on #FEE2E2 (red-50) = 7.2:1 ✓

### 5. Screen Reader Support

**Data Tables:**
```typescript
<table>
  <caption className="sr-only">Data Arsip SPPT per Kecamatan dan Desa</caption>
  <thead>
    <tr>
      <th scope="col">Kecamatan</th>
      <th scope="col">Desa</th>
      <th scope="col">Buku 1</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Caringin</th>
      <td>Cimande</td>
      <td>100</td>
    </tr>
  </tbody>
</table>
```

**Loading States:**
```typescript
<div role="status" aria-live="polite">
  {isLoading ? 'Memuat data...' : 'Data berhasil dimuat'}
</div>
```

### 6. Form Accessibility

**Labels and Errors:**
```typescript
<div>
  <label htmlFor="buku1" className="block text-sm font-medium">
    Buku 1
  </label>
  <input
    id="buku1"
    type="text"
    aria-describedby={error ? 'buku1-error' : undefined}
    aria-invalid={!!error}
  />
  {error && (
    <p id="buku1-error" className="text-red-600 text-sm">
      {error}
    </p>
  )}
</div>
```

**Note:** Full WCAG compliance requires manual testing with screen readers (NVDA, JAWS, VoiceOver) and automated tools (axe, Lighthouse). This design provides the foundation for accessibility but does not guarantee complete compliance without testing.

---

## Complete File Structure

```
arsip-pbb-nextjs/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD for database migrations
│
├── app/
│   ├── (public)/               # Public route group
│   │   ├── page.tsx           # SPPT view at /
│   │   ├── stts/
│   │   │   └── page.tsx       # STTS view at /stts
│   │   └── layout.tsx         # Public layout (minimal)
│   │
│   ├── (panel)/               # Admin route group
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx   # Login page
│   │       ├── dashboard/
│   │       │   └── page.tsx   # Admin dashboard
│   │       ├── data/
│   │       │   └── page.tsx   # SPPT data management
│   │       ├── data-stts/
│   │       │   └── page.tsx   # STTS data management
│   │       ├── tahun/
│   │       │   └── page.tsx   # SPPT year management
│   │       ├── tahun-stts/
│   │       │   └── page.tsx   # STTS year management
│   │       ├── kecamatan/
│   │       │   ├── page.tsx              # Kecamatan list
│   │       │   └── [id]/
│   │       │       └── desas/
│   │       │           └── page.tsx      # Desa management
│   │       ├── profile/
│   │       │   └── page.tsx   # Profile management
│   │       └── layout.tsx     # Admin layout with navigation
│   │
│   ├── api/
│   │   ├── export/
│   │   │   └── route.ts       # SPPT Excel export
│   │   └── stts/
│   │       └── export/
│   │           └── route.ts   # STTS Excel export
│   │
│   ├── actions/               # Server Actions
│   │   ├── auth.ts           # Login, logout, session
│   │   ├── arsip-sppt.ts     # SPPT CRUD
│   │   ├── arsip-stts.ts     # STTS CRUD
│   │   ├── kecamatan.ts      # Kecamatan CRUD + transactions
│   │   ├── desa.ts           # Desa CRUD + transactions
│   │   ├── profile.ts        # Profile updates
│   │   └── tahun.ts          # Year management
│   │
│   ├── layout.tsx            # Root layout
│   ├── loading.tsx           # Global loading
│   ├── error.tsx             # Global error boundary
│   └── not-found.tsx         # 404 page
│
├── components/
│   ├── ArsipView.tsx         # Shared SPPT/STTS display
│   ├── DataEditor.tsx        # Shared data entry grid
│   ├── Filters.tsx           # Filter controls
│   ├── SummaryCards.tsx      # Statistics cards
│   ├── DataTable.tsx         # Responsive table
│   ├── HistoryTable.tsx      # Yearly summary
│   ├── AdminNav.tsx          # Admin navigation
│   ├── ExportButton.tsx      # Excel export trigger
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Select.tsx
│       └── Modal.tsx
│
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── auth.ts               # JWT utilities
│   ├── format.ts             # Number formatting
│   ├── validation.ts         # Zod schemas
│   ├── rate-limit.ts         # Login rate limiting
│   └── error-messages.ts     # Indonesian error messages
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
│
├── scripts/
│   └── migrate-from-sqlite.ts # SQLite migration
│
├── tests/
│   ├── lib/
│   │   ├── format.test.ts           # Unit tests
│   │   ├── format.property.test.ts  # Property tests
│   │   ├── validation.test.ts
│   │   ├── validation.property.test.ts
│   │   └── auth.property.test.ts
│   ├── components/
│   │   ├── SummaryCards.test.tsx
│   │   ├── DataTable.test.tsx
│   │   └── Filters.test.tsx
│   ├── actions/
│   │   ├── arsip-sppt.test.ts
│   │   ├── kecamatan.integration.test.ts
│   │   └── auth.test.ts
│   └── api/
│       └── export/
│           └── route.integration.test.ts
│
├── .env.example              # Environment variable template
├── .gitignore
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Vitest configuration
├── vitest.setup.ts           # Test setup
├── package.json
├── README.md                 # Deployment guide
├── middleware.ts             # Route protection
└── postcss.config.mjs        # PostCSS configuration
```

---

## Summary

This design document provides a comprehensive technical blueprint for migrating the Arsip Data PBB application from Laravel to Next.js. The design emphasizes:

1. **Modern Stack**: Next.js 14 App Router with TypeScript, Tailwind CSS, Prisma ORM
2. **Server-First**: Leverage server components and server actions for optimal performance
3. **Type Safety**: End-to-end type safety with TypeScript and Prisma
4. **Security**: JWT authentication, input validation, rate limiting, transaction handling
5. **Reusability**: Shared components between SPPT and STTS features
6. **Indonesian Localization**: Number formatting and error messages
7. **Deployment Ready**: Configured for Vercel with detailed deployment steps
8. **Testing Strategy**: Dual approach with property-based tests for pure functions and integration tests for complex workflows

The implementation should follow this design closely while maintaining flexibility to adapt to discoveries during development. All correctness properties identified should be implemented as property-based tests with minimum 100 iterations each.

