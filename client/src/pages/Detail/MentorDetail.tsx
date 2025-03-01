import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Star, Phone, MessageCircle } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Student {
    id: string;
    name: string;
    status: boolean;
    whattsapGroupLink: string | null;
    whattsapNumber: string;
    callNumber: string;
    class: string;
    platform: string;
    createdAt: Date;
}

type CallStatus = "Scheduled" | "Done" | "DNP" | "Nothing";

type WeekData = {
    students: {
        studentId: string;
        call: {
            date: string;
            callStatus: CallStatus;
        }[];
    }[];
} | null;

interface MentorData {
    overallRating: number;
    supervisorRating: number;
    studentsRating: number;
    whattsapLink: string | null;
    id: string;
    name: string;
    username: string;
    Student: Student[];
    weekData: WeekData;
}

const fetchMentorDetails = async (username: string): Promise<MentorData> => {
    const { data } = await axios.post<{
        data: MentorData;
        success: boolean;
    }>(
        `${backendUrl}/detail/mentor-detail`,
        {
            groupMentorUsername: username,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const formatWhatsAppLink = (number: string) => {
    if (!number) return "";
    const cleanNumber = number.replace(/[^0-9]/g, "");
    return cleanNumber.startsWith("+91")
        ? `https://wa.me/${cleanNumber}`
        : `https://wa.me/+91${cleanNumber}`;
};

export default function Component() {
    let { username } = useParams();
    const [data, setData] = useState<MentorData>();
    const [callStatuses, setCallStatuses] = useState<Map<string, CallStatus>>(
        new Map<string, CallStatus>(),
    );
    const router = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        if (!username) return;
        fetchMentorDetails(username).then((data) => {
            setData(data);
        });
    }, [username]);

    useEffect(() => {
        if (data) {
            const map = new Map<string, CallStatus>();
            if (!data.weekData) {
                setCallStatuses(map);
                return;
            }
            data.weekData.students.forEach((student) => {
                student.call.forEach((call) => {
                    const key = `${student.studentId}-${call.date}`;
                    map.set(key, call.callStatus);
                });
            });
            setCallStatuses(map);
        }
    }, [data]);

    const getCallStatus = (studentId: string, date: string) => {
        const key = `${studentId}-${date}`;
        return callStatuses.get(key) || "Nothing";
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

    const getDate = (dayIndex: number) => {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const date = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");
        return date;
    };

    const filteredAndSortedStudents = useMemo(() => {
        return (
            data?.Student?.filter((student) =>
                student.name.toLowerCase().includes(searchQuery.toLowerCase()),
            ).sort((a, b) => {

                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
            }) || []
        );
    }, [data?.Student, searchQuery, sortOrder]);

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    const totalCallsDone =
        data.weekData?.students.reduce((total, student) => {
            return (
                total +
                student.call.filter((call) => {
                    return call.callStatus === "Done";
                }).length
            );
        }, 0) || 0;

    const totalStudents = data.Student.length;
    const totalDays = daysOfWeek.length;
    const averageCallsPerDay = totalCallsDone / totalDays;
    const averageCallsPerStudentPerWeek = totalCallsDone / totalStudents;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl font-bold">{data.name}</h1>
                    <p className="text-gray-600 mb-4">@{data.username}</p>
                    {data.whattsapLink && (
                        <p
                            className="mb-4 text-blue-600"
                            onClick={() =>
                                window.open(data.whattsapLink || "", "_blank")
                            }
                        >
                            Whappsap Group
                        </p>
                    )}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center">
                            <Star className="text-yellow-400 mr-1" />
                            <span className="font-semibold">
                                {data.overallRating.toFixed(1)}
                            </span>
                            <span className="text-gray-600 ml-1">Overall</span>
                        </div>
                        <div className="flex items-center">
                            <Star className="text-blue-400 mr-1" />
                            <span className="font-semibold">
                                {data.supervisorRating.toFixed(1)}
                            </span>
                            <span className="text-gray-600 ml-1">
                                Supervisor
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Star className="text-green-400 mr-1" />
                            <span className="font-semibold">
                                {data.studentsRating.toFixed(1)}
                            </span>
                            <span className="text-gray-600 ml-1">Students</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            Students ({data.Student?.length || 0})
                        </h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="px-3 py-1 border rounded"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={() =>
                                    setSortOrder((prev) =>
                                        prev === "asc" ? "desc" : "asc",
                                    )
                                }
                                className="px-3 py-1 border rounded"
                            >
                                Sort {sortOrder === "desc" ? "↓" : "↑"}
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-4 mb-8">
                        {filteredAndSortedStudents.map((student) => (
                            <div
                                key={student.id}
                                className="bg-gray-50 p-4 rounded-lg"
                                onClick={() => {
                                    router(`/profile/${student.id}`);
                                }}
                            >
                                <h3 className="font-semibold mb-2">
                                    {student.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-1">
                                    Class: {student.class}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    Platform: {student.platform}
                                </p>
                                <div className="flex gap-4 mt-2">
                                    <a
                                        href={`tel:${student.callNumber}`}
                                        className="flex items-center text-blue-600"
                                    >
                                        <Phone className="w-4 h-4 mr-1" />
                                        Call
                                    </a>
                                    {!student.whattsapGroupLink && (
                                        <a
                                            href={formatWhatsAppLink(
                                                student.whattsapNumber,
                                            )}
                                            target="_blank"
                                            className="flex items-center text-green-600"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            WhatsApp
                                        </a>
                                    )}
                                    {student.whattsapGroupLink && (
                                        <a
                                            href={student.whattsapGroupLink}
                                            className="flex items-center text-green-600"
                                            target="_blank"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            WhatsApp Group
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Weekly Call Records
                    </h2>

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">
                            Insights
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Total Calls Done
                                </h3>
                                <p className="text-3xl font-bold">
                                    {totalCallsDone}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Average Calls Per Day
                                </h3>
                                <p className="text-3xl font-bold">
                                    {averageCallsPerDay.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    Average Calls Per Student Per Week
                                </h3>
                                <p className="text-3xl font-bold">
                                    {averageCallsPerStudentPerWeek.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2 bg-gray-100">
                                        Student
                                    </th>
                                    {daysOfWeek.map((day, index) => (
                                        <th
                                            key={day}
                                            className={`border p-2 ${getDate(index) === format(new Date(), "yyyy-MM-dd") ? "bg-pcb" : " bg-gray-100"} text-center`}
                                        >
                                            {day} <br />
                                            {getDate(index)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.Student.map((student) => (
                                    <tr key={student.id}>
                                        <td className="border p-2 font-semibold">
                                            {student.name}
                                        </td>
                                        {daysOfWeek.map((day, index) => {
                                            return (
                                                <td
                                                    key={day}
                                                    className={`border p-2 text-center ${getStatusColor(
                                                        getCallStatus(
                                                            student.id,
                                                            getDate(index),
                                                        ),
                                                    )}`}
                                                >
                                                    {getCallStatus(
                                                        student.id,
                                                        getDate(index),
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
