import { AuthRequest, Role } from "../../types";
import { Response } from "express";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const getAllNewStudents = async (req: AuthRequest, res: Response) => {
    const role = req.role;
    const userId = req.userId;
    if (role !== Role.admin && role !== Role.supervisor) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (role === Role.supervisor) {
        const supervisor = await db.supervisor.findUnique({
            where: {
                id: userId,
            },
            select: {
                AssaignMentor: true,
            },
        });
        if (!supervisor || supervisor.AssaignMentor === false) {
            return res.status(401).json({ error: "Unauthorized" });
        }
    }
    const students = await db.student.findMany({
        where: {
            groupMentorId: null,
        },
        select: {
            name: true,
            createdAt: true,
            id: true,
            callNumber: true,
            platform: true,
            dropperStatus: true,
            previousScore: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return res.status(200).json({
        success: true,
        data: students,
    });
};

export default getAllNewStudents;
