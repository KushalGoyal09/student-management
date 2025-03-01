import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Edit,
    User,
    Phone,
    Book,
    Target,
    Clock,
    School,
    Award,
    Monitor,
    FileText,
    MessageCircleIcon,
} from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface Student {
    id: string;
    name: string;
    gender: string;
    fatherName: string;
    motherName: string;
    whattsapNumber: string;
    callNumber: string;
    motherNumber: string;
    fatherNumber: string;
    language: string;
    target: string;
    StudyHours: string;
    class: string;
    status: boolean;
    dropperStatus: string;
    previousScore: string;
    platform: string;
    dateOfDeactive?: Date;
    reasonOfDeactive?: string;
    expectation: string;
    createdAt: Date;
    whattsapGroupLink: string | null;
    email: string;
    completeAddress: string | null;
    landmark: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
    groupMentor?: {
        name: string;
        username: string;
    };
}

export default function EnhancedStudentProfile({ id }: { id: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isActiveEditing, setIsActiveEditing] = useState(false);
    const [student, setStudent] = useState<Student | null>(null);
    const [editedStudent, setEditedStudent] = useState<Student | null>(null);

    const fetchStudent = useCallback(async () => {
        const { data } = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/profile/student",
            { studentId: id },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        return data.student;
    }, [id]);

    useEffect(() => {
        fetchStudent()
            .then((data) => {
                setStudent(data);
                setEditedStudent(data);
            })
            .catch(() => {
                toast({
                    title: "Error",
                    description: "Failed to fetch student",
                });
            });
    }, [fetchStudent, id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedStudent((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedStudent) return;

        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/profile/update/student",
                editedStudent,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast({
                title: "Success",
                description: "Student updated successfully",
            });
            setIsEditing(false);
            setStudent(editedStudent);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update student",
            });
        }
    };

    const handleStatusChange = async (status: boolean, reason?: string) => {
        if (!student) return;

        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/profile/update/status",
                {
                    studentId: student.id,
                    date: new Date(),
                    status,
                    reason,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setStudent((prev) =>
                prev
                    ? {
                          ...prev,
                          status,
                          dateOfDeactive:
                              status === false ? new Date() : undefined,
                          reasonOfDeactive: reason,
                      }
                    : null,
            );
            toast({
                title: "Success",
                description: `Active status updated to ${status}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update active status",
            });
        }
    };

    const handleOpenWhattsap = () => {
        window.open(student?.whattsapGroupLink || "");
    };

    if (!student) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pcb/10 to-pcb/30 p-4 md:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-6 border-b">
                    <div>
                        <CardTitle
                            className={`text-2xl font-bold ${!student.status ? "text-red-500" : "text-pcb"}`}
                        >
                            {student.name}
                            {student.gender === "male" ? (
                                <img
                                    src="/male.png"
                                    height={35}
                                    width={35}
                                    alt="male"
                                    className="inline mx-2"
                                />
                            ) : (
                                <img
                                    src="/female.png"
                                    height={35}
                                    width={35}
                                    alt="female"
                                    className="inline mx-2"
                                />
                            )}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                            Student ID: {student.id}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 space-x-2">
                        <Dialog
                            open={isActiveEditing}
                            onOpenChange={setIsActiveEditing}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    {student.status ? "Deactivate" : "Activate"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {student.status
                                            ? "Deactivate Student"
                                            : "Activate Student"}
                                    </DialogTitle>
                                </DialogHeader>
                                <Label htmlFor="reason" className="text-sm">
                                    Reason
                                </Label>
                                <Input
                                    id="reason"
                                    name="reason"
                                    placeholder="Enter reason"
                                    required
                                />
                                <Button
                                    type="button"
                                    className="mt-4"
                                    onClick={() => {
                                        handleStatusChange(
                                            !student.status,
                                            (
                                                document.getElementById(
                                                    "reason",
                                                ) as HTMLInputElement
                                            ).value,
                                        );
                                        setIsActiveEditing(false);
                                    }}
                                >
                                    {student.status
                                        ? "Deactivate Student"
                                        : "Activate Student"}
                                </Button>
                            </DialogContent>
                        </Dialog>
                        <span
                            className="flex items-center space-x-1 text-green-500"
                            onClick={handleOpenWhattsap}
                        >
                            <MessageCircleIcon className="h-6 w-6" />
                            <span>WhatsApp</span>
                        </span>
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">
                                        Edit student profile
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Edit Student Profile
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <ScrollArea className="h-[60vh] pr-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {editedStudent &&
                                                Object.entries(
                                                    editedStudent,
                                                ).map(([key, value]) => {
                                                    if (
                                                        key !== "id" &&
                                                        key !== "createdAt" &&
                                                        key !== "groupMentor" &&
                                                        key !== "expectation" &&
                                                        key !==
                                                            "dateOfDeactive" &&
                                                        key !== "status"
                                                    ) {
                                                        return (
                                                            <div
                                                                key={key}
                                                                className="grid gap-2 py-2"
                                                            >
                                                                <Label
                                                                    htmlFor={
                                                                        key
                                                                    }
                                                                >
                                                                    {key}
                                                                </Label>
                                                                <Input
                                                                    id={key}
                                                                    name={key}
                                                                    value={
                                                                        value as string
                                                                    }
                                                                    onChange={
                                                                        handleInputChange
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                        </div>
                                    </ScrollArea>
                                    <Button type="submit" className="mt-4">
                                        Save Changes
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {student.dateOfDeactive && (
                        <div className="bg-red-100 border border-red-200 text-red-900 p-4 rounded-md mb-6">
                            <p className="text-sm">
                                This student was deactivated on{" "}
                                {new Date(
                                    student.dateOfDeactive,
                                ).toLocaleDateString()}
                            </p>
                            <p className="text-black">
                                Reason:{" "}
                                {student.reasonOfDeactive
                                    ? student.reasonOfDeactive
                                    : "No reason provided"}
                            </p>
                        </div>
                    )}
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                            <TabsTrigger
                                value="personal"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Personal
                            </TabsTrigger>
                            <TabsTrigger
                                value="contact"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Contact
                            </TabsTrigger>
                            <TabsTrigger
                                value="academic"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Academic
                            </TabsTrigger>
                            <TabsTrigger
                                value="other"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Other
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard
                                    icon={User}
                                    label="Name"
                                    value={student.name}
                                />
                                <InfoCard
                                    icon={User}
                                    label="Father's Name"
                                    value={student.fatherName}
                                />
                                <InfoCard
                                    icon={User}
                                    label="Mother's Name"
                                    value={student.motherName}
                                />
                                <InfoCard
                                    icon={Book}
                                    label="Language"
                                    value={student.language}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="contact">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard
                                    icon={Phone}
                                    label="WhatsApp"
                                    value={student.whattsapNumber}
                                    onClick={() => {
                                        const number =
                                            student.whattsapNumber.startsWith(
                                                "+",
                                            )
                                                ? student.whattsapNumber
                                                : `+91${student.whattsapNumber}`;
                                        window.open(`https://wa.me/${number}`);
                                    }}
                                />
                                <InfoCard
                                    icon={Phone}
                                    label="Call Number"
                                    value={student.callNumber}
                                    onClick={() => {
                                        window.open(
                                            `tel:${student.callNumber}`,
                                        );
                                    }}
                                />
                                <InfoCard
                                    icon={Phone}
                                    label="Mother's Number"
                                    value={student.motherNumber}
                                    onClick={() => {
                                        window.open(
                                            `tel:${student.motherNumber}`,
                                        );
                                    }}
                                />
                                <InfoCard
                                    icon={Phone}
                                    label="Father's Number"
                                    value={student.fatherNumber}
                                    onClick={() => {
                                        window.open(
                                            `tel:${student.fatherNumber}`,
                                        );
                                    }}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="academic">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard
                                    icon={Target}
                                    label="Target"
                                    value={student.target}
                                />
                                <InfoCard
                                    icon={Clock}
                                    label="Study Hours"
                                    value={student.StudyHours}
                                />
                                <InfoCard
                                    icon={School}
                                    label="Class"
                                    value={student.class}
                                />
                                <InfoCard
                                    icon={Award}
                                    label="Previous Score"
                                    value={student.previousScore}
                                />
                                <InfoCard
                                    icon={Monitor}
                                    label="Platform"
                                    value={student.platform}
                                />
                                <InfoCard
                                    icon={FileText}
                                    label="Dropper Status"
                                    value={student.dropperStatus}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="other">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard
                                    icon={FileText}
                                    label="Expectation"
                                    value={student.expectation}
                                />
                                <InfoCard
                                    icon={Clock}
                                    label="Created At"
                                    value={new Date(
                                        student.createdAt,
                                    ).toLocaleDateString()}
                                />
                                {student.groupMentor && (
                                    <InfoCard
                                        icon={User}
                                        label="Group Mentor"
                                        value={`${student.groupMentor.name} (${student.groupMentor.username})`}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
    onClick,
}: {
    icon: any;
    label: string;
    value: string;
    onClick?: () => void;
}) {
    return (
        <div
            className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={onClick}
        >
            <div className="bg-pcb/10 p-3 rounded-full">
                <Icon className="h-6 w-6 text-pcb" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className={`text-lg font-semibold text-gray-900`}>{value}</p>
            </div>
        </div>
    );
}
