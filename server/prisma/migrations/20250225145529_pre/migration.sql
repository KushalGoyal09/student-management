/*
  Warnings:

  - You are about to drop the column `biologyPremadeTargetId` on the `PremadeTarget` table. All the data in the column will be lost.
  - You are about to drop the column `chemistryPremadeTargetId` on the `PremadeTarget` table. All the data in the column will be lost.
  - You are about to drop the column `physicsPremadeTargetId` on the `PremadeTarget` table. All the data in the column will be lost.
  - Added the required column `premadeTargetId` to the `BiologyPremadeTarget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `premadeTargetId` to the `ChemistryPremadeTarget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `premadeTargetId` to the `PhysicsPremadeTarget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TargetSet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PremadeTarget" DROP CONSTRAINT "PremadeTarget_biologyPremadeTargetId_fkey";

-- DropForeignKey
ALTER TABLE "PremadeTarget" DROP CONSTRAINT "PremadeTarget_chemistryPremadeTargetId_fkey";

-- DropForeignKey
ALTER TABLE "PremadeTarget" DROP CONSTRAINT "PremadeTarget_physicsPremadeTargetId_fkey";

-- AlterTable
ALTER TABLE "BiologyPremadeTarget" ADD COLUMN     "premadeTargetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ChemistryPremadeTarget" ADD COLUMN     "premadeTargetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PhysicsPremadeTarget" ADD COLUMN     "premadeTargetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PremadeTarget" DROP COLUMN "biologyPremadeTargetId",
DROP COLUMN "chemistryPremadeTargetId",
DROP COLUMN "physicsPremadeTargetId";

-- AlterTable
ALTER TABLE "TargetSet" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "PhysicsPremadeTarget" ADD CONSTRAINT "PhysicsPremadeTarget_premadeTargetId_fkey" FOREIGN KEY ("premadeTargetId") REFERENCES "PremadeTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChemistryPremadeTarget" ADD CONSTRAINT "ChemistryPremadeTarget_premadeTargetId_fkey" FOREIGN KEY ("premadeTargetId") REFERENCES "PremadeTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiologyPremadeTarget" ADD CONSTRAINT "BiologyPremadeTarget_premadeTargetId_fkey" FOREIGN KEY ("premadeTargetId") REFERENCES "PremadeTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;