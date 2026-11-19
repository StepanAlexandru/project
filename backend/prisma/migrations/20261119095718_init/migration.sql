-- CreateTable
CREATE TABLE "Species" (
    "id" SERIAL NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "conservationStatus" TEXT NOT NULL,
    "description" TEXT,
    "model3dUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enclosure" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "habitatType" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enclosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "enclosureId" INTEGER NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");

-- CreateIndex
CREATE UNIQUE INDEX "Enclosure_name_key" ON "Enclosure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Enclosure_qrCode_key" ON "Enclosure"("qrCode");

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_enclosureId_fkey" FOREIGN KEY ("enclosureId") REFERENCES "Enclosure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
