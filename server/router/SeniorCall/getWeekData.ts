import { PrismaClient, CallStatus, DaysOfWeek } from "@prisma/client";
import { Response } from "express";
import { AuthRequest, Role } from "../../types";
import { z } from "zod";
import { throwUnauthorizedError } from "../../custom-error/customError";
import { format, subDays, addDays } from "date-fns";
const db = new PrismaClient();

const bodySchema = z.object({
    startDay: z.string(),
    groupMentorId: z.string(),
});

interface CallRecord {
    studentId: string;
    call: {
        date: string;
        callStatus: CallStatus;
    }[];
}

interface WeekRecord {
    startDate: string;
    endDate: string;
    students: CallRecord[];
    parents: CallRecord[];
}

interface WeekRecordResponse {
    success: boolean;
    data: WeekRecord | null;
}

const getWeekRecord = async (
    req: AuthRequest,
    res: Response<WeekRecordResponse>,
) => {
    const seniorMentorId = req.userId;
    if (req.role !== Role.seniorMentor || !seniorMentorId) {
        throwUnauthorizedError("Unauthorized");
        return;
    }
    const { startDay, groupMentorId } = bodySchema.parse(req.body);
    let data = null;
    let startDate = startDay;
    let dataIsNull = false;
    while (data === null) {
        data = await getCallRecord(startDate, groupMentorId, seniorMentorId);
        if (data === null) {
            dataIsNull = true;
            startDate = format(subDays(new Date(startDay), 7), "yyyy-MM-dd");
        }
    }
    if (dataIsNull) {
        data = await createWeekRecord(
            startDay,
            startDate,
            groupMentorId,
            seniorMentorId,
        );
    }
    res.json({
        success: true,
        data: data,
    });
};

export default getWeekRecord;

const getCallRecord = async (
    startDay: string,
    mentorId: string,
    seniorMentorId: string,
): Promise<WeekRecord | null> => {
    const data = await db.seniorWeek.findUnique({
        where: {
            startDate_mentorId: {
                startDate: startDay,
                mentorId: seniorMentorId,
            },
        },
        select: {
            startDate: true,
            endDate: true,
            students: {
                where: {
                    Student: {
                        groupMentorId: mentorId,
                    },
                },
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
            parents: {
                where: {
                    Student: {
                        groupMentorId: mentorId,
                    },
                },
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
    seniorMentorId: string,
): Promise<WeekRecord | null> => {
    const previousWeekRecord = await db.seniorWeek.findUnique({
        where: {
            startDate_mentorId: {
                startDate: prevDate,
                mentorId: seniorMentorId,
            },
        },
        select: {
            students: {
                where: {
                    Student: {
                        groupMentorId: mentorId,
                    },
                },
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
            parents: {
                where: {
                    Student: {
                        groupMentorId: mentorId,
                    },
                },
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

    const newWeekRecord = await db.seniorWeek.create({
        data: {
            startDate: currentDate,
            endDate: addDays(new Date(currentDate), 6)
                .toISOString()
                .split("T")[0],
            mentorId: seniorMentorId,
        },
    });

    const calculateNewDate = (originalDay: DaysOfWeek) => {
        const daysOfWeek = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        const dayIndex = daysOfWeek.indexOf(originalDay);
        return addDays(new Date(currentDate), dayIndex)
            .toISOString()
            .split("T")[0];
    };

    for (const studentRecord of previousWeekRecord.students) {
        await db.studentCallRecordSenior.create({
            data: {
                studentId: studentRecord.studentId,
                weekId: newWeekRecord.id,
                call: {
                    create: studentRecord.call.map((call) => ({
                        date: calculateNewDate(call.day as DaysOfWeek),
                        day: call.day,
                        callStatus: "Scheduled",
                    })),
                },
            },
        });
    }

    for (const parentRecord of previousWeekRecord.parents) {
        await db.parentsCallRecordSenior.create({
            data: {
                studentId: parentRecord.studentId,
                weekId: newWeekRecord.id,
                call: {
                    create: parentRecord.call.map((call) => ({
                        date: calculateNewDate(call.day as DaysOfWeek),
                        day: call.day,
                        callStatus: "Scheduled",
                    })),
                },
            },
        });
    }

    return await getCallRecord(currentDate, mentorId, seniorMentorId);
};
