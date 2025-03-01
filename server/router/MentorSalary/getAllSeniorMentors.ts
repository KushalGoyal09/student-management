import { PrismaClient } from "prisma/prisma-client";
import { Response } from "express";
import { AuthRequest, Role } from "../../types";
import { throwUnauthorizedError } from "../../custom-error/customError";
import calculateSeniorMentorRating from "../../utils/calculateSeniorMentorRating";
const db = new PrismaClient();

interface SeniorResponse {
    success: boolean;
    data: {
        id: string;
        username: string;
        name: string;
        studentCount: number;
        overallRating: number;
    }[];
}

const getAllTheSeniors = async (
    req: AuthRequest,
    res: Response<SeniorResponse>,
) => {
    const role = req.role;
    if (role !== Role.admin) {
        throwUnauthorizedError(
            "You are not authorized to access this resource",
        );
        return;
    }
    const mentors = await db.seniorMentor.findMany({
        select: {
            id: true,
            username: true,
            name: true,
            GroupMentor: {
                select: {
                    Student: {
                        where: {
                            status: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            name: "asc",
        }
    });
    const data = await Promise.all(
        mentors.map(async (mentor) => {
            return {
                id: mentor.id,
                username: mentor.username,
                name: mentor.name,
                studentCount: mentor.GroupMentor.reduce((total, r) => {
                    return total + r.Student.length;
                }, 0),
                overallRating: await calculateSeniorMentorRating(mentor.id),
            };
        }),
    );
    res.json({
        success: true,
        data,
    });
};

export default getAllTheSeniors;
