import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest, Role } from "../../types";
import { z } from "zod";
import { format, subDays } from "date-fns";

const db = new PrismaClient();

const bodySchema = z.object({
    startDay: z.coerce.string(),
});

const getWeekRecord = async (req: AuthRequest, res: Response) => {
    const role = req.role;
    const mentorId = req.userId;
    if (role !== Role.groupMentor || !mentorId) {
        return res
            .status(403)
            .send("You are not authorized to access this route.");
    }
    const parsedData = bodySchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).send("Invalid data");
    }
    const { startDay } = parsedData.data;

    let data = null;
    let currentStartDate = startDay;
    let dataIsNull = false;

    while (data === null) {
        data = await getCallRecord(currentStartDate, mentorId);
        if (data === null) {
            dataIsNull = true;
            currentStartDate = format(
                subDays(new Date(startDay), 7),
                "yyyy-MM-dd",
            );
        }
    }

    if (dataIsNull) {
        data = await createWeekRecord(startDay, currentStartDate, mentorId);
    }

    return res.status(200).json({
        success: true,
        data: data,
    });
};

export default getWeekRecord;

const getCallRecord = async (startDay: string, mentorId: string) => {
    const data = await db.week.findUnique({
        where: {
            startDate_mentorId: {
                startDate: startDay,
                mentorId: mentorId,
            },
        },
        select: {
            students: {
                select: {
                    studentId: true,
                    call: {
                        select: {
                            date: true,
                            callStatus: true,
                        },
                    },
                },
            },
        },
    });
    return data;
};

const createWeekRecord = async (
    currentDate: string,
    prevDate: string,
    mentorId: string,
) => {
    const previousWeekRecord = await db.week.findUnique({
        where: {
            startDate_mentorId: {
                startDate: prevDate,
                mentorId: mentorId,
            },
        },
        select: {
            students: {
                select: {
                    studentId: true,
                    call: {
                        select: {
                            date: true,
                            day: true,
                        },
                    },
                },
            },
        },
    });

    if (!previousWeekRecord) return null;

    const newWeekRecord = await db.week.create({
        data: {
            startDate: currentDate,
            endDate: new Date(
                new Date(currentDate).getTime() + 6 * 24 * 60 * 60 * 1000,
            )
                .toISOString()
                .split("T")[0],
            mentorId: mentorId,
            students: {
                createMany: {
                    data: previousWeekRecord.students.map((studentRecord) => ({
                        studentId: studentRecord.studentId,
                        mentorId,
                    })),
                },
            },
        },
        select: {
            id: true,
        },
    });

    // After creating the week record, create calls for each student call record
    const studentCallRecords = await db.studentCallRecord.findMany({
        where: {
            weekId: newWeekRecord.id,
        },
    });

    // Create calls for each student call record
    const callCreationPromises = studentCallRecords.map(
        (studentCallRecord, index) => {
            const originalStudentRecord = previousWeekRecord.students[index];

            return db.call.createMany({
                data: originalStudentRecord.call.map((prevCall) => ({
                    date: new Date(
                        new Date(currentDate).setDate(
                            new Date(currentDate).getDate() +
                                (new Date(prevCall.date).getDay() -
                                    new Date(currentDate).getDay()),
                        ),
                    )
                        .toISOString()
                        .split("T")[0],
                    day: prevCall.day,
                    callStatus: "Scheduled",
                    studentRecordId: studentCallRecord.id,
                })),
            });
        },
    );

    await Promise.all(callCreationPromises);

    return await getCallRecord(currentDate, mentorId);
};
