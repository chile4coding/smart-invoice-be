-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hcode" TEXT NOT NULL,
    "dtype" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deptGroup" TEXT,
    "recno" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_fees" (
    "id" TEXT NOT NULL,
    "billname" TEXT NOT NULL,
    "billcost" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "nfPrice" INTEGER NOT NULL DEFAULT 0,
    "hmoFees" TEXT,
    "sno" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "department_fees_externalId_key" ON "department_fees"("externalId");

-- AddForeignKey
ALTER TABLE "department_fees" ADD CONSTRAINT "department_fees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
