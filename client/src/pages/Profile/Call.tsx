import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

enum DaysOfWeek {
    SUNDAY = "SUNDAY",
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
}

type CallStatus = "Scheduled" | "Done" | "DNP" | "Nothing";

interface CallUpdate {
    id: string;
    date: string;
    day: DaysOfWeek;
    callStatus: CallStatus;
}

interface StudentCallUpdatesProps {
    studentId: string;
}

const StudentCallUpdates = ({ studentId }: StudentCallUpdatesProps) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [callUpdates, setCallUpdates] = useState<CallUpdate[]>([]);

    useEffect(() => {
        fetchCallUpdates();
    }, [currentWeek]);

    const fetchCallUpdates = async () => {
        const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/call/student",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        studentId,
                        weekStart: format(weekStart, "yyyy-MM-dd"),
                    }),
                },
            );
            if (!response.ok) throw new Error("Failed to fetch call updates");
            const data = await response.json();
            setCallUpdates(data.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch call updates",
                variant: "destructive",
            });
        }
    };

    const handlePreviousWeek = () =>
        setCurrentWeek((prev) => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

    const getStatusColor = (status: CallStatus) => {
        switch (status) {
            case "Scheduled":
                return "bg-blue-300 text-blue-800";
            case "Done":
                return "bg-green-300 text-green-800";
            case "DNP":
                return "bg-red-300 text-red-800";
            case "Nothing":
            default:
                return "bg-gray-300 text-gray-800";
        }
    };

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

    return (
        <>
            <div className="flex justify-between items-center mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
                <div className="text-lg font-semibold text-gray-700">
                    Insights
                </div>
                <div className="text-sm text-gray-600">
                    Total Calls: {callUpdates.length}
                </div>
            </div>
            <Card className="w-full mt-6 max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">
                        Call Updates
                    </CardTitle>
                    <div className="flex items-center justify-between mt-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePreviousWeek}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                            {format(weekStart, "MMM d")} -{" "}
                            {format(weekEnd, "MMM d, yyyy")}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextWeek}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center">
                        {Object.values(DaysOfWeek).map((day, index) => {
                            const date = addWeeks(weekStart, 0);
                            date.setDate(weekStart.getDate() + index);
                            const callUpdate = callUpdates.find(
                                (update) =>
                                    update.date === format(date, "yyyy-MM-dd"),
                            );
                            const status = callUpdate
                                ? callUpdate.callStatus
                                : "nothing";

                            return (
                                <div
                                    key={day}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-xs font-medium mb-1">
                                        {day.slice(0, 3)}
                                    </span>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${getStatusColor(status as CallStatus)}`}
                                    >
                                        {status === "nothing"
                                            ? "-"
                                            : status.charAt(0)}
                                    </div>
                                    <span className="text-xs mt-1">
                                        {format(date, "d")}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
export default StudentCallUpdates;
