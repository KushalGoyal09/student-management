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
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type CallStatus = "Scheduled" | "Done" | "DNP" | "Nothing";

type CallType = "Student" | "Parent";

interface Student {
    id: string;
    name: string;
    whattsapNumber: string;
    motherNumber: string;
    fatherNumber: string;
    whattsapGroupLink: string | null;
}

interface GroupMentor {
    id: string;
    name: string;
    username: string;
    Student: Student[];
    whattsapLink: string | null;
}

interface ApiResponse {
    data: {
        startDate: string;
        endDate: string;
        students: {
            studentId: string;
            call: {
                date: string;
                callStatus: CallStatus;
            }[];
        }[];
        parents: {
            studentId: string;
            call: {
                date: string;
                callStatus: CallStatus;
            }[];
        }[];
    } | null;
    success: boolean;
}

const fetchWeekData = async (weekStart: string, groupMentorId: string) => {
    const { data } = await axios.post<ApiResponse>(
        `${backendUrl}/seniorCall/get`,
        { startDay: weekStart, groupMentorId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    const studentMap = new Map<string, CallStatus>();
    const parentMap = new Map<string, CallStatus>();
    if (!data.data) {
        return {
            studentMap,
            parentMap,
        };
    }
    data.data.students.forEach((student) => {
        student.call.forEach((call) => {
            const key = `${student.studentId}-${call.date}`;
            studentMap.set(key, call.callStatus);
        });
    });
    data.data.parents.forEach((student) => {
        student.call.forEach((call) => {
            const key = `${student.studentId}-${call.date}`;
            parentMap.set(key, call.callStatus);
        });
    });
    return {
        studentMap,
        parentMap,
    };
};

const fetchMentorsData = async () => {
    const { data } = await axios.get<{ data: GroupMentor[] }>(
        `${backendUrl}/seniorCall/get-mentors`,
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
    callType: CallType,
) => {
    await axios.post(
        `${backendUrl}/seniorCall/save`,
        { studentId, day, status, date, callType },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
};

export default function CallRecord() {
    const [selectedGroupMentorId, setSelectedGroupMentorId] =
        useState<string>();
    const [groupMentors, setGroupMentors] = useState<GroupMentor[]>([]);
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const [students, setStudents] = useState<Student[]>([]);
    const [callStatuses, setCallStatuses] = useState<Map<string, CallStatus>>(
        new Map<string, CallStatus>(),
    );
    const [parentsCallStatuses, setParentsCallStatuses] = useState<
        Map<string, CallStatus>
    >(new Map<string, CallStatus>());
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
        fetchMentorsData()
            .then((data) => {
                setGroupMentors(data);
            })
            .catch(() => {
                toast({
                    title: "Error",
                    description: "Error fetching mentors data",
                });
            });
    }, []);

    useEffect(() => {
        if (selectedGroupMentorId) {
            const students = groupMentors.find(
                (mentor) => mentor.id === selectedGroupMentorId,
            )?.Student;
            if (students) {
                setStudents(students);
            }
        }
    }, [selectedGroupMentorId]);

    useEffect(() => {
        if (selectedGroupMentorId) {
            const fetchData = async () => {
                try {
                    const weekStart = format(
                        startOfWeek(currentWeek, { weekStartsOn: 1 }),
                        "yyyy-MM-dd",
                    );
                    const weekData = await fetchWeekData(
                        weekStart,
                        selectedGroupMentorId,
                    );
                    setCallStatuses(weekData.studentMap);
                    setParentsCallStatuses(weekData.parentMap);
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch week data",
                    });
                }
            };
            fetchData();
        }
    }, [currentWeek, selectedGroupMentorId]);

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
        callType: CallType,
    ) => {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        const dayIndex = weekDays.indexOf(day);
        const date = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");
        if (callType === "Student") {
            setCallStatuses((prev) => {
                const newMap = new Map(prev);
                newMap.set(`${studentId}-${date}`, status);
                return newMap;
            });
        }
        if (callType === "Parent") {
            setParentsCallStatuses((prev) => {
                const newMap = new Map(prev);
                newMap.set(`${studentId}-${date}`, status);
                return newMap;
            });
        }
        await saveCallStatus(studentId, day, status, date, callType);
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

    const getParentsCallStatus = (
        studentId: string,
        date: string,
    ): CallStatus => {
        const status = parentsCallStatuses.get(`${studentId}-${date}`);
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
            <div className="my-4">
                <Select
                    value={selectedGroupMentorId}
                    onValueChange={(value) => setSelectedGroupMentorId(value)}
                >
                    <SelectTrigger className="w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 focus:ring-pcb">
                        <SelectValue placeholder="Select Group Mentor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                        {groupMentors.map((mentor) => (
                            <SelectItem
                                key={mentor.id}
                                value={mentor.id}
                                className="px-4 py-2 hover:bg-gray-100"
                            >
                                {mentor.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="overflow-x-auto my-4">
                <h1 className="text-2xl font-semibold mb-4 text-center ">
                    JUNIORS
                </h1>
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
                                    <td key={day} className="px-1 py-5">
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
                                                    "Student",
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
            <div className="overflow-x-auto my-4">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    PARENTS
                </h1>
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
                                    <td key={day} className="px-1 py-5">
                                        <Select
                                            value={getParentsCallStatus(
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
                                                    "Parent",
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                className={`w-full ${getStatusColor(getParentsCallStatus(student.id, getDate(index)))}`}
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
