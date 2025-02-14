import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Mentor {
    id: number;
    name: string;
    username: string;
}

const fetchMentors = async (): Promise<Mentor[]> => {
    try {
        const { data } = await axios.get(`${backendUrl}/detail/mentors`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return data.data;
    } catch (error) {
        toast({
            description: "Something went wrong fetching mentors",
        });
        return [];
    }
};

export default function MentorList() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useNavigate();

    useEffect(() => {
        fetchMentors().then((data) => {
            setMentors(data);
            setLoading(false);
        });
    }, []);

    const handleMentorClick = (username: string) => {
        router(`/mentor/${username}`);
    };

    return (
        <Card className="w-full max-w-3xl mx-auto font-sans">
            <CardHeader className="bg-pcb text-white rounded-t-xl">
                <CardTitle className="flex items-center text-2xl">
                    <User className="mr-2" />
                    Mentors
                </CardTitle>
            </CardHeader>
            <CardContent className="bg-pink-100 p-4 rounded-b-xl">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {mentors.map((mentor) => (
                            <button
                                key={mentor.id}
                                className="w-full bg-white p-3 rounded-xl flex items-center justify-between transition-colors hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50"
                                onClick={() =>
                                    handleMentorClick(mentor.username)
                                }
                            >
                                <span className="flex items-center text-lg text-purple-800">
                                    <User className="mr-2 text-purple-600" />
                                    {mentor.name}
                                </span>
                                <ChevronRight className="text-purple-600" />
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
