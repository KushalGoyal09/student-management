import { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { endOfWeek, startOfWeek, addDays, format } from "date-fns";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import DetailedDailySummary from "./DailyCallRecord";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type CallStatus = "Scheduled" | "Done" | "DNP" | "Nothing";

interface Student {
    id: string;
    name: string;
    whattsapNumber: string;
    callNumber: string;
    class: string;
    dropperStatus: string;
    previousScore: string;
    platform: string;
    status: boolean;
    whattsapGroupLink: string | null;
}

interface ApiResponse {
    data: {
        students: {
            studentId: string;
            call: {
                date: string;
                callStatus: CallStatus;
            }[];
        }[];
    } | null;
    success: boolean;
}

const fetchWeekData = async (weekStart: string) => {
    const { data } = await axios.post<ApiResponse>(
        `${backendUrl}/call/week-record`,
        { startDay: weekStart },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    const map = new Map<string, CallStatus>();
    if (!data.data) {
        return map;
    }
    data.data.students.forEach((student) => {
        student.call.forEach((call) => {
            const key = `${student.studentId}-${call.date}`;
            map.set(key, call.callStatus);
        });
    });
    return map;
};

const fetchStudentsData = async () => {
    const { data } = await axios.get<{ data: Student[] }>(
        `${backendUrl}/detail/students`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const saveCallStatus = async (
    studentId: string,
    day: string,
    status: CallStatus,
    date: string,
) => {
    await axios.post(
        `${backendUrl}/call/save-call-status`,
        { studentId, day, status, date },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
};

export default function CallRecord() {
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [callStatuses, setCallStatuses] = useState<Map<string, CallStatus>>(
        new Map<string, CallStatus>(),
    );
    const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    useEffect(() => {
        fetchStudentsData()
            .then((data) => setStudents(data))
            .catch(() => {
                toast({
                    title: "Error",
                    description: "Failed to fetch students data",
                });
            });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const weekStart = format(
                    startOfWeek(currentWeek, { weekStartsOn: 1 }),
                    "yyyy-MM-dd",
                );
                const weekData = await fetchWeekData(weekStart);
                setCallStatuses(weekData);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch week data",
                });
            }
        };
        if (students.length > 0) {
            fetchData();
        }
    }, [currentWeek, students]);

    const handlePreviousWeek = () => {
        setCurrentWeek((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
        });
    };

    const handleNextWeek = () => {
        setCurrentWeek((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });
    };

    const handleStatusChange = async (
        studentId: string,
        day: string,
        status: CallStatus,
    ) => {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const dayIndex = weekDays.indexOf(day);
        const date = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");
        setCallStatuses((prev) => {
            const newMap = new Map(prev);
            newMap.set(`${studentId}-${date}`, status);
            return newMap;
        });
        await saveCallStatus(studentId, day, status, date);
    };

    const getStatusColor = (status: CallStatus) => {
        switch (status) {
            case "Scheduled":
                return "bg-blue-100 text-blue-800";
            case "Done":
                return "bg-green-100 text-green-800";
            case "DNP":
                return "bg-red-100 text-red-800";
            case "Nothing":
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getWeekRange = () => {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    };

    const getDate = (dayIndex: number) => {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const date = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");
        return date;
    };

    const getCallStatus = (studentId: string, date: string): CallStatus => {
        const status = callStatuses.get(`${studentId}-${date}`);
        return status || "Nothing";
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <Button
                    onClick={handlePreviousWeek}
                    variant="outline"
                    size="icon"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm">{getWeekRange()}</span>
                </div>
                <Button onClick={handleNextWeek} variant="outline" size="icon">
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
            </div>
            <DetailedDailySummary
                students={students}
                callStatuses={callStatuses}
            />
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border-b text-left">Student</th>
                            {weekDays.map((day, index) => (
                                <th
                                    key={day}
                                    className="p-2 border-b text-center"
                                >
                                    <div className="text-xs font-medium">
                                        {day}
                                    </div>
                                    <div className="text-xs">
                                        {getDate(index)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="border-b">
                                <td className="p-2">
                                    <div className="font-medium">
                                        {student.name}
                                    </div>
                                </td>
                                {weekDays.map((day, index) => (
                                    <td key={day} className="px-1 py-10">
                                        <Select
                                            value={getCallStatus(
                                                student.id,
                                                getDate(index),
                                            )}
                                            onValueChange={(
                                                value: CallStatus,
                                            ) =>
                                                handleStatusChange(
                                                    student.id,
                                                    day,
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                className={`w-full ${getStatusColor(getCallStatus(student.id, getDate(index)))}`}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Nothing">
                                                    Nothing
                                                </SelectItem>
                                                <SelectItem value="Scheduled">
                                                    Scheduled
                                                </SelectItem>
                                                <SelectItem value="Done">
                                                    Done
                                                </SelectItem>
                                                <SelectItem value="DNP">
                                                    DNP
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
