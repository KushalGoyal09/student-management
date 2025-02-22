import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const db = new PrismaClient();

const getAllSet = async (req: Request, res: Response) => {
    const allSet = await db.targetSet.findMany();
    return res.json({
        success: true,
        data: allSet,
    });
}

export default getAllSet;