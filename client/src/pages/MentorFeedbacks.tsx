import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Response {
    data: string[];
    success: boolean;
}

export default function MentorFeedback() {
    const [feedbacks, setFeedbacks] = useState<string[]>([]);

    useEffect(() => {
        const getFeedback = async () => {
            try {
                const { data } = await axios.get<Response>(
                    `${backendUrl}/rating/mentor`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    },
                );
                setFeedbacks(data.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.data.message) {
                        toast({
                            title: "Error",
                            description: error.response.data.message,
                        });
                        return;
                    }
                }
                toast({
                    title: "Error",
                    description: "Something went wrong. Please try again.",
                });
            }
        };
        getFeedback();
    }, []);

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Card className="shadow-lg">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Mentor Feedback
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Insights and comments from students
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {feedbacks.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No feedback available at this time.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {feedbacks.map((item, index) => (
                                <li
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                                >
                                    <div className="p-4">
                                        <p className="text-gray-800 leading-relaxed">
                                            {item}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
