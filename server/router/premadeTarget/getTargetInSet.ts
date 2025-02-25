import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
const db = new PrismaClient();

const bodySchema = z.object({
    setId: z.string(),
    fromDay: z.coerce.number(),
    toDay: z.coerce.number(),
});

const getTargetInSet = async (req: Request, res: Response) => {
    const { setId, fromDay, toDay } = bodySchema.parse(req.body);
    const target = await db.premadeTarget.findMany({
        where: {
            targetSetId: setId,
            day: {
                gte: fromDay,
                lte: toDay,
            },
        },
        select: {
            id: true,
            day: true,
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
                    isFinal: true,
                    numberOfLecture: true,
                },
            },
            BiologyPremadeTarget: {
                select: {
                    chapterId: true,
                    isFinal: true,
                    numberOfLecture: true,
                },
            },
        },
    });

    return res.json({
        success: true,
        data: target.map((t) => {
            return {
                id: t.id,
                day: t.day,
                physics: t.PhysicsPremadeTarget,
                chemistry: t.ChemistryPremadeTarget,
                biology: t.BiologyPremadeTarget,
            };
        }),
    });
};

export default getTargetInSet;
