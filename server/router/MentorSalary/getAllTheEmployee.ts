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
        name: string;
        phoneNumber: string;
    }[];
}

const getAllEmployes = async (
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
    const data = await db.employee.findMany({
        select: {
            id: true,
            name: true,
            phoneNumber: true,
        },
        orderBy: {
            name: "asc",
        },
    });
    res.json({
        success: true,
        data,
    });
};

export default getAllEmployes;
