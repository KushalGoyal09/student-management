import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, CheckCircle, XCircle, Package, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Student {
    id: string;
    name: string;
    callNumber: string;
    kitDispatched: boolean;
    kitReady: boolean;
    kitDispatchedDate: Date | null;
}

interface StudentWithAddress {
    name: string;
    callNumber: string;
    email: string;
    completeAddress: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    id: string;
}

const getStudentsData = async (
    students: Array<String>,
): Promise<StudentWithAddress[]> => {
    const { data } = await axios.post(
        `${backendUrl}/new/address`,
        {
            students,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const fetchKitDispatchData = async (): Promise<Student[]> => {
    try {
        const { data } = await axios.get(`${backendUrl}/new/kit-data`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return data.data;
    } catch (error) {
        console.error("Error fetching kit dispatch data:", error);
        return [];
    }
};

const markReady = async (studentId: string) => {
    try {
        await axios.post(
            `${backendUrl}/new/kit-ready`,
            { studentId },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
    } catch (error) {
        console.error("Error marking kit as ready:", error);
    }
};

const markDispatched = async (studentId: string) => {
    try {
        const date = new Date();
        await axios.post(
            `${backendUrl}/new/kit-dispatch`,
            { studentId, date },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
    } catch (error) {
        console.error("Error marking kit as dispatched:", error);
    }
};

export default function KitDispatchPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [kitStatusFilter, setKitStatusFilter] = useState("All");
    const [dispatchStatusFilter, setDispatchStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("name");
    const router = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchKitDispatchData();
            setStudents(data);
        };
        loadData();
    }, []);

    const handleMarkReady = async (studentId: string) => {
        await markReady(studentId);
        setStudents(
            students.map((student) =>
                student.id === studentId
                    ? { ...student, kitReady: !student.kitReady }
                    : student,
            ),
        );
    };

    const handleMarkDispatched = async (studentId: string) => {
        await markDispatched(studentId);
        setStudents(
            students.map((student) =>
                student.id === studentId
                    ? {
                          ...student,
                          kitDispatched: !student.kitDispatched,
                          kitDispatchedDate: student.kitDispatched
                              ? null
                              : new Date(),
                      }
                    : student,
            ),
        );
    };

    const filteredAndSortedStudents = useMemo(() => {
        return students
            .filter(
                (student) =>
                    student.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) &&
                    (kitStatusFilter === "All" ||
                        (kitStatusFilter === "Ready" && student.kitReady) ||
                        (kitStatusFilter === "Not Ready" &&
                            !student.kitReady)) &&
                    (dispatchStatusFilter === "All" ||
                        (dispatchStatusFilter === "Dispatched" &&
                            student.kitDispatched) ||
                        (dispatchStatusFilter === "Not Dispatched" &&
                            !student.kitDispatched)),
            )
            .sort((a, b) => {
                if (sortBy === "name") return a.name.localeCompare(b.name);
                if (sortBy === "kitStatus")
                    return Number(b.kitReady) - Number(a.kitReady);
                if (sortBy === "dispatchStatus")
                    return Number(b.kitDispatched) - Number(a.kitDispatched);
                return 0;
            });
    }, [students, searchTerm, kitStatusFilter, dispatchStatusFilter, sortBy]);

    const handleDownload = async () => {
        const studentsWithAddress = await getStudentsData(
            filteredAndSortedStudents.map((student) => student.id),
        );
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(
            studentsWithAddress.map((student, index) => ({
                orderId: `order${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${(index + 1).toString().padStart(3, "0")}`,
                "Buyer's mobile number": student.callNumber,
                "Buyer's First name": student.name.split(" ")[0],
                "Buyer's last name": student.name.split(" ").slice(1).join(" "),
                Email: student.email,
                "Shipping complete Address": student.completeAddress,
                Landmark: student.landmark,
                pincode: student.pincode,
                state: student.state,
                country: student.country,
            })),
        );

        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, "students_data.xlsx");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Kit Dispatch Management</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select
                        value={kitStatusFilter}
                        onValueChange={setKitStatusFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Kit Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                            <SelectItem value="Not Ready">Not Ready</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={dispatchStatusFilter}
                        onValueChange={setDispatchStatusFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Dispatch Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Dispatched">
                                Dispatched
                            </SelectItem>
                            <SelectItem value="Not Dispatched">
                                Not Dispatched
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="kitStatus">
                                Kit Status
                            </SelectItem>
                            <SelectItem value="dispatchStatus">
                                Dispatch Status
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedStudents.map((student) => (
                    <Card key={student.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>{student.name}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router(`/profile/${student.id}`)
                                    }
                                >
                                    <User className="h-4 w-4 mr-1" />
                                    Profile
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-2">
                                Call Number: {student.callNumber}
                            </p>
                            <div className="flex gap-2 mb-2">
                                <Badge
                                    variant={
                                        student.kitReady
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {student.kitReady ? (
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Kit{" "}
                                    {student.kitReady ? "Ready" : "Not Ready"}
                                </Badge>
                                <Badge
                                    variant={
                                        student.kitDispatched
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {student.kitDispatched ? (
                                        <Package className="h-4 w-4 mr-1" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-1" />
                                    )}
                                    {student.kitDispatched
                                        ? "Dispatched"
                                        : "Not Dispatched"}
                                </Badge>
                            </div>
                            {student.kitDispatchedDate && (
                                <p className="text-sm text-gray-500">
                                    Dispatched on:{" "}
                                    {new Date(
                                        student.kitDispatchedDate,
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <div className="flex gap-2 w-full">
                                <Button
                                    className="flex-1"
                                    variant={
                                        student.kitReady
                                            ? "secondary"
                                            : "default"
                                    }
                                    onClick={() => handleMarkReady(student.id)}
                                >
                                    {student.kitReady ? "Ready" : "Mark Ready"}
                                </Button>
                                <Button
                                    className="flex-1"
                                    variant={
                                        student.kitDispatched
                                            ? "secondary"
                                            : "default"
                                    }
                                    onClick={() =>
                                        handleMarkDispatched(student.id)
                                    }
                                    disabled={!student.kitReady}
                                >
                                    {student.kitDispatched
                                        ? "Dispatched"
                                        : "Mark Dispatched"}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
