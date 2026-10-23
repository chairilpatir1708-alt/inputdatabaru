-- CreateTable
CREATE TABLE "arsip_sppt" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "desa" TEXT NOT NULL,
    "buku1" INTEGER NOT NULL DEFAULT 0,
    "buku2" INTEGER NOT NULL DEFAULT 0,
    "buku3" INTEGER NOT NULL DEFAULT 0,
    "buku4" INTEGER NOT NULL DEFAULT 0,
    "buku5" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arsip_sppt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arsip_stts" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "desa" TEXT NOT NULL,
    "buku1" INTEGER NOT NULL DEFAULT 0,
    "buku2" INTEGER NOT NULL DEFAULT 0,
    "buku3" INTEGER NOT NULL DEFAULT 0,
    "buku4" INTEGER NOT NULL DEFAULT 0,
    "buku5" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arsip_stts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kecamatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desa" (
    "id" TEXT NOT NULL,
    "kecamatanId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arsip_sppt_tahun_idx" ON "arsip_sppt"("tahun");

-- CreateIndex
CREATE INDEX "arsip_sppt_kecamatan_idx" ON "arsip_sppt"("kecamatan");

-- CreateIndex
CREATE INDEX "arsip_sppt_desa_idx" ON "arsip_sppt"("desa");

-- CreateIndex
CREATE UNIQUE INDEX "arsip_sppt_tahun_kecamatan_desa_key" ON "arsip_sppt"("tahun", "kecamatan", "desa");

-- CreateIndex
CREATE INDEX "arsip_stts_tahun_idx" ON "arsip_stts"("tahun");

-- CreateIndex
CREATE INDEX "arsip_stts_kecamatan_idx" ON "arsip_stts"("kecamatan");

-- CreateIndex
CREATE INDEX "arsip_stts_desa_idx" ON "arsip_stts"("desa");

-- CreateIndex
CREATE UNIQUE INDEX "arsip_stts_tahun_kecamatan_desa_key" ON "arsip_stts"("tahun", "kecamatan", "desa");

-- CreateIndex
CREATE UNIQUE INDEX "kecamatan_nama_key" ON "kecamatan"("nama");

-- CreateIndex
CREATE INDEX "kecamatan_urutan_idx" ON "kecamatan"("urutan");

-- CreateIndex
CREATE INDEX "desa_kecamatanId_idx" ON "desa"("kecamatanId");

-- CreateIndex
CREATE INDEX "desa_urutan_idx" ON "desa"("urutan");

-- CreateIndex
CREATE UNIQUE INDEX "desa_kecamatanId_nama_key" ON "desa"("kecamatanId", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_username_key" ON "admin_user"("username");

-- AddForeignKey
ALTER TABLE "desa" ADD CONSTRAINT "desa_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
