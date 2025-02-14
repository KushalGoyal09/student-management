import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Binoculars, User, Check } from "lucide-react";
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

interface Supervisor {
    id: string;
    name: string;
    username: string;
    SeniorMentor: SeniorMentor[];
}

const fetchSupervisors = async (): Promise<Supervisor[]> => {
    try {
        const { data } = await axios.get(`${backendUrl}/detail/supervisors`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return data.data;
    } catch (error) {
        toast({
            description: "Something went wrong fetching supervisors",
        });
        return [];
    }
};

const fetchSupervisorDetails = async (
    username: string,
): Promise<Supervisor> => {
    try {
        const { data } = await axios.post(
            `${backendUrl}/detail/supervisor-detail`,
            {
                supervisorUsername: username,
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
            description: "Something went wrong fetching supervisor details",
        });
        throw error;
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

export default function MentorSupervisorHierarchy() {
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSupervisors, setExpandedSupervisors] = useState<Set<string>>(
        new Set(),
    );
    const [expandedSeniorMentors, setExpandedSeniorMentors] = useState<
        Set<string>
    >(new Set());
    const router = useNavigate();

    useEffect(() => {
        fetchSupervisors().then((data) => {
            setSupervisors(data);
            setLoading(false);
        });
    }, []);

    const toggleSupervisor = async (username: string) => {
        const newExpandedSupervisors = new Set(expandedSupervisors);
        if (newExpandedSupervisors.has(username)) {
            newExpandedSupervisors.delete(username);
        } else {
            newExpandedSupervisors.add(username);
            const supervisorIndex = supervisors.findIndex(
                (s) => s.username === username,
            );
            if (
                supervisorIndex !== -1 &&
                !supervisors[supervisorIndex].SeniorMentor
            ) {
                try {
                    const details = await fetchSupervisorDetails(username);
                    setSupervisors((prev) =>
                        prev.map((s) =>
                            s.username === username
                                ? { ...s, SeniorMentor: details.SeniorMentor }
                                : s,
                        ),
                    );
                } catch (error) {
                    newExpandedSupervisors.delete(username);
                }
            }
        }
        setExpandedSupervisors(newExpandedSupervisors);
    };

    const toggleSeniorMentor = async (
        supervisorUsername: string,
        seniorMentorUsername: string,
    ) => {
        const newExpandedSeniorMentors = new Set(expandedSeniorMentors);
        if (newExpandedSeniorMentors.has(seniorMentorUsername)) {
            newExpandedSeniorMentors.delete(seniorMentorUsername);
        } else {
            newExpandedSeniorMentors.add(seniorMentorUsername);
            const supervisorIndex = supervisors.findIndex(
                (s) => s.username === supervisorUsername,
            );
            const seniorMentorIndex = supervisors[
                supervisorIndex
            ].SeniorMentor.findIndex(
                (sm) => sm.username === seniorMentorUsername,
            );
            if (
                supervisorIndex !== -1 &&
                seniorMentorIndex !== -1 &&
                !supervisors[supervisorIndex].SeniorMentor[seniorMentorIndex]
                    .GroupMentor
            ) {
                try {
                    const details = await fetchSMDetails(seniorMentorUsername);
                    setSupervisors((prev) =>
                        prev.map((s) =>
                            s.username === supervisorUsername
                                ? {
                                      ...s,
                                      SeniorMentor: s.SeniorMentor.map((sm) =>
                                          sm.username === seniorMentorUsername
                                              ? {
                                                    ...sm,
                                                    GroupMentor:
                                                        details.GroupMentor,
                                                }
                                              : sm,
                                      ),
                                  }
                                : s,
                        ),
                    );
                } catch (error) {
                    newExpandedSeniorMentors.delete(seniorMentorUsername);
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
                    Supervisors
                </CardTitle>
            </CardHeader>
            <CardContent className="bg-pink-100 p-4 rounded-b-xl">
                {loading ? (
                    <Skeleton className="h-40 w-full" />
                ) : (
                    supervisors.map((supervisor) => (
                        <div key={supervisor.id} className="mb-4">
                            <button
                                className="w-full bg-pcb text-white p-3 rounded-xl flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                onClick={() =>
                                    toggleSupervisor(supervisor.username)
                                }
                            >
                                <span className="flex items-center text-lg">
                                    <Binoculars className="mr-2" />
                                    {supervisor.name}
                                </span>
                                {expandedSupervisors.has(
                                    supervisor.username,
                                ) ? (
                                    <ChevronUp />
                                ) : (
                                    <ChevronDown />
                                )}
                            </button>
                            {expandedSupervisors.has(supervisor.username) &&
                                supervisor.SeniorMentor && (
                                    <div className="mt-2 ml-4">
                                        {supervisor.SeniorMentor.map(
                                            (seniorMentor) => (
                                                <div
                                                    key={seniorMentor.id}
                                                    className="mb-2"
                                                >
                                                    <button
                                                        className="w-full bg-pcb/80 text-white p-2 rounded-lg flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50"
                                                        onClick={() =>
                                                            toggleSeniorMentor(
                                                                supervisor.username,
                                                                seniorMentor.username,
                                                            )
                                                        }
                                                    >
                                                        <span className="flex items-center">
                                                            <User className="mr-2" />
                                                            {seniorMentor.name}
                                                        </span>
                                                        {expandedSeniorMentors.has(
                                                            seniorMentor.username,
                                                        ) ? (
                                                            <ChevronUp />
                                                        ) : (
                                                            <ChevronDown />
                                                        )}
                                                    </button>
                                                    {expandedSeniorMentors.has(
                                                        seniorMentor.username,
                                                    ) &&
                                                        seniorMentor.GroupMentor && (
                                                            <div className="mt-1 ml-4">
                                                                {seniorMentor.GroupMentor.map(
                                                                    (
                                                                        groupMentor,
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                groupMentor.id
                                                                            }
                                                                            className="flex items-center text-pcb/70 mb-1 p-1 rounded-md w-full text-left transition-colors hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50"
                                                                            onClick={() =>
                                                                                handleGroupMentorClick(
                                                                                    groupMentor.username,
                                                                                )
                                                                            }
                                                                        >
                                                                            <User className="mr-2" />
                                                                            <span>
                                                                                {
                                                                                    groupMentor.name
                                                                                }
                                                                            </span>
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
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
