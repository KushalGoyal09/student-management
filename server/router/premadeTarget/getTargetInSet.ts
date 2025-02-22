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
            physics: {
                select: {
                    chapterId: true,
                    numberOfLecture: true,
                    isFinal: true,
                },
            },
            chemistry: {
                select: {
                    chapterId: true,
                    numberOfLecture: true,
                    isFinal: true,
                },
            },
            biology: {
                select: {
                    chapterId: true,
                    numberOfLecture: true,
                    isFinal: true,
                },
            },
        },
    });
    return res.json({
        success: true,
        data: target,
    });
};

export default getTargetInSet;
