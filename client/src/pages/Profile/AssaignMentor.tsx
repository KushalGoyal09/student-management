import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Props = {
    studentId: string;
    currentMentor?: { name: string; username: string };
};

interface SeniorMentor {
    id: string;
    name: string;
    username: string;
}

interface GroupMentor {
    id: string;
    name: string;
    username: string;
}

const fetchSeniorMentors = async (): Promise<SeniorMentor[]> => {
    const { data } = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/assaign/seniorMentors",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const getStudentMentor = async (
    studentId: string,
) => {
    const { data } = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/profile/student",
        { studentId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return {
        groupMentor: data.student.groupMentor,
        seniorMentor: data.student.seniorMentor,
    };
};

const fetchMentors = async (seniorMentorId: string): Promise<GroupMentor[]> => {
    const { data } = await axios.post(
        `${backendUrl}/assaign/groupMentors/`,
        {
            seniorMentorId,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

export default function AssignMentor({ studentId, currentMentor }: Props) {
    const [seniorMentors, setSeniorMentors] = useState<SeniorMentor[]>([]);
    const [groupMentors, setGroupMentors] = useState<GroupMentor[]>([]);
    const [selectedSeniorMentor, setSelectedSeniorMentor] =
        useState<string>("");
    const [selectedGroupMentor, setSelectedGroupMentor] = useState<string>("");
    const [assaignedMentor, setAssaignedMentor] = useState<{
        username: string;
        name: string;
    } | null>(null);
    const [seniorMentor, setSeniorMentor] = useState<{
        username: string;
        name: string;
    } | null>(null);
    const [groupLink, setGroupLink] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getStudentMentor(studentId).then((data) => {
            if (data && data.groupMentor) {
                setAssaignedMentor(data.groupMentor);
            }
            if (data && data.seniorMentor) {
                setSeniorMentor(data.seniorMentor);
            }
        });
    }, []);

    useEffect(() => {
        const loadSeniorMentors = async () => {
            try {
                const data = await fetchSeniorMentors();
                setSeniorMentors(data);
            } catch (error) {
                toast({
                    title: "Error",
                    description:
                        "Failed to fetch senior mentors. Please try again.",
                    variant: "destructive",
                });
            }
        };

        loadSeniorMentors();
    }, [toast]);

    useEffect(() => {
        const loadGroupMentors = async () => {
            if (selectedSeniorMentor) {
                try {
                    const data = await fetchMentors(selectedSeniorMentor);
                    setGroupMentors(data);
                } catch (error) {
                    toast({
                        title: "Error",
                        description:
                            "Failed to fetch group mentors. Please try again.",
                        variant: "destructive",
                    });
                }
            } else {
                setGroupMentors([]);
            }
        };

        loadGroupMentors();
    }, [selectedSeniorMentor, toast]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedGroupMentor) {
            toast({
                title: "Error",
                description: "Please select a group mentor before submitting.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/new/assign-mentor",
                {
                    studentId,
                    mentorId: selectedGroupMentor,
                    whattsapGroupLink: groupLink,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast({
                title: "Success",
                description: "Mentor assigned successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to assign mentor. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {assaignedMentor && (
                <div>
                    <div className="mb-4 p-4 bg-yellow-100 rounded-md flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-700">
                            Current mentor: {assaignedMentor.name} (
                            {assaignedMentor.username})
                        </p>
                    </div>
                </div>
            )}
            {seniorMentor && (
                <div>
                    <div className="mb-4 p-4 bg-yellow-100 rounded-md flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <p className="text-sm text-yellow-700">
                            Senior Mentor: {seniorMentor.name} (
                            {seniorMentor.username})
                        </p>
                    </div>
                </div>
            )}
            <Card className="w-full mt-6 max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Assign Mentor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {currentMentor && (
                        <div className="mb-4 p-4 bg-yellow-100 rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <p className="text-sm text-yellow-700">
                                Current mentor: {currentMentor.name} (
                                {currentMentor.username})
                            </p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="senior-mentor-select"
                                className="text-sm font-medium text-gray-700"
                            >
                                Select Senior Mentor
                            </label>
                            <Select
                                onValueChange={(value) => {
                                    setSelectedSeniorMentor(value);
                                    setSelectedGroupMentor("");
                                }}
                                value={selectedSeniorMentor}
                            >
                                <SelectTrigger
                                    id="senior-mentor-select"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select a senior mentor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {seniorMentors.map((mentor) => (
                                        <SelectItem
                                            key={mentor.id}
                                            value={mentor.id}
                                        >
                                            {mentor.name} ({mentor.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedSeniorMentor && (
                            <div className="space-y-2">
                                <label
                                    htmlFor="group-mentor-select"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Select Group Mentor
                                </label>
                                <Select
                                    onValueChange={setSelectedGroupMentor}
                                    value={selectedGroupMentor}
                                >
                                    <SelectTrigger
                                        id="group-mentor-select"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a group mentor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groupMentors.map((mentor) => (
                                            <SelectItem
                                                key={mentor.id}
                                                value={mentor.id}
                                            >
                                                {mentor.name} ({mentor.username}
                                                )
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label
                                htmlFor="groupLink"
                                className="text-sm font-medium text-gray-700"
                            >
                                WhatsApp Group Link
                            </label>
                            <Input
                                id="groupLink"
                                value={groupLink}
                                onChange={(e) => setGroupLink(e.target.value)}
                                placeholder="Enter WhatsApp group link"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Assigning..." : "Assign Mentor"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
