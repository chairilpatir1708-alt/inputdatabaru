import { z } from 'zod'

// LoginSchema - validates admin login credentials
// Requirements: 21.6, 21.7
export const LoginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50, 'Username maksimal 50 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

// BukuDataSchema - validates SPPT/STTS buku data inputs
// Requirements: 21.2
export const BukuDataSchema = z.object({
  buku1: z.number().int('Buku 1 harus bilangan bulat').min(0, 'Buku 1 tidak boleh negatif').max(999999, 'Buku 1 maksimal 999999'),
  buku2: z.number().int('Buku 2 harus bilangan bulat').min(0, 'Buku 2 tidak boleh negatif').max(999999, 'Buku 2 maksimal 999999'),
  buku3: z.number().int('Buku 3 harus bilangan bulat').min(0, 'Buku 3 tidak boleh negatif').max(999999, 'Buku 3 maksimal 999999'),
  buku4: z.number().int('Buku 4 harus bilangan bulat').min(0, 'Buku 4 tidak boleh negatif').max(999999, 'Buku 4 maksimal 999999'),
  buku5: z.number().int('Buku 5 harus bilangan bulat').min(0, 'Buku 5 tidak boleh negatif').max(999999, 'Buku 5 maksimal 999999'),
})

// YearSchema - validates year inputs
// Requirements: 21.3
export const YearSchema = z.number().int('Tahun harus bilangan bulat').min(2000, 'Tahun minimal 2000').max(2100, 'Tahun maksimal 2100')

// KecamatanSchema - validates Kecamatan master data
// Requirements: 21.4, 21.5
export const KecamatanSchema = z.object({
  nama: z.string().min(1, 'Nama tidak boleh kosong').max(100, 'Nama maksimal 100 karakter'),
  urutan: z.number().int('Urutan harus bilangan bulat').min(0, 'Urutan tidak boleh negatif'),
})

// DesaSchema - validates Desa master data
// Requirements: 21.4, 21.5
export const DesaSchema = z.object({
  nama: z.string().min(1, 'Nama tidak boleh kosong').max(100, 'Nama maksimal 100 karakter'),
  urutan: z.number().int('Urutan harus bilangan bulat').min(0, 'Urutan tidak boleh negatif'),
  kecamatanId: z.string().uuid('Kecamatan ID tidak valid'),
})

// ProfileUpdateSchema - validates admin profile updates
// Requirements: 21.4, 21.5, 21.6, 21.7
export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong').max(100, 'Nama maksimal 100 karakter').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').max(50, 'Username maksimal 50 karakter').optional(),
  oldPassword: z.string().min(8, 'Password lama minimal 8 karakter').optional(),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter').optional(),
})
