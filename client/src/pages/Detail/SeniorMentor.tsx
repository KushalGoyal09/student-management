import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, User, Check, Star } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface GroupMentor {
    id: string;
    name: string;
    username: string;
}

interface SeniorMentor {
    id: string;
    name: string;
    username: string;
    rating: number;
    GroupMentor: GroupMentor[];
}

const fetchSeniorMentors = async (): Promise<SeniorMentor[]> => {
    try {
        const { data } = await axios.get(
            `${backendUrl}/detail/senior-mentors`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        return data.data;
    } catch (error) {
        toast({
            description: "Something went wrong fetching senior mentors",
        });
        return [];
    }
};

const fetchSMDetails = async (username: string): Promise<SeniorMentor> => {
    try {
        const { data } = await axios.post(
            `${backendUrl}/detail/senior-mentor-detail`,
            {
                seniorMentorUsername: username,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        return data.data;
    } catch (error) {
        toast({
            description: "Something went wrong fetching senior mentor details",
        });
        throw error;
    }
};

export default function SeniorMentorHierarchy() {
    const [seniorMentors, setSeniorMentors] = useState<SeniorMentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSeniorMentors, setExpandedSeniorMentors] = useState<
        Set<string>
    >(new Set());
    const router = useNavigate();

    useEffect(() => {
        fetchSeniorMentors().then((data) => {
            setSeniorMentors(data);
            setLoading(false);
        });
    }, []);

    const toggleSeniorMentor = async (username: string) => {
        const newExpandedSeniorMentors = new Set(expandedSeniorMentors);
        if (newExpandedSeniorMentors.has(username)) {
            newExpandedSeniorMentors.delete(username);
        } else {
            newExpandedSeniorMentors.add(username);
            const seniorMentorIndex = seniorMentors.findIndex(
                (sm) => sm.username === username,
            );
            if (
                seniorMentorIndex !== -1 &&
                !seniorMentors[seniorMentorIndex].GroupMentor
            ) {
                try {
                    const details = await fetchSMDetails(username);
                    setSeniorMentors((prev) =>
                        prev.map((sm) =>
                            sm.username === username
                                ? { ...sm, GroupMentor: details.GroupMentor }
                                : sm,
                        ),
                    );
                } catch (error) {
                    newExpandedSeniorMentors.delete(username);
                }
            }
        }
        setExpandedSeniorMentors(newExpandedSeniorMentors);
    };

    const handleGroupMentorClick = (username: string) => {
        router(`/mentor/${username}`);
    };

    return (
        <Card className="w-full max-w-3xl mx-auto font-sans">
            <CardHeader className="bg-pcb text-white rounded-t-xl">
                <CardTitle className="flex items-center text-2xl">
                    <Check className="mr-2" />
                    SENIOR MENTORS
                </CardTitle>
            </CardHeader>
            <CardContent className="bg-pink-100 p-4 rounded-b-xl">
                {loading ? (
                    <Skeleton className="h-40 w-full" />
                ) : (
                    seniorMentors.map((seniorMentor) => (
                        <div key={seniorMentor.id} className="mb-4">
                            <button
                                className="w-full bg-pcb text-white p-3 rounded-xl flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                onClick={() =>
                                    toggleSeniorMentor(seniorMentor.username)
                                }
                            >
                                <span className="flex items-center text-lg">
                                    <User className="mr-2" />
                                    {seniorMentor.name}
                                </span>
                                <span className="flex items-center">
                                    <Star className="mr-1 text-yellow-300" />
                                    {seniorMentor.rating.toPrecision(2)}
                                    {expandedSeniorMentors.has(
                                        seniorMentor.username,
                                    ) ? (
                                        <ChevronUp className="ml-2" />
                                    ) : (
                                        <ChevronDown className="ml-2" />
                                    )}
                                </span>
                            </button>
                            {expandedSeniorMentors.has(seniorMentor.username) &&
                                seniorMentor.GroupMentor && (
                                    <div className="mt-2 ml-4">
                                        {seniorMentor.GroupMentor.map(
                                            (groupMentor) => (
                                                <button
                                                    key={groupMentor.id}
                                                    className="flex items-center text-pcb/80 mb-1 p-2 rounded-md w-full text-left transition-colors focus:outline-none focus:ring-2"
                                                    onClick={() =>
                                                        handleGroupMentorClick(
                                                            groupMentor.username,
                                                        )
                                                    }
                                                >
                                                    <User className="mr-2" />
                                                    <span>
                                                        {groupMentor.name}
                                                    </span>
                                                </button>
                                            ),
                                        )}
                                    </div>
                                )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
