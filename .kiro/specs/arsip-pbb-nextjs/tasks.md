# Implementation Plan: Arsip Data PBB Next.js

## Overview

Implementasi lengkap aplikasi Arsip Data PBB menggunakan Next.js 14+ dengan TypeScript, PostgreSQL (Prisma ORM), dan deployment ke Vercel. Aplikasi ini mengelola data arsip SPPT dan STTS dari tiga kecamatan dengan sistem autentikasi admin dan fitur ekspor Excel.

## Tasks

### Phase 1: Setup & Foundation

- [x] 1. Initialize Next.js project with TypeScript
  - Create Next.js 14+ project using create-next-app with TypeScript template
  - Configure tsconfig.json with strict mode
  - Setup project structure with app router
  - _Requirements: 25.1, 25.2, 25.3_

- [x] 2. Install and configure dependencies
  - Install Prisma, @prisma/client
  - Install Tailwind CSS (postcss, autoprefixer)
  - Install zod for validation
  - Install bcryptjs and @types/bcryptjs for password hashing
  - Install jose for JWT operations
  - Install exceljs for Excel export
  - Install fast-check for property-based testing
  - _Requirements: 3.4, 7.3, 21.1_

- [x] 3. Configure Tailwind CSS with emerald theme
  - Update tailwind.config.ts with emerald color palette
  - Configure primary colors: emerald-700 (#047857), emerald-900 (#064e3b), emerald-600 (#059669)
  - Configure gray shades for backgrounds and text
  - Setup typography and spacing
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [x] 4. Setup Prisma configuration
  - Create prisma/schema.prisma with PostgreSQL datasource
  - Configure DATABASE_URL and DIRECT_URL environment variables
  - Add postinstall script "prisma generate" to package.json
  - Add build script "prisma generate && next build"
  - _Requirements: 24.1, 24.2, 25.1, 25.2_

### Phase 2: Database Schema & Seed

- [ ] 5. Create Prisma database models
  - [x] 5.1 Define ArsipSppt model with all fields and constraints
    - Create model with id (UUID), tahun, kecamatan, desa, buku1-5 (default 0), timestamps
    - Add unique constraint on [tahun, kecamatan, desa]
    - Add indexes on tahun, kecamatan, desa
    - _Requirements: 1.1_
  
  - [x] 5.2 Define ArsipStts model with identical structure
    - Create model matching ArsipSppt structure
    - _Requirements: 1.2_
  
  - [x] 5.3 Define Kecamatan model with relation to Desa
    - Create model with id, nama (unique), urutan (default 0), timestamps
    - Add relation to Desa model
    - _Requirements: 1.3_
  
  - [x] 5.4 Define Desa model with foreign key to Kecamatan
    - Create model with id, kecamatanId, nama, urutan (default 0), timestamps
    - Add unique constraint on [kecamatanId, nama]
    - Add onDelete: Cascade to kecamatan relation
    - _Requirements: 1.4_
  
  - [x] 5.5 Define AdminUser model for authentication
    - Create model with id, username (unique), password, name, timestamps
    - _Requirements: 1.5_

- [x] 6. Create and run initial database migration
  - Run `prisma migrate dev --name init` to create initial migration
  - Verify migration files in prisma/migrations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 7. Create seed script for reference data
  - [-] 7.1 Create seed script for Kecamatan records
    - Seed Caringin (urutan: 1), Cigombong (urutan: 2), Cijeruk (urutan: 3)
    - _Requirements: 2.1_
  
  - [ ] 7.2 Create seed script for Desa records per Kecamatan
    - Seed 12 desas for Caringin: Caringin, Ciderum, Ciherang Pondok, Cimande, Cimande Hilir, Cinagara, Lemah Duhur, Muara Jaya, Pancawati, Pasir Buncir, Pasir Muncang, Tangkil
    - Seed 9 desas for Cigombong: Ciadeg, Ciburayut, Ciburuy, Cigombong, Cisalada, Pasir Jaya, Srogol, Tugu Jaya, Watesjaya
    - Seed 9 desas for Cijeruk: Cibalung, Cijeruk, Cipelang, Cipicung, Palasari, Sukaharja, Tajur Halang, Tanjungsari, Warung Menteng
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 7.3 Create seed script for initial admin user
    - Read ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME from environment
    - Hash password with bcryptjs (salt rounds: 10)
    - Create AdminUser record
    - _Requirements: 2.5, 3.4, 24.4_

- [ ] 8. Create data migration script for SQLite import
  - Create script to read from existing SQLite database
  - Map SQLite data to ArsipSppt and ArsipStts models
  - Handle null values by setting to 0
  - Provide migration progress logs
  - _Requirements: 2.6, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6_

- [ ] 9. Run seed scripts and verify data
  - Execute `prisma db seed` command
  - Verify Kecamatan, Desa, AdminUser records in database
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

### Phase 3: Core Utilities

- [x] 10. Create Prisma client singleton
  - Create lib/prisma.ts with singleton pattern
  - Prevent multiple instances in development
  - Export prisma client for use in app
  - _Requirements: 1.1_

- [ ] 11. Create authentication utilities
  - [-] 11.1 Implement JWT token creation with jose
    - Create createSession function that generates JWT with 8-hour expiration
    - Set httpOnly, secure (production), sameSite=lax cookie
    - Use AUTH_SECRET from environment
    - _Requirements: 3.1, 3.5, 24.3, 26.1_
  
  - [ ] 11.2 Implement JWT token verification
    - Create getSession function to read and verify JWT cookie
    - Return session payload or null
    - _Requirements: 3.5, 4.3, 4.4, 26.3, 26.4_
  
  - [ ] 11.3 Implement session deletion
    - Create deleteSession function to clear cookie
    - _Requirements: 3.6_
  
  - [ ] 11.4 Implement session requirement helper
    - Create requireSession function for Server Actions
    - Throw error if session invalid
    - _Requirements: 4.5_
  
  - [ ]* 11.5 Write property test for JWT round-trip consistency
    - **Property 1: JWT Round-Trip Consistency**
    - **Validates: Requirements 26.5**
    - Test that signing then verifying a JWT produces equivalent user data
    - Use fast-check to generate random user payloads

- [ ] 12. Create number formatting utilities
  - [-] 12.1 Implement formatNumber function
    - Format integers with dot (.) thousand separator
    - Return empty string for 0, null, undefined
    - _Requirements: 22.1, 22.2, 22.3_
  
  - [ ] 12.2 Implement parseNumber function
    - Remove dot separators and parse to integer
    - Return 0 for invalid input
    - _Requirements: 22.4_
  
  - [ ] 12.3 Implement formatInputValue function
    - Format as user types with dot separators
    - Handle partial input gracefully
    - _Requirements: 9.3, 22.1_
  
  - [ ]* 12.4 Write property tests for number formatting
    - **Property 2: Format-Parse Round-Trip**
    - **Validates: Requirements 22.1, 22.2, 22.4**
    - Test that formatNumber(parseNumber(str)) preserves value for valid inputs
    - **Property 3: Parse Non-Negative**
    - **Validates: Requirements 21.2**
    - Test that parseNumber always returns non-negative integers

- [-] 13. Create validation schemas with zod
  - Create LoginSchema with username (3-50 chars) and password (min 8 chars)
  - Create BukuDataSchema with buku1-5 (int, 0-999999)
  - Create YearSchema (int, 2000-2100)
  - Create KecamatanSchema with nama (1-100 chars) and urutan
  - Create DesaSchema with nama, urutan, kecamatanId
  - Create ProfileUpdateSchema for admin profile updates
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7_

- [-] 14. Create rate limiting utility
  - Implement checkRateLimit function (5 attempts per 15 minutes)
  - Implement incrementAttempts function
  - Implement resetAttempts function
  - Use in-memory Map for storage
  - _Requirements: 3.3_

- [ ] 15. Checkpoint - Verify utilities
  - Test Prisma client connection
  - Test JWT creation and verification manually
  - Test number formatting with sample inputs
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Authentication & Middleware

- [ ] 16. Create middleware for route protection
  - Create middleware.ts to check JWT on /admin/* routes (except /admin/login)
  - Redirect to /admin/login if session invalid
  - Allow access if session valid
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 17. Create login Server Action
  - [ ] 17.1 Implement login action in app/actions/auth.ts
    - Validate credentials with LoginSchema
    - Check rate limit before processing
    - Find AdminUser by username
    - Compare password with bcrypt
    - Create session on success
    - Return error on failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 21.6, 21.7_
  
  - [ ] 17.2 Create logout Server Action
    - Call deleteSession to clear cookie
    - _Requirements: 3.6, 16.4_

- [ ] 18. Create admin login page
  - Create app/(panel)/admin/login/page.tsx
  - Build login form with username and password inputs
  - Display error messages in Indonesian
  - Handle form submission with login action
  - Redirect to /admin/dashboard on success
  - _Requirements: 3.1, 3.2, 21.8_

- [ ] 19. Test authentication flow
  - Test login with valid credentials
  - Test login with invalid credentials
  - Test rate limiting after 5 failed attempts
  - Test middleware redirection
  - Test logout functionality
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

### Phase 5: UI Components Library

- [ ] 20. Create base UI components
  - Create components/ui/Button.tsx with variants (primary, secondary, danger)
  - Create components/ui/Input.tsx with formatting support
  - Create components/ui/Select.tsx for dropdowns
  - Create components/ui/Card.tsx for content containers
  - Create components/ui/Table.tsx for data tables
  - Apply Tailwind styling with emerald theme
  - _Requirements: 19.1, 19.2, 19.3, 19.9_

- [ ] 21. Create Filters component
  - Create components/Filters.tsx as client component
  - Add select dropdowns for Tahun, Kecamatan, Desa
  - Add search input
  - Sync with URL query parameters using useSearchParams
  - Filter Desa options based on selected Kecamatan
  - _Requirements: 5.2, 5.3, 6.2_

- [ ] 22. Create SummaryCards component
  - Create components/SummaryCards.tsx
  - Display 6 cards: Buku 1-5 totals and grand total
  - Format numbers with Indonesian separator
  - Apply emerald theme styling
  - _Requirements: 5.4, 22.1_

- [ ] 23. Create DataTable component
  - Create components/DataTable.tsx
  - Support columns: Kecamatan, Desa, Buku 1-5, Total
  - Format numbers with Indonesian separator
  - Make responsive with horizontal scroll on mobile
  - _Requirements: 5.5, 5.6, 18.3, 22.1_

- [ ] 24. Create AdminNav component
  - Create components/AdminNav.tsx as client component
  - Include navigation links for all admin pages
  - Display current user name
  - Add logout button that calls logout action
  - Highlight active page
  - Make responsive with collapsible menu on mobile
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 18.5, 18.6_

- [ ] 25. Create ExportButton component
  - Create components/ExportButton.tsx
  - Navigate to export route with query parameters
  - Show loading state during export
  - _Requirements: 5.9, 7.1, 7.2_

### Phase 6: Public SPPT Page

- [ ] 26. Create public layout
  - Create app/(public)/layout.tsx with minimal chrome
  - Apply background color and base styling
  - _Requirements: 19.4_

- [ ] 27. Create ArsipView shared component
  - Create components/ArsipView.tsx as server component
  - Accept props: type ('sppt' | 'stts'), data, filters, years, kecamatans, desas
  - Render Filters component
  - Render SummaryCards component
  - Render DataTable component
  - Display Buku category legend
  - Display "Riwayat Per Tahun" section
  - Render ExportButton component
  - _Requirements: 5.2, 5.4, 5.5, 5.7, 5.8, 5.9_

- [ ] 28. Create SPPT public page
  - Create app/(public)/page.tsx as server component
  - Set page title "Arsip Data SPPT (PBB)"
  - Fetch ArsipSppt data with filters from query params
  - Fetch years, kecamatans, desas for filter options
  - Sort by kecamatan and desa urutan
  - Pass data to ArsipView component
  - _Requirements: 5.1, 5.2, 5.10, 6.3_

- [ ] 29. Implement hidden admin access trigger
  - Add triple-click listener on page title
  - Navigate to /admin/login on triple-click
  - Keep admin access subtle
  - _Requirements: 17.2, 17.3_

- [ ] 30. Test SPPT page functionality
  - Test filter by Tahun
  - Test filter by Kecamatan
  - Test filter by Desa
  - Test search functionality
  - Test summary cards calculation
  - Test data table display
  - Test responsive design on mobile
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 18.2, 18.3_

### Phase 7: Public STTS Page

- [ ] 31. Create STTS public page
  - Create app/(public)/stts/page.tsx as server component
  - Set page title "Arsip Data STTS (PBB)"
  - Fetch ArsipStts data with filters from query params
  - Reuse ArsipView component with type='stts'
  - _Requirements: 6.1, 6.2_

- [ ] 32. Add tab navigation between SPPT and STTS
  - Add tab links on both pages
  - Highlight active tab with green underline
  - _Requirements: 6.3_

- [ ] 33. Test STTS page functionality
  - Test all filter and display features
  - Verify identical functionality to SPPT page
  - _Requirements: 6.2_

### Phase 8: Excel Export

- [ ] 34. Create SPPT Excel export route handler
  - [ ] 34.1 Create app/api/export/route.ts with runtime="nodejs"
    - Read query params (tahun, kecamatan, desa)
    - Fetch filtered ArsipSppt data from database
    - _Requirements: 7.1, 7.3, 7.9, 25.4_
  
  - [ ] 34.2 Implement Excel generation with exceljs
    - Create workbook and worksheet
    - Add headers: Kecamatan, Desa, Buku 1-5, Total
    - Add data rows with formatted numbers
    - Add subtotal rows per Kecamatan
    - Add grand total row at bottom
    - Apply borders and bold formatting to headers
    - _Requirements: 7.5, 7.6, 7.7, 7.8_
  
  - [ ] 34.3 Generate filename and stream response
    - Name file: arsip_sppt_{tahun}[_{kecamatan}][_{desa}].xlsx
    - Set proper content-type headers
    - Stream binary data to response
    - _Requirements: 7.4_

- [ ] 35. Create STTS Excel export route handler
  - Create app/api/stts/export/route.ts with identical logic
  - Use ArsipStts data source
  - Name file: arsip_stts_{tahun}[_{kecamatan}][_{desa}].xlsx
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 36. Test Excel export functionality
  - Test export with different filter combinations
  - Verify Excel file structure and formatting
  - Test subtotals and grand totals
  - Verify filename generation
  - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

### Phase 9: Admin Dashboard

- [ ] 37. Create admin layout
  - Create app/(panel)/admin/layout.tsx
  - Include AdminNav component
  - Apply admin panel styling
  - _Requirements: 16.1_

- [ ] 38. Create admin dashboard page
  - Create app/(panel)/admin/dashboard/page.tsx as server component
  - Fetch and display 4 summary cards: Jumlah Kecamatan, Jumlah Desa, Jumlah Tahun, Total Record
  - Fetch and display recent 5 years table with: Tahun, Jumlah Record, Total SPPT
  - Calculate Total SPPT as sum of buku1-5
  - Order years descending
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 39. Test admin dashboard
  - Verify statistics calculations
  - Verify recent years table display
  - Test middleware protection
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

### Phase 10: SPPT Admin Management

- [ ] 40. Create DataEditor component
  - Create components/DataEditor.tsx as client component
  - Accept props: type, tahun, kecamatan, desas, initialData, onSave
  - Render grid with one row per Desa
  - Add formatted inputs for Buku 1-5
  - Calculate and display Total automatically
  - Handle number formatting with formatInputValue
  - Display zero as empty input
  - Add "Simpan" button per row
  - Show success/error feedback per row
  - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 22.1, 22.3_

- [ ] 41. Create SPPT data management Server Actions
  - Create app/actions/arsip-sppt.ts
  - Implement saveArsipSppt action with session validation
  - Use BukuDataSchema for input validation
  - Use upsert pattern for create/update
  - Revalidate affected paths
  - Return success/error result
  - _Requirements: 9.9, 9.10, 21.1, 21.2, 4.5_

- [ ] 42. Create SPPT data management page
  - Create app/(panel)/admin/data/page.tsx as server component
  - Add filters for Tahun and Kecamatan
  - Fetch desas for selected Kecamatan
  - Fetch existing ArsipSppt data
  - Render DataEditor component
  - _Requirements: 9.1, 9.2, 9.10_

- [ ] 43. Test SPPT data management
  - Test data entry with various inputs
  - Test input validation
  - Test save functionality
  - Test success/error feedback
  - Verify upsert behavior (create and update)
  - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

### Phase 11: SPPT Year Management

- [ ] 44. Create SPPT year management Server Actions
  - [ ] 44.1 Implement addSpptYear action
    - Accept year and optional sourceYear
    - Validate year with YearSchema
    - Create empty records for all Kecamatan-Desa combos (if no sourceYear)
    - Copy records from sourceYear (if provided)
    - Use createMany with skipDuplicates
    - _Requirements: 10.3, 10.4, 21.3_
  
  - [ ] 44.2 Implement deleteSpptYear action
    - Accept year to delete
    - Prevent deletion if only one year remains
    - Delete all ArsipSppt records for that year
    - _Requirements: 10.6, 10.7_

- [ ] 45. Create SPPT year management page
  - Create app/(panel)/admin/tahun/page.tsx as server component
  - Display table with: Tahun, Jumlah Record, Total SPPT, Hapus button
  - Add "Tambah Tahun" form with year input and optional "Salin dari tahun" dropdown
  - Handle form submission with addSpptYear action
  - Add confirmation dialog for delete with deleteSpptYear action
  - _Requirements: 10.1, 10.2, 10.5_

- [ ] 46. Test SPPT year management
  - Test adding new year without copy
  - Test adding new year with copy
  - Test delete with confirmation
  - Test delete prevention for last year
  - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7_

### Phase 12: STTS Admin Management

- [ ] 47. Create STTS data management Server Actions
  - Create app/actions/arsip-stts.ts with identical logic to arsip-sppt.ts
  - Use ArsipStts model instead of ArsipSppt
  - _Requirements: 11.1, 11.2_

- [ ] 48. Create STTS data management page
  - Create app/(panel)/admin/data-stts/page.tsx
  - Reuse DataEditor component with type='stts'
  - Apply all patterns from SPPT data management
  - _Requirements: 11.1, 11.2_

- [ ] 49. Create STTS year management Server Actions
  - Create year management actions in app/actions/arsip-stts.ts
  - Use ArsipStts model
  - _Requirements: 12.1, 12.2_

- [ ] 50. Create STTS year management page
  - Create app/(panel)/admin/tahun-stts/page.tsx
  - Apply identical functionality to SPPT year management
  - _Requirements: 12.1, 12.2_

- [ ] 51. Test STTS admin functionality
  - Verify data management works identically to SPPT
  - Verify year management works identically to SPPT
  - _Requirements: 11.1, 11.2, 12.1, 12.2_

### Phase 13: Master Data Management

- [ ] 52. Create Kecamatan management Server Actions
  - [ ] 52.1 Implement createKecamatan action
    - Validate with KecamatanSchema
    - Check nama uniqueness
    - Create Kecamatan record
    - _Requirements: 13.2, 13.3, 13.9_
  
  - [ ] 52.2 Implement updateKecamatan action with transaction
    - Validate with KecamatanSchema
    - Start Prisma transaction
    - Update Kecamatan master record
    - Update all ArsipSppt records with old name
    - Update all ArsipStts records with old name
    - Commit transaction
    - _Requirements: 1.6, 13.4, 13.5, 13.9, 23.1, 23.3_
  
  - [ ] 52.3 Implement deleteKecamatan action
    - Delete Kecamatan (cascade to Desa)
    - Preserve ArsipSppt and ArsipStts records
    - _Requirements: 1.8, 13.7, 13.8_

- [ ] 53. Create Kecamatan management page
  - Create app/(panel)/admin/kecamatan/page.tsx
  - Display table: Nama, Urutan, Jumlah Desa, Actions
  - Add "Tambah Kecamatan" form
  - Add Edit button (inline or modal form)
  - Add "Kelola Desa" link to /admin/kecamatan/[id]/desas
  - Add Hapus button with confirmation dialog
  - _Requirements: 13.1, 13.2, 13.4, 13.6, 13.7_

- [ ] 54. Create Desa management Server Actions
  - [ ] 54.1 Implement createDesa action
    - Validate with DesaSchema
    - Check nama uniqueness within Kecamatan
    - Create Desa record
    - _Requirements: 14.3, 14.4, 14.9_
  
  - [ ] 54.2 Implement updateDesa action with transaction
    - Validate with DesaSchema
    - Start Prisma transaction
    - Fetch Desa with Kecamatan relation
    - Update Desa master record
    - Update all ArsipSppt records with old name
    - Update all ArsipStts records with old name
    - Commit transaction
    - _Requirements: 1.7, 14.5, 14.6, 14.9, 23.2, 23.3_
  
  - [ ] 54.3 Implement deleteDesa action
    - Delete Desa record
    - Preserve ArsipSppt and ArsipStts records
    - _Requirements: 1.8, 14.7, 14.8_

- [ ] 55. Create Desa management page
  - Create app/(panel)/admin/kecamatan/[id]/desas/page.tsx
  - Display Kecamatan name as title/breadcrumb
  - Display table: Nama, Urutan, Actions
  - Add "Tambah Desa" form
  - Add Edit button (inline or modal form)
  - Add Hapus button with confirmation dialog
  - _Requirements: 14.1, 14.2, 14.3, 14.5, 14.7_

- [ ] 56. Test master data management
  - Test Kecamatan CRUD operations
  - Test Desa CRUD operations
  - Test transaction updates for name changes
  - Verify archive data preservation on delete
  - Test validation and error handling
  - _Requirements: 13.3, 13.5, 13.8, 14.4, 14.6, 14.8, 23.1, 23.2, 23.3_

### Phase 14: Admin Profile Management

- [ ] 57. Create profile management Server Actions
  - [ ] 57.1 Implement updateName action
    - Validate name with ProfileUpdateSchema
    - Update AdminUser.name
    - _Requirements: 15.2_
  
  - [ ] 57.2 Implement updateUsername action
    - Validate username uniqueness
    - Validate with ProfileUpdateSchema
    - Update AdminUser.username
    - _Requirements: 15.3, 15.7, 21.6_
  
  - [ ] 57.3 Implement updatePassword action
    - Validate with ProfileUpdateSchema
    - Verify old password with bcrypt
    - Hash new password with bcrypt
    - Update AdminUser.password
    - _Requirements: 15.4, 15.5, 15.6, 15.8, 21.7_

- [ ] 58. Create profile management page
  - Create app/(panel)/admin/profile/page.tsx
  - Add "Ubah Nama" form
  - Add "Ubah Username" form
  - Add "Ubah Password" form (with old password, new password, confirmation)
  - Display success/error messages
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.9, 15.10_

- [ ] 59. Test profile management
  - Test name update
  - Test username update with uniqueness check
  - Test password update with verification
  - Test validation (password strength, username format)
  - Test error messages
  - _Requirements: 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

### Phase 15: Error Handling & Loading States

- [ ] 60. Create global error and loading pages
  - Create app/loading.tsx with spinner and "Memuat..." text
  - Create app/error.tsx with error boundary and "Coba Lagi" button
  - Create app/not-found.tsx with 404 message
  - _Requirements: 20.1, 20.2, 20.3, 21.8_

- [ ] 61. Add Indonesian error messages
  - Create lib/error-messages.ts with all Indonesian error messages
  - Update all Server Actions to use Indonesian messages
  - Handle Prisma errors with Indonesian translations
  - _Requirements: 21.8_

- [ ] 62. Add form loading states
  - Add disabled state and loading indicators to submit buttons
  - Display inline error messages on forms
  - Implement optimistic UI updates where appropriate
  - _Requirements: 20.4, 20.5_

- [ ] 63. Test error handling
  - Test error boundaries with simulated errors
  - Test form validation errors
  - Test network error handling
  - Test database error handling
  - Verify all error messages are in Indonesian
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 21.8_

### Phase 16: Responsive Design & Accessibility

- [ ] 64. Implement responsive mobile design
  - Ensure all pages work on screens >= 375px width
  - Make tables horizontally scrollable on mobile
  - Stack filter controls vertically on small screens
  - Make navigation collapsible on mobile
  - Ensure touch targets are >= 44x44px
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

- [ ] 65. Apply visual design theme consistently
  - Verify emerald color usage across all pages
  - Apply consistent spacing and typography
  - Ensure proper contrast ratios (4.5:1 minimum)
  - Add rounded corners and shadows to cards
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 19.10_

- [ ] 66. Test responsive design
  - Test on mobile (375px), tablet (768px), desktop (1024px+)
  - Verify horizontal scroll on tables
  - Verify collapsible navigation
  - Verify touch target sizes
  - _Requirements: 18.2, 18.3, 18.4, 18.5, 18.6_

### Phase 17: Environment Configuration & Documentation

- [ ] 67. Create environment configuration files
  - Create .env.example with all required variables
  - Document DATABASE_URL format
  - Document DIRECT_URL usage
  - Document AUTH_SECRET generation
  - Document ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME
  - Add .env to .gitignore
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_

- [ ] 68. Create comprehensive README.md
  - Document project overview and features
  - Document technology stack
  - Document environment setup steps
  - Document database setup and migration
  - Document seed script usage
  - Document Vercel deployment steps
  - Document how to set environment variables in Vercel
  - Document how to run migrations on Vercel
  - _Requirements: 25.6, 25.7, 25.8_

- [ ] 69. Verify package.json scripts
  - Ensure "postinstall": "prisma generate" exists
  - Ensure "build": "prisma generate && next build" exists
  - Add "db:seed" script
  - Add "db:migrate" script
  - _Requirements: 25.1, 25.2_

### Phase 18: Testing & Quality Assurance

- [ ] 70. Run build and fix compilation errors
  - Run `npm run build`
  - Fix any TypeScript errors
  - Fix any Next.js build warnings
  - Verify dynamic rendering for database pages
  - _Requirements: 25.2, 25.3_

- [ ] 71. Test complete application flow
  - Test public SPPT page (filters, search, export)
  - Test public STTS page (filters, search, export)
  - Test admin login (success, failure, rate limit)
  - Test admin dashboard
  - Test SPPT data management
  - Test SPPT year management
  - Test STTS data management
  - Test STTS year management
  - Test Kecamatan management
  - Test Desa management
  - Test admin profile management
  - Test logout functionality
  - _Requirements: All requirements_

- [ ] 72. Perform code review and cleanup
  - Remove console.logs from production code
  - Remove unused imports
  - Format code consistently
  - Add comments for complex logic
  - Verify all error handling is in place

### Phase 19: Deployment Preparation

- [ ] 73. Setup PostgreSQL database
  - Choose provider (Vercel Postgres, Neon, or Supabase)
  - Create database instance
  - Get connection URLs (DATABASE_URL and DIRECT_URL)
  - _Requirements: 25.5_

- [ ] 74. Run migrations on production database
  - Set environment variables with production database URLs
  - Run `npx prisma migrate deploy`
  - Run seed script to populate reference data
  - _Requirements: 25.8_

- [ ] 75. Deploy to Vercel
  - Create Vercel project
  - Connect GitHub repository
  - Set all environment variables in Vercel dashboard
  - Trigger deployment
  - Verify deployment success
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8_

- [ ] 76. Post-deployment verification
  - Test public pages on production URL
  - Test admin login and all admin features
  - Test Excel export functionality
  - Verify database connections
  - Test error handling in production
  - _Requirements: All requirements_

### Phase 20: Final Review & Handoff

- [ ] 77. Final checkpoint - Complete application review
  - Verify all requirements are implemented
  - Verify all pages are responsive
  - Verify all error messages are in Indonesian
  - Verify data integrity and transactions
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 78. Create user documentation
  - Document admin login credentials
  - Document how to add/edit data
  - Document how to manage master data
  - Document Excel export usage
  - Create quick start guide

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure validation at critical milestones
- Property tests validate universal correctness properties
- Implementation uses TypeScript throughout
- All user-facing text is in Indonesian
- Database transactions ensure data consistency
- Deployment targets Vercel's free tier

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2", "3", "4"] },
    { "id": 1, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 2, "tasks": ["6", "10"] },
    { "id": 3, "tasks": ["7.1", "7.2", "7.3", "8", "11.1", "11.2", "11.3", "11.4", "12.1", "12.2", "12.3", "13", "14"] },
    { "id": 4, "tasks": ["9", "11.5", "12.4", "16", "17.1", "17.2", "20", "21", "22", "23", "24", "25"] },
    { "id": 5, "tasks": ["18", "19", "26", "27"] },
    { "id": 6, "tasks": ["28", "29", "31", "37"] },
    { "id": 7, "tasks": ["30", "32", "38"] },
    { "id": 8, "tasks": ["33", "34.1", "35", "39", "40", "41"] },
    { "id": 9, "tasks": ["34.2", "42", "44.1", "44.2", "47", "49", "52.1", "52.2", "52.3", "54.1", "54.2", "54.3", "57.1", "57.2", "57.3", "60", "61"] },
    { "id": 10, "tasks": ["34.3", "36", "43", "45", "48", "50", "53", "55", "58", "62", "64", "65", "67", "69"] },
    { "id": 11, "tasks": ["46", "51", "56", "59", "63", "66", "68", "70"] },
    { "id": 12, "tasks": ["71", "72", "73"] },
    { "id": 13, "tasks": ["74"] },
    { "id": 14, "tasks": ["75"] },
    { "id": 15, "tasks": ["76", "78"] }
  ]
}
```
