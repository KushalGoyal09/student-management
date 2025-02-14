import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axios, { isAxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Mentor = {
    id: string;
    name: string;
    username: string;
};

type Ratings = {
    status: number;
    meeting: number;
    calling: number;
    responsibility: number;
    availability: number;
    targetAssaigning: number;
    targetChecking: number;
};

const fetchRatings = async (groupMentorId: string): Promise<Ratings | null> => {
    try {
        const { data } = await axios.post<{
            data: Ratings | null;
            success: boolean;
        }>(
            `${backendUrl}/rating/get`,
            { groupMentorId },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        return data.data;
    } catch (error) {
        return null;
    }
};

export default function MentorRatingPage() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [selectedMentor, setSelectedMentor] = useState<string>("");
    const [ratings, setRatings] = useState<Ratings>({
        status: 0,
        meeting: 0,
        calling: 0,
        responsibility: 0,
        availability: 0,
        targetAssaigning: 0,
        targetChecking: 0,
    });

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/detail/mentors`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    },
                );
                setMentors(data.data);
            } catch (error) {
                if (isAxiosError(error) && error.response?.data) {
                    toast({
                        title: "Error",
                        description: error.response.data.message,
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: "An error occurred while fetching mentors",
                        variant: "destructive",
                    });
                }
            }
        };
        fetchMentors();
    }, []);

    useEffect(() => {
        const getPreviousRatings = async () => {
            if (selectedMentor) {
                const previousRatings = await fetchRatings(selectedMentor);
                if (previousRatings) {
                    setRatings(previousRatings);
                } else {
                    setRatings({
                        status: 0,
                        meeting: 0,
                        calling: 0,
                        responsibility: 0,
                        availability: 0,
                        targetAssaigning: 0,
                        targetChecking: 0,
                    });
                }
            }
        };
        getPreviousRatings();
    }, [selectedMentor]);

    const handleRatingChange = (parameter: keyof Ratings, value: number[]) => {
        setRatings((prev) => ({ ...prev, [parameter]: value[0] }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await axios.post(
                `${backendUrl}/rating/supervisor`,
                {
                    groupMentorId: selectedMentor,
                    ...ratings,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast({
                title: "Success",
                description: "Ratings submitted successfully",
            });
            const updatedRatings = await fetchRatings(selectedMentor);
            if (updatedRatings) {
                setRatings(updatedRatings);
            }
        } catch (error) {
            if (isAxiosError(error) && error.response?.data) {
                toast({
                    title: "Error",
                    description: error.response.data.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "An error occurred while submitting ratings",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="container mx-auto p-4 w-full md:w-3/4 min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">
                        Rate Mentor Performance
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                        Select a mentor and provide ratings for various
                        parameters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="mentor-select"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Select Mentor
                            </label>
                            <Select onValueChange={setSelectedMentor}>
                                <SelectTrigger
                                    id="mentor-select"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select a mentor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mentors.map((mentor) => (
                                        <SelectItem
                                            key={mentor.id}
                                            value={mentor.id}
                                        >
                                            {mentor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {Object.entries(ratings).map(([parameter, value]) => (
                            <div key={parameter} className="space-y-2">
                                <label
                                    htmlFor={parameter}
                                    className="block text-sm font-medium text-gray-700 capitalize"
                                >
                                    {parameter
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}
                                </label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        id={parameter}
                                        min={0}
                                        max={5}
                                        step={1}
                                        value={[value]}
                                        onValueChange={(newValue) =>
                                            handleRatingChange(
                                                parameter as keyof Ratings,
                                                newValue,
                                            )
                                        }
                                        className="flex-grow"
                                    />
                                    <span className="text-sm text-gray-500 w-8 text-center">
                                        {value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full"
                    >
                        Submit Ratings
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
