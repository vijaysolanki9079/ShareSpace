-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "itemRequestId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporterType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Report_itemRequestId_idx" ON "Report"("itemRequestId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Report_itemRequestId_reporterId_key" ON "Report"("itemRequestId", "reporterId");

-- CreateIndex
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_itemRequestId_fkey" FOREIGN KEY ("itemRequestId") REFERENCES "ItemRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
