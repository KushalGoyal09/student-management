import { PrismaClient } from "prisma/prisma-client";
const db = new PrismaClient();
import { Response } from "express";
import { AuthRequest, Role } from "../../types";
import { throwUnauthorizedError } from "../../custom-error/customError";

const getAllStudents = async (req: AuthRequest, res: Response) => {
    if (
        req.role !== Role.admin &&
        req.role !== Role.supervisor &&
        req.role !== Role.seniorMentor &&
        req.role !== Role.groupMentor
    ) {
        throwUnauthorizedError("You are not authorized to get all supervisors");
        return;
    }
    if (req.role === Role.admin) {
        const data = await db.student.findMany({
            where: {
                groupMentorId: {
                    not: null,
                },
            },
            orderBy: [
                {
                    status: "desc",
                },
                {
                    name: "asc",
                },
            ],
            select: {
                name: true,
                whattsapNumber: true,
                class: true,
                status: true,
                platform: true,
                dropperStatus: true,
                previousScore: true,
                id: true,
                whattsapGroupLink: true,
                createdAt: true,
            },
        });
        res.json({
            success: true,
            data,
        });
        return;
    }
    if (req.role === Role.supervisor) {
        const userId = req.userId;
        if (!userId) {
            throwUnauthorizedError("User not found");
            return;
        }
        const seniorMentors = await db.seniorMentor.findMany({
            where: {
                supervisorId: userId,
            },
            select: {
                GroupMentor: {
                    select: {
                        Student: {
                            where: {
                                groupMentorId: {
                                    not: null,
                                },
                            },
                            orderBy: [
                                {
                                    status: "desc",
                                },
                                {
                                    name: "asc",
                                },
                            ],
                            select: {
                                name: true,
                                whattsapNumber: true,
                                class: true,
                                status: true,
                                dropperStatus: true,
                                previousScore: true,
                                platform: true,
                                id: true,
                                whattsapGroupLink: true,
                            },
                        },
                    },
                },
            },
        });
        const data = seniorMentors
            .flatMap((mentorGroup) => mentorGroup.GroupMentor)
            .flatMap((group) => group.Student);
        res.json({
            success: true,
            data,
        });
        return;
    }
    if (req.role === Role.seniorMentor) {
        const userId = req.userId;
        if (!userId) {
            throwUnauthorizedError("User not found");
            return;
        }
        const groupMentors = await db.groupMentor.findMany({
            where: {
                seniorMentorId: userId,
            },
            select: {
                Student: {
                    where: {
                        groupMentorId: {
                            not: null,
                        },
                    },
                    orderBy: [
                        {
                            status: "desc",
                        },
                        {
                            name: "asc",
                        },
                    ],
                    select: {
                        name: true,
                        whattsapNumber: true,
                        class: true,
                        status: true,
                        platform: true,
                        dropperStatus: true,
                        previousScore: true,
                        id: true,
                        whattsapGroupLink: true,
                    },
                },
            },
        });
        const data = groupMentors.flatMap((mentorGroup) => mentorGroup.Student);
        res.json({
            success: true,
            data,
        });
        return;
    }
    if (req.role === Role.groupMentor) {
        const userId = req.userId;
        if (!userId) {
            throwUnauthorizedError("User not found");
            return;
        }
        const data = await db.student.findMany({
            where: {
                groupMentorId: userId,
            },
            orderBy: [
                {
                    status: "desc",
                },
                {
                    name: "asc",
                },
            ],
            select: {
                name: true,
                whattsapNumber: true,
                class: true,
                status: true,
                platform: true,
                dropperStatus: true,
                previousScore: true,
                whattsapGroupLink: true,
                id: true,
                callNumber: true,
            },
        });
        res.json({
            success: true,
            data,
        });
        return;
    }
};

export default getAllStudents;
