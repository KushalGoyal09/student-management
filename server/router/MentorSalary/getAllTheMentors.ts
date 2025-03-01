import { PrismaClient } from "prisma/prisma-client";
import { Response } from "express";
import { AuthRequest, Role } from "../../types";
import { throwUnauthorizedError } from "../../custom-error/customError";
import calculateMentorRating from "../../utils/calculateMentorRating";
const db = new PrismaClient();

interface MentorResponse {
    success: boolean;
    data: {
        id: string;
        username: string;
        name: string;
        studentCount: number;
        overallRating: number;
    }[];
}

const getAllTheMentors = async (
    req: AuthRequest,
    res: Response<MentorResponse>,
) => {
    const role = req.role;
    if (role !== Role.admin) {
        throwUnauthorizedError(
            "You are not authorized to access this resource",
        );
        return;
    }
    const mentors = await db.groupMentor.findMany({
        select: {
            id: true,
            username: true,
            name: true,
            Student: {
                where: {
                    status: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
    const rating = await Promise.all(
        mentors.map(async (mentor) => {
            return {
                ...mentor,
                ...(await calculateMentorRating(mentor.id)),
            };
        }),
    );

    const data = rating.map((mentor) => {
        return {
            id: mentor.id,
            username: mentor.username,
            name: mentor.name,
            studentCount: mentor.Student.length,
            overallRating: mentor.overallRating,
        };
    });
    res.json({
        success: true,
        data,
    });
};

export default getAllTheMentors;
