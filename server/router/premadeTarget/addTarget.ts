import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
const db = new PrismaClient();

const bodySchema = z.object({
    setId: z.string(),
    day: z.coerce.number(),
    physicsTarget: z
        .object({
            chapterId: z.coerce.number(),
            numberOfLecture: z.coerce.number(),
            isFinal: z.coerce.boolean(),
        })
        .optional(),
    chemistryTarget: z
        .object({
            chapterId: z.coerce.number(),
            numberOfLecture: z.coerce.number(),
            isFinal: z.coerce.boolean(),
        })
        .optional(),
    biologyTarget: z
        .object({
            chapterId: z.coerce.number(),
            numberOfLecture: z.coerce.number(),
            isFinal: z.coerce.boolean(),
        })
        .optional(),
});

const addTarget = async (req: Request, res: Response) => {
    const { setId, day, physicsTarget, chemistryTarget, biologyTarget } =
        bodySchema.parse(req.body);
    let physicsPremadeTargetId = null;
    let chemistryPremadeTargetId = null;
    let biologyPremadeTargetId = null;
    if (physicsTarget) {
        const physics = await db.physicsPremadeTarget.create({
            data: physicsTarget,
        });
        physicsPremadeTargetId = physics.id;
    }
    if (chemistryTarget) {
        const chemistry = await db.chemistryPremadeTarget.create({
            data: chemistryTarget,
        });
        chemistryPremadeTargetId = chemistry.id;
    }
    if (biologyTarget) {
        const biology = await db.biologyPremadeTarget.create({
            data: biologyTarget,
        });
        biologyPremadeTargetId = biology.id;
    }
    const target = await db.premadeTarget.upsert({
        where: {
            targetSetId_day: {
                targetSetId: setId,
                day,
            },
        },
        create: {
            targetSetId: setId,
            day,
            physicsPremadeTargetId,
            chemistryPremadeTargetId,
            biologyPremadeTargetId,
        },
        update: {
            physicsPremadeTargetId,
            chemistryPremadeTargetId,
            biologyPremadeTargetId,
        },
    });
    return res.json({
        success: true,
        data: target,
    });
};

export default addTarget;
