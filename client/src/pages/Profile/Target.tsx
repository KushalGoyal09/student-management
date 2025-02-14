import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Trash2 } from "lucide-react";
import syllabusAtom from "@/recoil/syllabus";

interface Chapter {
    id: number;
    chapterName: string;
    createdAt: Date;
}

interface Syllabus {
    physics: Chapter[];
    chemistry: Chapter[];
    biology: Chapter[];
}

type TargetType = "Regular" | "Revision" | "Extra";

interface SubjectTarget {
    id: string;
    chapterId: number;
}

interface Target {
    id: string;
    completed: boolean;
    date: string;
    targetType: TargetType;
    physics: SubjectTarget[];
    chemistry: SubjectTarget[];
    biology: SubjectTarget[];
}

type Props = {
    studentId: string;
};

const markComplete = async (targetId: string) => {
    await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/target/complete",
        { targetId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
};

const deleteTarget = async (targetId: string) => {
    await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/target/delete",
        { targetId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
};

const TargetComponent: React.FC<Props> = ({ studentId }) => {
    const syllabus: Syllabus = useRecoilValue(syllabusAtom);
    const [targets, setTargets] = useState<Target[]>([]);

    useEffect(() => {
        const fetchTargets = async () => {
            const { data } = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/target/get-incomplete",
                { studentId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setTargets(data.data);
        };
        fetchTargets();
    }, [studentId]);

    const sortedTargets = targets.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const groupedTargets = sortedTargets.reduce(
        (acc, target) => {
            const date = target.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(target);
            return acc;
        },
        {} as Record<string, Target[]>,
    );

    const getChapterName = (subject: keyof Syllabus, chapterId: number) => {
        const chapter = syllabus[subject].find((ch) => ch.id === chapterId);
        return chapter ? chapter.chapterName : "Unknown Chapter";
    };

    const handleMarkComplete = async (targetId: string) => {
        if (
            window.confirm(
                "Are you sure you want to mark this target as complete?",
            )
        ) {
            await markComplete(targetId);
            setTargets((prevTargets) =>
                prevTargets.map((t) =>
                    t.id === targetId ? { ...t, completed: true } : t,
                ),
            );
        }
    };

    const handleDeleteTarget = async (targetId: string) => {
        if (window.confirm("Are you sure you want to delete this target?")) {
            await deleteTarget(targetId);
            setTargets((prevTargets) =>
                prevTargets.filter((t) => t.id !== targetId),
            );
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8 bg-gradient-to-br from-pcb/10 to-pcb/5 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-pcb mb-8">
                Your Learning Targets
            </h1>
            {Object.entries(groupedTargets).map(([date, dateTargets]) => (
                <Card
                    key={date}
                    className="overflow-hidden border-pcb/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                    <CardHeader className="bg-gradient-to-r from-pcb to-purple-600 text-white">
                        <CardTitle className="text-xl md:text-2xl">
                            {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                            {dateTargets.map((target) => (
                                <AccordionItem
                                    key={target.id}
                                    value={target.id}
                                >
                                    <AccordionTrigger className="px-4 py-3 hover:bg-pcb/5 transition-colors duration-200">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-lg font-medium">
                                                {target.targetType} Target
                                            </span>
                                            <Badge
                                                variant={
                                                    target.completed
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={`${target.completed ? "bg-green-500 hover:bg-green-600" : "text-pcb border-pcb"}`}
                                            >
                                                {target.completed
                                                    ? "Completed"
                                                    : "Pending"}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 py-3 bg-white/50 backdrop-blur-sm">
                                        <div className="space-y-4">
                                            {(
                                                [
                                                    "physics",
                                                    "chemistry",
                                                    "biology",
                                                ] as const
                                            ).map((subject) => (
                                                <div
                                                    key={subject}
                                                    className="space-y-2"
                                                >
                                                    <h4 className="font-semibold capitalize text-pcb">
                                                        {subject}
                                                    </h4>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {target[subject].map(
                                                            (chapterTarget) => (
                                                                <li
                                                                    key={
                                                                        chapterTarget.id
                                                                    }
                                                                    className="text-gray-700"
                                                                >
                                                                    {getChapterName(
                                                                        subject,
                                                                        chapterTarget.chapterId,
                                                                    )}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            ))}
                                            <div className="flex flex-wrap justify-end space-x-2 space-y-2 md:space-y-0 mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteTarget(
                                                            target.id,
                                                        )
                                                    }
                                                    className="w-full md:w-auto border-pcb text-pcb hover:bg-pcb hover:text-white"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleMarkComplete(
                                                            target.id,
                                                        )
                                                    }
                                                    disabled={target.completed}
                                                    className={`w-full md:w-auto ${
                                                        target.completed
                                                            ? "bg-green-500 hover:bg-green-600"
                                                            : "bg-pcb hover:bg-pcb/90"
                                                    }`}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    {target.completed
                                                        ? "Completed"
                                                        : "Mark Complete"}
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default TargetComponent;
