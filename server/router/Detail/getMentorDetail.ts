import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest, Role } from "../../types";
import {
    throwBadRequestError,
    throwUnauthorizedError,
} from "../../custom-error/customError";
import { z } from "zod";
import calculateMentorRating from "../../utils/calculateMentorRating";
import getWeekRecordForMentor from "../../utils/getWeekData";
import { startOfWeek } from "date-fns";
import { format } from "date-fns";
const db = new PrismaClient();

const bodySchema = z.object({
    groupMentorUsername: z.coerce.string(),
});

const getMentorDetail = async (req: AuthRequest, res: Response) => {
    if (
        req.role !== Role.admin &&
        req.role !== Role.supervisor &&
        req.role !== Role.seniorMentor
    ) {
        throwUnauthorizedError("You are not authorized to get all students");
        return;
    }
    const parsedData = bodySchema.safeParse(req.body);
    if (!parsedData.success) {
        throwBadRequestError("Invalid data");
        return;
    }
    const data = await db.groupMentor.findUnique({
        where: {
            username: parsedData.data.groupMentorUsername,
        },
        select: {
            name: true,
            username: true,
            whattsapLink: true,
            id: true,
            Student: {
                select: {
                    name: true,
                    class: true,
                    status: true,
                    whattsapGroupLink: true,
                    whattsapNumber: true,
                    platform: true,
                    id: true,
                    callNumber: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!data) {
        throwBadRequestError("Senior Mentor not found");
        return;
    }
    const weekStart = format(
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        "yyyy-MM-dd",
    );
    const weekData = await getWeekRecordForMentor(data.id, weekStart);
    const rating = await calculateMentorRating(data.id);
    const response = {
        ...data,
        ...rating,
        weekData,
    };
    res.json({
        success: true,
        data: response,
    });
};

export default getMentorDetail;
