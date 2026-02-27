-- CreateTable
CREATE TABLE "WeighingMachineDetail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isUsingOwnMachine" BOOLEAN NOT NULL,
    "make" TEXT,
    "machineName" TEXT NOT NULL,
    "modelNumber" TEXT,
    "machineType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeighingMachineDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeighingMachineDetail_userId_key" ON "WeighingMachineDetail"("userId");

-- AddForeignKey
ALTER TABLE "WeighingMachineDetail" ADD CONSTRAINT "WeighingMachineDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
