import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
const db = new PrismaClient();

const bodySchema = z.object({
    name: z.string(),
});

const addSet = async (req: Request, res: Response) => {
    const { name } = bodySchema.parse(req.body);
    const set = await db.targetSet.create({
        data: {
            name,
        },
    });
    return res.json({
        success: true,
        data: set,
    });
};

export default addSet;