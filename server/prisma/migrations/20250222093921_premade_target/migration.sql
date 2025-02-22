-- CreateTable
CREATE TABLE "TargetSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TargetSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremadeTarget" (
    "id" TEXT NOT NULL,
    "targetSetId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "physicsPremadeTargetId" TEXT NOT NULL,
    "chemistryPremadeTargetId" TEXT,
    "biologyPremadeTargetId" TEXT,

    CONSTRAINT "PremadeTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicsPremadeTarget" (
    "id" TEXT NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "numberOfLecture" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PhysicsPremadeTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChemistryPremadeTarget" (
    "id" TEXT NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "numberOfLecture" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChemistryPremadeTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiologyPremadeTarget" (
    "id" TEXT NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "numberOfLecture" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BiologyPremadeTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TargetSet_name_key" ON "TargetSet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PremadeTarget_targetSetId_day_key" ON "PremadeTarget"("targetSetId", "day");

-- AddForeignKey
ALTER TABLE "PremadeTarget" ADD CONSTRAINT "PremadeTarget_targetSetId_fkey" FOREIGN KEY ("targetSetId") REFERENCES "TargetSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremadeTarget" ADD CONSTRAINT "PremadeTarget_physicsPremadeTargetId_fkey" FOREIGN KEY ("physicsPremadeTargetId") REFERENCES "PhysicsPremadeTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremadeTarget" ADD CONSTRAINT "PremadeTarget_chemistryPremadeTargetId_fkey" FOREIGN KEY ("chemistryPremadeTargetId") REFERENCES "ChemistryPremadeTarget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremadeTarget" ADD CONSTRAINT "PremadeTarget_biologyPremadeTargetId_fkey" FOREIGN KEY ("biologyPremadeTargetId") REFERENCES "BiologyPremadeTarget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicsPremadeTarget" ADD CONSTRAINT "PhysicsPremadeTarget_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "PhysicsSyallabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChemistryPremadeTarget" ADD CONSTRAINT "ChemistryPremadeTarget_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "ChemistrySyallabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiologyPremadeTarget" ADD CONSTRAINT "BiologyPremadeTarget_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "BiologySyallabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
