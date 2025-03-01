import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AuthRequest, Role } from "../../types";
const db = new PrismaClient();

const bodySchema = z.object({
    studentId: z.string(),
});

const studentProfile = async (req: AuthRequest, res: Response) => {
    const role = req.role;
    if (
        role !== Role.admin &&
        role !== Role.supervisor &&
        role !== Role.seniorMentor &&
        role !== Role.groupMentor
    ) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    const parsedData = bodySchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            success: false,
            message: "Wrong inputs",
        });
        return;
    }

    const { studentId } = parsedData.data;
    let student : any = await db.student.findUnique({
        where: {
            id: studentId,
        },
        select: {
            id: true,
            name: true,
            dateOfDeactive: true,
            gender: true,
            fatherName: true,
            motherName: true,
            whattsapNumber: true,
            callNumber: true,
            motherNumber: true,
            fatherNumber: true,
            language: true,
            target: true,
            StudyHours: true,
            class: true,
            dropperStatus: true,
            previousScore: true,
            platform: true,
            expectation: true,
            status: true,
            createdAt: true,
            whattsapGroupLink: true,
            email: true,
            completeAddress: true,
            landmark: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
            reasonOfDeactive: true,
            groupMentor: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                },
            },
        },
    });
    
    if (!student) {
        res.status(404).json({
            success: false,
            message: "Student not found",
        });
        return;
    }
    if (student.groupMentor) {
        const sm = await db.groupMentor.findUnique({
            where: {
                id: student.groupMentor?.id
            },
            select: {
                seniorMentor: {
                    select: {
                        name: true,
                        username: true,
                        id: true,
                    }
                }
            }
        })
        student.seniorMentor = sm?.seniorMentor;
    }
    res.json({
        success: true,
        student,
    });
};

export default studentProfile;
