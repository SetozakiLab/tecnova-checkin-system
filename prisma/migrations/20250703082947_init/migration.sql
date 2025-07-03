-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "hashedPassword" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "displayId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckinRecord" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "checkinAt" TIMESTAMP(3) NOT NULL,
    "checkoutAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckinRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_displayId_key" ON "Guest"("displayId");

-- CreateIndex
CREATE INDEX "Guest_name_idx" ON "Guest"("name");

-- CreateIndex
CREATE INDEX "CheckinRecord_guestId_idx" ON "CheckinRecord"("guestId");

-- CreateIndex
CREATE INDEX "CheckinRecord_checkinAt_idx" ON "CheckinRecord"("checkinAt");

-- CreateIndex
CREATE INDEX "CheckinRecord_isActive_idx" ON "CheckinRecord"("isActive");

-- CreateIndex
CREATE INDEX "CheckinRecord_guestId_isActive_idx" ON "CheckinRecord"("guestId", "isActive");

-- AddForeignKey
ALTER TABLE "CheckinRecord" ADD CONSTRAINT "CheckinRecord_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
