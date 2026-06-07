-- CreateTable
CREATE TABLE "dashboard_stats" (
    "id" TEXT NOT NULL,
    "totalAttendance" TEXT NOT NULL DEFAULT '0',
    "newRegistration" TEXT NOT NULL DEFAULT '0',
    "followUp" TEXT NOT NULL DEFAULT '0',
    "totalPatients" TEXT NOT NULL DEFAULT '0',
    "today" TEXT NOT NULL DEFAULT '0',
    "thisWeek" TEXT NOT NULL DEFAULT '0',
    "thisMonth" TEXT NOT NULL DEFAULT '0',
    "totalPayments" TEXT NOT NULL DEFAULT '0',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_stats_userId_key" ON "dashboard_stats"("userId");

-- AddForeignKey
ALTER TABLE "dashboard_stats" ADD CONSTRAINT "dashboard_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
