-- DropForeignKey
ALTER TABLE "PremadeTarget" DROP CONSTRAINT "PremadeTarget_physicsPremadeTargetId_fkey";

-- AlterTable
ALTER TABLE "PremadeTarget" ALTER COLUMN "physicsPremadeTargetId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PremadeTarget" ADD CONSTRAINT "PremadeTarget_physicsPremadeTargetId_fkey" FOREIGN KEY ("physicsPremadeTargetId") REFERENCES "PhysicsPremadeTarget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
