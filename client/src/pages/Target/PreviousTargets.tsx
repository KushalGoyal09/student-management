import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import syllabusAtom from "@/recoil/syllabus";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type TargetType = "Regular" | "Revision" | "Extra";

interface Target {
    id: string;
    completed: boolean;
    date: string;
    targetType: TargetType;
    physics: {
        id: string;
        chapterId: number;
    }[];
    chemistry: {
        id: string;
        chapterId: number;
    }[];
    biology: {
        id: string;
        chapterId: number;
    }[];
}

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

const getTargets = async (
    studentId: string,
    startDate: Date,
): Promise<Target[]> => {
    const { data } = await axios.post(
        `${backendUrl}/target/get`,
        {
            studentId,
            fromDate: format(
                new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                "yyyy-MM-dd",
            ),
            toDate: format(startDate, "yyyy-MM-dd"),
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const PreviousTargets = ({
    studentId,
    startDate,
}: {
    studentId: string;
    startDate: Date;
}) => {
    const syllabus: Syllabus = useRecoilValue(syllabusAtom);
    const [targets, setTargets] = useState<Target[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTargets = async () => {
            try {
                const fetchedTargets = await getTargets(studentId, startDate);
                setTargets(fetchedTargets);
            } catch (error) {
                console.error("Error fetching targets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTargets();
    }, [studentId, startDate]);

    const getChapterName = (subject: keyof Syllabus, chapterId: number) => {
        const chapter = syllabus[subject].find((ch) => ch.id === chapterId);
        return chapter ? chapter.chapterName : "Unknown Chapter";
    };

    const groupTargetsByType = (targetType: TargetType) => {
        const filteredTargets = targets.filter(
            (target) => target.targetType === targetType,
        );
        const groupedTargets = {
            physics: new Set<string>(),
            chemistry: new Set<string>(),
            biology: new Set<string>(),
        };

        filteredTargets.forEach((target) => {
            target.physics.forEach((chapter) =>
                groupedTargets.physics.add(
                    getChapterName("physics", chapter.chapterId),
                ),
            );
            target.chemistry.forEach((chapter) =>
                groupedTargets.chemistry.add(
                    getChapterName("chemistry", chapter.chapterId),
                ),
            );
            target.biology.forEach((chapter) =>
                groupedTargets.biology.add(
                    getChapterName("biology", chapter.chapterId),
                ),
            );
        });

        return groupedTargets;
    };

    const renderSubjectChapters = (chapters: Set<string>) => {
        return Array.from(chapters).map((chapterName) => (
            <Badge
                key={chapterName}
                variant="outline"
                className="mr-2 mb-2 bg-white text-pcb"
            >
                {chapterName}
            </Badge>
        ));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-pcb" />
            </div>
        );
    }

    const targetTypes: TargetType[] = ["Regular", "Revision", "Extra"];

    return (
        <div className="space-y-4">
            <h1 className="text-pcb font-bold">Previous Targets</h1>
            {targets.length === 0 ? (
                <p className="text-black">No targets found</p>
            ) : (
                <Tabs defaultValue="Regular" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        {targetTypes.map((type) => (
                            <TabsTrigger
                                key={type}
                                value={type}
                                className="text-pcb"
                            >
                                {type}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {targetTypes.map((type) => {
                        const groupedTargets = groupTargetsByType(type);
                        return (
                            <TabsContent key={type} value={type}>
                                <Card className="bg-white border-pcb border-2">
                                    <CardHeader>
                                        <CardTitle className="text-pcb">
                                            {type} Targets
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(
                                                [
                                                    "physics",
                                                    "chemistry",
                                                    "biology",
                                                ] as const
                                            ).map((subject) => (
                                                <div key={subject}>
                                                    <h3 className="text-pcb font-semibold capitalize mb-2">
                                                        {subject}
                                                    </h3>
                                                    <div>
                                                        {renderSubjectChapters(
                                                            groupedTargets[
                                                                subject
                                                            ],
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            )}
        </div>
    );
};

export default PreviousTargets;
