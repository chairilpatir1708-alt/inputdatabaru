# Requirements Document

## Introduction

Aplikasi web Arsip Data PBB (Pajak Bumi dan Bangunan) adalah sistem informasi untuk mengelola dan menampilkan data arsip SPPT (Surat Pemberitahuan Pajak Terutang) dan STTS (Surat Tanda Terima Setoran) dari tiga kecamatan. Aplikasi menyimpan jumlah lembar dokumen per tahun, per kecamatan, per desa, yang dikelompokkan dalam 5 kategori "Buku" berdasarkan besaran pajak. Aplikasi dibangun dengan Next.js, menggunakan PostgreSQL sebagai database, dan dapat di-deploy ke Vercel secara gratis.

## Glossary

- **System**: Aplikasi web Arsip Data PBB
- **SPPT**: Surat Pemberitahuan Pajak Terutang
- **STTS**: Surat Tanda Terima Setoran
- **Buku**: Kategori pengelompokan data berdasarkan besaran pajak (Buku 1-5)
- **Admin**: Pengguna dengan hak akses untuk mengelola data
- **Public_User**: Pengunjung yang dapat melihat data tanpa login
- **Database**: PostgreSQL database yang menyimpan seluruh data aplikasi
- **Session**: Sesi autentikasi pengguna admin menggunakan JWT di cookie
- **Prisma**: ORM untuk berinteraksi dengan database
- **Server_Action**: Fungsi server-side di Next.js untuk mutasi data
- **Route_Handler**: API endpoint di Next.js untuk operasi tertentu
- **Middleware**: Komponen yang memproteksi route admin

## Requirements

### Requirement 1: Database Schema dan Model

**User Story:** As a developer, I want to define database models with Prisma, so that the application can store and retrieve data efficiently.

#### Acceptance Criteria

1. THE System SHALL create an ArsipSppt model with fields: id, tahun (Int), kecamatan (String), desa (String), buku1 through buku5 (Int with default 0), createdAt, updatedAt, with unique constraint on [tahun, kecamatan, desa] and indexes on tahun, kecamatan, and desa
2. THE System SHALL create an ArsipStts model with identical structure to ArsipSppt
3. THE System SHALL create a Kecamatan model with fields: id, nama (String unique), urutan (Int default 0), createdAt, updatedAt
4. THE System SHALL create a Desa model with fields: id, kecamatanId (relation to Kecamatan with onDelete Cascade), nama, urutan (Int default 0), createdAt, updatedAt, with unique constraint on [kecamatanId, nama]
5. THE System SHALL create an AdminUser model with fields: id, username (String unique), password (String hashed), name, createdAt, updatedAt
6. WHEN a Kecamatan name is updated, THE System SHALL update all related ArsipSppt and ArsipStts records with the new name in a single transaction
7. WHEN a Desa name is updated, THE System SHALL update all related ArsipSppt and ArsipStts records with the new name in a single transaction
8. WHEN a Kecamatan or Desa is deleted, THE System SHALL preserve existing ArsipSppt and ArsipStts records

### Requirement 2: Data Seeding

**User Story:** As a developer, I want to seed initial data into the database, so that the application has necessary reference data and admin account on first deployment.

#### Acceptance Criteria

1. THE System SHALL seed three Kecamatan records: Caringin, Cigombong, Cijeruk with urutan values 1, 2, 3 respectively
2. THE System SHALL seed Desa records for Caringin: Caringin, Ciderum, Ciherang Pondok, Cimande, Cimande Hilir, Cinagara, Lemah Duhur, Muara Jaya, Pancawati, Pasir Buncir, Pasir Muncang, Tangkil
3. THE System SHALL seed Desa records for Cigombong: Ciadeg, Ciburayut, Ciburuy, Cigombong, Cisalada, Pasir Jaya, Srogol, Tugu Jaya, Watesjaya
4. THE System SHALL seed Desa records for Cijeruk: Cibalung, Cijeruk, Cipelang, Cipicung, Palasari, Sukaharja, Tajur Halang, Tanjungsari, Warung Menteng
5. THE System SHALL seed an initial AdminUser with username, password (bcrypt hashed), and name from environment variables ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_NAME
6. THE System SHALL provide a mechanism to import historical SPPT and STTS data for years 2016-2026 from existing SQLite database

### Requirement 3: Authentication System

**User Story:** As an admin, I want to login securely to the system, so that I can access administrative features.

#### Acceptance Criteria

1. WHEN an admin submits valid credentials, THE System SHALL create a JWT token with user data and store it in an httpOnly, secure (in production), sameSite=lax cookie with 8-hour expiration
2. WHEN an admin submits invalid credentials, THE System SHALL return an error message and increment login attempt counter
3. WHEN login attempts exceed 5 within 15 minutes from same IP, THE System SHALL temporarily block login attempts for that IP
4. THE System SHALL use bcryptjs to hash passwords with salt rounds of 10
5. THE System SHALL use jose library for JWT signing and verification with AUTH_SECRET from environment variables
6. THE System SHALL provide a logout function that clears the session cookie

### Requirement 4: Authorization and Route Protection

**User Story:** As a system administrator, I want to ensure only authenticated admins can access admin features, so that data remains secure.

#### Acceptance Criteria

1. THE System SHALL implement middleware.ts that checks for valid JWT token in cookies for all routes matching /admin/* except /admin/login
2. WHEN a user accesses /admin/* routes without valid session, THE System SHALL redirect to /admin/login
3. THE System SHALL verify JWT token signature using AUTH_SECRET from environment variables
4. THE System SHALL check token expiration and reject expired tokens
5. THE System SHALL validate session in all Server Actions that modify data
6. THE System SHALL validate session in all Route Handlers that return sensitive data

### Requirement 5: Public SPPT Data Display

**User Story:** As a public user, I want to view SPPT archive data with filtering options, so that I can find specific information easily.

#### Acceptance Criteria

1. THE System SHALL display SPPT data on the root path (/) with title "Arsip Data SPPT (PBB)"
2. THE System SHALL provide filter controls for Tahun (year), Kecamatan (district), and Desa (village) using query parameters
3. THE System SHALL provide a search input that filters data by Kecamatan or Desa name
4. THE System SHALL display 6 summary cards showing totals for Buku 1, Buku 2, Buku 3, Buku 4, Buku 5, and Total SPPT
5. THE System SHALL display a data table with columns: Kecamatan, Desa, Buku 1, Buku 2, Buku 3, Buku 4, Buku 5, Total
6. THE System SHALL format all numbers with Indonesian thousand separator (dot)
7. THE System SHALL display a legend explaining Buku categories with their rupiah ranges
8. THE System SHALL display a "Riwayat Per Tahun" section showing yearly summary with columns: Tahun, Buku 1-5, Total SPPT
9. THE System SHALL provide an "Export ke Excel" button that downloads filtered data
10. THE System SHALL sort Kecamatan and Desa by their urutan field

### Requirement 6: Public STTS Data Display

**User Story:** As a public user, I want to view STTS archive data with filtering options, so that I can find specific information easily.

#### Acceptance Criteria

1. THE System SHALL display STTS data on the /stts path with title "Arsip Data STTS (PBB)"
2. THE System SHALL provide identical filtering, display, and export functionality as SPPT page but using ArsipStts data source
3. THE System SHALL maintain tab navigation between SPPT and STTS pages with active tab indicated by green underline

### Requirement 7: Excel Export Functionality

**User Story:** As a public user, I want to export filtered data to Excel format, so that I can analyze data offline.

#### Acceptance Criteria

1. WHEN a public user clicks "Export ke Excel" on SPPT page, THE System SHALL generate an Excel file from /export route handler
2. WHEN a public user clicks "Export ke Excel" on STTS page, THE System SHALL generate an Excel file from /stts/export route handler
3. THE System SHALL use exceljs library in a route handler with runtime="nodejs"
4. THE System SHALL name the file following pattern: arsip_sppt_{tahun}[_{kecamatan}][_{desa}].xlsx or arsip_stts_{tahun}[_{kecamatan}][_{desa}].xlsx
5. THE System SHALL include sheet with headers: Kecamatan, Desa, Buku 1-5, Total
6. WHEN export includes multiple Kecamatan records, THE System SHALL add subtotal rows per Kecamatan
7. THE System SHALL add a grand total row at the end showing sum of all Buku columns
8. THE System SHALL apply formatting with borders, bold headers, and number format with thousand separators
9. THE System SHALL respect query parameters (tahun, kecamatan, desa) when filtering export data

### Requirement 8: Admin Dashboard

**User Story:** As an admin, I want to see overview statistics on the dashboard, so that I can quickly assess the current data state.

#### Acceptance Criteria

1. THE System SHALL display 4 summary cards on /admin/dashboard: Jumlah Kecamatan, Jumlah Desa, Jumlah Tahun (distinct years in SPPT), Total Record (SPPT count)
2. THE System SHALL display a table showing the 5 most recent years with columns: Tahun, Jumlah Record, Total SPPT
3. THE System SHALL calculate Total SPPT as sum of buku1 through buku5
4. THE System SHALL order the recent years table by year descending

### Requirement 9: Admin SPPT Data Management

**User Story:** As an admin, I want to input and update SPPT data per desa, so that I can maintain accurate records.

#### Acceptance Criteria

1. THE System SHALL display /admin/data page with filters for Tahun and Kecamatan
2. THE System SHALL display a table with one row per Desa showing input fields for Buku 1-5 and calculated Total
3. THE System SHALL format input values with thousand separator (dot) as user types
4. THE System SHALL display zero values as empty input fields
5. THE System SHALL calculate and display Total automatically when any Buku input changes
6. THE System SHALL provide a "Simpan" button per row that saves data via Server Action or Route Handler
7. WHEN save is successful, THE System SHALL display success feedback (green checkmark or message)
8. WHEN save fails, THE System SHALL display error message
9. THE System SHALL validate that Buku values are non-negative integers
10. THE System SHALL create new ArsipSppt record if [tahun, kecamatan, desa] combination doesn't exist, or update existing record

### Requirement 10: Admin SPPT Year Management

**User Story:** As an admin, I want to manage SPPT data years, so that I can add new years or remove obsolete data.

#### Acceptance Criteria

1. THE System SHALL display /admin/tahun page with table showing: Tahun, Jumlah Record, Total SPPT, and Hapus button
2. THE System SHALL provide "Tambah Tahun" form with year input (range 2000-2100) and optional "Salin dari tahun" dropdown
3. WHEN admin adds new year without copy option, THE System SHALL create empty records for all Kecamatan-Desa combinations with buku1-5 set to 0
4. WHEN admin adds new year with copy option, THE System SHALL duplicate all SPPT records from selected source year to new year
5. WHEN admin clicks Hapus button, THE System SHALL display confirmation dialog
6. WHEN admin confirms deletion, THE System SHALL delete all ArsipSppt records matching that year
7. THE System SHALL prevent deletion if it would result in zero years remaining

### Requirement 11: Admin STTS Data Management

**User Story:** As an admin, I want to input and update STTS data per desa, so that I can maintain accurate records.

#### Acceptance Criteria

1. THE System SHALL provide /admin/data-stts page with identical functionality to /admin/data but operating on ArsipStts model
2. THE System SHALL apply all validation and formatting rules from Requirement 9 to STTS data

### Requirement 12: Admin STTS Year Management

**User Story:** As an admin, I want to manage STTS data years, so that I can add new years or remove obsolete data.

#### Acceptance Criteria

1. THE System SHALL provide /admin/tahun-stts page with identical functionality to /admin/tahun but operating on ArsipStts model
2. THE System SHALL apply all year management rules from Requirement 10 to STTS data

### Requirement 13: Kecamatan Management

**User Story:** As an admin, I want to manage Kecamatan master data, so that I can maintain accurate reference data.

#### Acceptance Criteria

1. THE System SHALL display /admin/kecamatan page with table showing: Nama, Urutan, Jumlah Desa, and action buttons
2. THE System SHALL provide "Tambah Kecamatan" form with nama and urutan inputs
3. WHEN admin creates Kecamatan, THE System SHALL validate that nama is unique
4. THE System SHALL provide "Edit" button that opens inline or modal form to update nama and urutan
5. WHEN admin updates Kecamatan nama, THE System SHALL update all related ArsipSppt and ArsipStts records in a transaction
6. THE System SHALL provide "Kelola Desa" link that navigates to /admin/kecamatan/[id]/desas
7. THE System SHALL provide "Hapus" button with confirmation dialog
8. WHEN admin deletes Kecamatan, THE System SHALL cascade delete all related Desa records but preserve ArsipSppt and ArsipStts records
9. THE System SHALL validate nama is not empty and urutan is a non-negative integer

### Requirement 14: Desa Management

**User Story:** As an admin, I want to manage Desa master data per Kecamatan, so that I can maintain accurate reference data.

#### Acceptance Criteria

1. THE System SHALL display /admin/kecamatan/[id]/desas page with table showing: Nama, Urutan, and action buttons
2. THE System SHALL display Kecamatan name as page title or breadcrumb
3. THE System SHALL provide "Tambah Desa" form with nama and urutan inputs
4. WHEN admin creates Desa, THE System SHALL validate that nama is unique within the Kecamatan
5. THE System SHALL provide "Edit" button that opens inline or modal form to update nama and urutan
6. WHEN admin updates Desa nama, THE System SHALL update all related ArsipSppt and ArsipStts records in a transaction
7. THE System SHALL provide "Hapus" button with confirmation dialog
8. WHEN admin deletes Desa, THE System SHALL preserve ArsipSppt and ArsipStts records
9. THE System SHALL validate nama is not empty and urutan is a non-negative integer

### Requirement 15: Admin Profile Management

**User Story:** As an admin, I want to update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. THE System SHALL display /admin/profile page with forms to update name, username, and password
2. THE System SHALL provide "Ubah Nama" form that updates AdminUser.name
3. THE System SHALL provide "Ubah Username" form that validates username uniqueness before updating
4. THE System SHALL provide "Ubah Password" form requiring old password, new password, and confirmation
5. WHEN admin changes password, THE System SHALL verify old password matches stored hash using bcryptjs
6. WHEN admin changes password, THE System SHALL hash new password with bcryptjs before storing
7. THE System SHALL validate that new username is unique across all AdminUser records
8. THE System SHALL validate password strength (minimum 8 characters)
9. WHEN profile update succeeds, THE System SHALL display success message
10. WHEN profile update fails, THE System SHALL display error message with reason

### Requirement 16: Admin Navigation and Layout

**User Story:** As an admin, I want consistent navigation across admin pages, so that I can easily access different features.

#### Acceptance Criteria

1. THE System SHALL display navigation bar on all /admin/* pages except /admin/login
2. THE System SHALL include navigation links: Dashboard, SPPT - Data, SPPT - Tahun, STTS - Data, STTS - Tahun, Kelola Wilayah, Profil, Lihat Publik, Logout
3. WHEN admin clicks "Lihat Publik", THE System SHALL navigate to root path (/)
4. WHEN admin clicks "Logout", THE System SHALL clear session cookie and redirect to /
5. THE System SHALL highlight current active page in navigation

### Requirement 17: Hidden Admin Access from Public Page

**User Story:** As an admin, I want a hidden way to access admin login from public page, so that the admin panel is not obvious to regular visitors.

#### Acceptance Criteria

1. THE System SHALL display a small "Admin" text or link on public pages
2. WHEN a user clicks the page title 3 times within 1 second, THE System SHALL navigate to /admin/login
3. THE System SHALL not display obvious "Admin Panel" or "Login" buttons on public pages

### Requirement 18: Responsive Design and Mobile Support

**User Story:** As a user, I want the application to work well on mobile devices, so that I can access it from any device.

#### Acceptance Criteria

1. THE System SHALL use Tailwind CSS for responsive styling
2. THE System SHALL ensure all pages are usable on mobile screens (width >= 375px)
3. WHEN a table exceeds viewport width, THE System SHALL allow horizontal scrolling
4. THE System SHALL use appropriate touch targets (minimum 44x44px) for buttons on mobile
5. THE System SHALL stack filter controls vertically on small screens
6. THE System SHALL make navigation menu collapsible or scrollable on mobile

### Requirement 19: Visual Design and Theming

**User Story:** As a user, I want a clean and professional interface with consistent branding, so that the application is pleasant to use.

#### Acceptance Criteria

1. THE System SHALL use primary color #047857 (emerald-700) for main actions and active states
2. THE System SHALL use #064e3b (emerald-900) for titles and headings
3. THE System SHALL use #059669 (emerald-600) for hover states and success messages
4. THE System SHALL use background color #f9fafb (gray-50) for page backgrounds
5. THE System SHALL use #e5e7eb (gray-200) for borders
6. THE System SHALL use #374151 (gray-700) and #6b7280 (gray-500) for text
7. THE System SHALL use #dc2626 (red-600) for error messages with #fee2e2 (red-50) background
8. THE System SHALL use system font stack for typography
9. THE System SHALL use rounded corners and subtle shadows on cards
10. THE System SHALL ensure minimum contrast ratio of 4.5:1 for text readability

### Requirement 20: Loading and Error States

**User Story:** As a user, I want clear feedback during loading and error conditions, so that I understand the application state.

#### Acceptance Criteria

1. THE System SHALL provide loading.tsx for async pages showing loading indicator
2. THE System SHALL provide error.tsx for error boundaries with user-friendly message
3. THE System SHALL provide not-found.tsx for 404 errors
4. WHEN a form submission is in progress, THE System SHALL disable submit button and show loading indicator
5. WHEN an error occurs during data mutation, THE System SHALL display error message without crashing the page

### Requirement 21: Input Validation

**User Story:** As a developer, I want robust input validation, so that invalid data does not enter the database.

#### Acceptance Criteria

1. THE System SHALL use zod for all input validation on server-side
2. THE System SHALL validate that Buku values are integers between 0 and 999999
3. THE System SHALL validate that year values are integers between 2000 and 2100
4. THE System SHALL validate that nama fields are non-empty strings with maximum length 100
5. THE System SHALL validate that urutan fields are non-negative integers
6. THE System SHALL validate that username is alphanumeric with length 3-50
7. THE System SHALL validate that password has minimum length 8
8. WHEN validation fails, THE System SHALL return descriptive error messages in Indonesian

### Requirement 22: Number Formatting

**User Story:** As a user, I want numbers displayed in Indonesian format, so that they are easy to read.

#### Acceptance Criteria

1. THE System SHALL format all integer displays with dot (.) as thousand separator
2. THE System SHALL format numbers without decimal places
3. THE System SHALL display zero values as empty strings in input fields
4. THE System SHALL parse user input removing thousand separators before saving to database

### Requirement 23: Data Consistency and Transactions

**User Story:** As a developer, I want data consistency guarantees, so that related records remain synchronized.

#### Acceptance Criteria

1. WHEN a Kecamatan name is updated, THE System SHALL update all matching ArsipSppt and ArsipStts records within a Prisma transaction
2. WHEN a Desa name is updated, THE System SHALL update all matching ArsipSppt and ArsipStts records within a Prisma transaction
3. IF any update within a transaction fails, THE System SHALL roll back all changes
4. THE System SHALL use Prisma transactions for all multi-table operations

### Requirement 24: Environment Configuration

**User Story:** As a developer, I want environment-based configuration, so that the application can be deployed to different environments.

#### Acceptance Criteria

1. THE System SHALL read DATABASE_URL from environment variables for Prisma connection
2. THE System SHALL read DIRECT_URL from environment variables for migrations (if using connection pooling)
3. THE System SHALL read AUTH_SECRET from environment variables for JWT signing
4. THE System SHALL read ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME from environment variables for initial seed
5. THE System SHALL provide .env.example file documenting all required environment variables
6. THE System SHALL not include actual secrets in source code or git repository
7. THE System SHALL use NODE_ENV to determine production vs development behavior

### Requirement 25: Deployment to Vercel

**User Story:** As a developer, I want to deploy the application to Vercel, so that it is accessible on the internet.

#### Acceptance Criteria

1. THE System SHALL include postinstall script that runs "prisma generate"
2. THE System SHALL include build script that runs "prisma generate && next build"
3. THE System SHALL use dynamic rendering for pages that query the database
4. THE System SHALL configure runtime="nodejs" for route handlers that use exceljs
5. THE System SHALL support PostgreSQL connection via Vercel Postgres, Neon, or Supabase
6. THE System SHALL provide README.md with step-by-step deployment instructions
7. THE System SHALL document how to set environment variables in Vercel dashboard
8. THE System SHALL document how to run database migrations on Vercel

### Requirement 26: Parser and Serialization

**User Story:** As a developer, I want to parse and serialize JWT tokens correctly, so that authentication works reliably.

#### Acceptance Criteria

1. THE System SHALL use jose library to sign JWT tokens with user data payload
2. THE System SHALL use jose library to verify and parse JWT tokens from cookies
3. WHEN JWT parsing succeeds, THE System SHALL extract user data from payload
4. WHEN JWT parsing fails, THE System SHALL treat the session as invalid
5. FOR ALL valid user sessions, signing then verifying a JWT SHALL produce equivalent user data (round-trip property)

### Requirement 27: Data Migration from SQLite

**User Story:** As a developer, I want to migrate existing SPPT and STTS data from SQLite, so that historical data is preserved.

#### Acceptance Criteria

1. THE System SHALL provide a seed script or migration utility that reads from SQLite database
2. THE System SHALL map SQLite data to Prisma models (ArsipSppt and ArsipStts)
3. THE System SHALL preserve all historical data for years 2016-2026
4. THE System SHALL handle missing or null values by setting them to 0
5. THE System SHALL validate data integrity after migration
6. THE System SHALL provide logs showing migration progress and results

## Buku Category Definitions

For reference, the five Buku categories represent these pajak ranges:

- **Buku 1**: Kurang dari Rp 100.000
- **Buku 2**: Rp 100.000 - Rp 500.000
- **Buku 3**: Rp 500.000 - Rp 2.000.000
- **Buku 4**: Rp 2.000.000 - Rp 5.000.000
- **Buku 5**: Di atas Rp 5.000.000

Note: The values stored in the database are counts (jumlah lembar), not rupiah amounts.
