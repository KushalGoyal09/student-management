import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { z } from "zod";

const bodySchema = z.object({
    email: z.coerce.string(),
    phoneNumber: z.coerce.string(),
    bonding: z.coerce.number().int(),
    targetAssaigningAndChecking: z.coerce.number().int(),
    calling: z.coerce.number().int(),
    seriousness: z.coerce.number().int(),
    exceptation: z.string(),
});

const studentRating = async (req: Request, res: Response) => {
    try {
        const parsedData = bodySchema.safeParse(req.body);
        if (parsedData.success === false) {
            console.log(parsedData.error);
            res.status(400).json({
                success: false,
                message: "Wrong Inputs",
            });
            return;
        }
        const {
            bonding,
            targetAssaigningAndChecking,
            calling,
            seriousness,
            exceptation,
            phoneNumber,
        } = parsedData.data;
        const student = await db.student.findMany({
            where: {
                whattsapNumber: phoneNumber,
            },
            select: {
                id: true,
                groupMentorId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!student.length || !student[0].groupMentorId) {
            res.status(404).json({
                success: false,
                message: "Student is not found",
            });
            return;
        }
        const selectedStudent = student[0];
        if (!selectedStudent.groupMentorId) {
            res.status(404).json({
                success: false,
                message: "Student is not found",
            });
            return;
        }
        await db.ratingByStudent.upsert({
            where: {
                studentId_groupMentorId: {
                    studentId: selectedStudent.id,
                    groupMentorId: selectedStudent.groupMentorId,
                },
            },
            create: {
                bonding,
                targetAssaigningAndChecking,
                calling,
                seriousness,
                exceptation,
                studentId: selectedStudent.id,
                groupMentorId: selectedStudent.groupMentorId,
            },
            update: {
                bonding,
                targetAssaigningAndChecking,
                calling,
                seriousness,
                exceptation,
            },
        });
    } catch (error) {
        res.status(500).json({
            data: error,
        });
    }
};

export default studentRating;
