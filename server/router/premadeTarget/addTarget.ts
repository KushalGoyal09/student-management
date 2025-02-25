import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
const db = new PrismaClient();

const bodySchema = z.object({
    setId: z.string(),
    day: z.coerce.number(),
    physicsTarget: z.array(
        z.object({
            chapterId: z.coerce.number(),
            numberOfLecture: z.coerce.number(),
            isFinal: z.coerce.boolean(),
        }),
    ),
    chemistryTarget: z.array(
        z.object({
            chapterId: z.coerce.number(),
            numberOfLecture: z.coerce.number(),
            isFinal: z.coerce.boolean(),
        }),
    ),
    biologyTarget: z.array(
        z.object({
            chapterId: z.coerce.number(),
            numberOfLecture: z.coerce.number(),
            isFinal: z.coerce.boolean(),
        }),
    ),
});

const addTarget = async (req: Request, res: Response) => {
    const { setId, day, physicsTarget, chemistryTarget, biologyTarget } =
        bodySchema.parse(req.body);
    const premadeTarget = await db.premadeTarget.findUnique({
        where: {
            targetSetId_day: {
                targetSetId: setId,
                day,
            },
        },
    });
    let premadeTargetId: null | string = null;
    if (premadeTarget) {
        await deleteTarget(premadeTarget.id);
        premadeTargetId = premadeTarget.id;
    } else {
        const premadeTarget = await db.premadeTarget.create({
            data: {
                day,
                targetSetId: setId,
            },
        });
        premadeTargetId = premadeTarget.id;
    }

    await db.physicsPremadeTarget.createMany({
        data: physicsTarget.map((target) => ({
            ...target,
            premadeTargetId: premadeTargetId,
        })),
    });
    await db.chemistryPremadeTarget.createMany({
        data: chemistryTarget.map((target) => ({
            ...target,
            premadeTargetId: premadeTargetId,
        })),
    });
    await db.biologyPremadeTarget.createMany({
        data: biologyTarget.map((target) => ({
            ...target,
            premadeTargetId: premadeTargetId,
        })),
    });
    return res.json({
        success: true,
        data: getTarget(premadeTargetId),
    });
};

const deleteTarget = async (premadeTargetId: string) => {
    await db.physicsPremadeTarget.deleteMany({
        where: {
            premadeTargetId: premadeTargetId,
        },
    });
    await db.chemistryPremadeTarget.deleteMany({
        where: {
            premadeTargetId: premadeTargetId,
        },
    });
    await db.biologyPremadeTarget.deleteMany({
        where: {
            premadeTargetId: premadeTargetId,
        },
    });
};

const getTarget = async (targetId: string) => {
    const target = await db.premadeTarget.findUnique({
        where: {
            id: targetId,
        },
        select: {
            id: true,
            day: true,
            targetSetId: true,
            PhysicsPremadeTarget: {
                select: {
                    chapterId: true,
                    numberOfLecture: true,
                    isFinal: true,
                },
            },
            ChemistryPremadeTarget: {
                select: {
                    chapterId: true,
                    numberOfLecture: true,
                    isFinal: true,
                },
            },
            BiologyPremadeTarget: {
                select: {
                    chapterId: true,
                    numberOfLecture: true,
                    isFinal: true,
                },
            },
        },
    });

    return target;
};

export default addTarget;
