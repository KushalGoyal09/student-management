import { useState, useEffect, FC } from "react";
import { useRecoilValue } from "recoil";
import syllabusAtom from "@/recoil/syllabus";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface SubjectVision {
    notes: boolean;
    leacture: boolean;
    ncert: boolean;
    QP: boolean;
    revision: boolean;
    viva: boolean;
    studentId: string;
    chapterId: number;
}

interface VisionBoard {
    physics: SubjectVision[];
    chemistry: SubjectVision[];
    biology: SubjectVision[];
}

type Vision = "notes" | "leacture" | "ncert" | "QP" | "revision" | "viva";
type Subject = "physics" | "chemistry" | "biology";

interface SetVision {
    studentId: string;
    subject: Subject;
    chapterId: number;
    vision: Vision;
    completed: boolean;
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

interface VisionBoardComponentProps {
    studentId: string;
}

const getVision = async (studentId: string): Promise<VisionBoard> => {
    const { data } = await axios.post(
        `${backendUrl}/vision/get`,
        { studentId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const setVision = async (data: SetVision) => {
    try {
        await axios.post(`${backendUrl}/vision/set`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return true;
    } catch (error) {
        return false;
    }
};

const VisionBoardComponent: FC<VisionBoardComponentProps> = ({ studentId }) => {
    const syllabus: Syllabus = useRecoilValue(syllabusAtom);
    const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisionBoard = async () => {
            try {
                const data = await getVision(studentId);
                setVisionBoard(data);
            } catch (error) {
                console.error("Error fetching vision board:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVisionBoard();
    }, [studentId]);

    const handleCheckboxChange = async (
        subject: Subject,
        chapterId: number,
        vision: Vision,
        completed: boolean,
    ) => {
        setVisionBoard((prev) => {
            if (!prev) return prev;
            let flag = false;
            const updatedSubject = prev[subject].map((chapter) => {
                if (chapter.chapterId === chapterId) {
                    flag = true;
                    return { ...chapter, [vision]: completed };
                }
                return chapter;
            });
            if (flag) return { ...prev, [subject]: updatedSubject };
            const updatedSubjectVision = {
                studentId,
                chapterId,
                notes: false,
                leacture: false,
                ncert: false,
                QP: false,
                revision: false,
                viva: false,
                [vision]: completed,
            };
            return {
                ...prev,
                [subject]: [...prev[subject], updatedSubjectVision],
            };
        });
        await setVision({
            studentId,
            subject,
            chapterId,
            vision,
            completed,
        });
    };

    const renderChapterCard = (subject: Subject, chapter: Chapter) => {
        const visions: Vision[] = [
            "notes",
            "leacture",
            "ncert",
            "QP",
            "revision",
            "viva",
        ];
        const subjectVision = visionBoard?.[subject].find(
            (v) => v.chapterId === chapter.id,
        );

        return (
            <Card key={chapter.id} className="mb-4">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        {chapter.chapterName}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {visions.map((vision) => (
                            <div
                                key={vision}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={`${subject}-${chapter.id}-${vision}`}
                                    checked={subjectVision?.[vision] || false}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(
                                            subject,
                                            chapter.id,
                                            vision,
                                            checked as boolean,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor={`${subject}-${chapter.id}-${vision}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {vision.charAt(0).toUpperCase() +
                                        vision.slice(1)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-pcb" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-pcb">
                Vision Board
            </h1>
            <Tabs defaultValue="physics" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="physics" className="text-pcb">
                        Physics
                    </TabsTrigger>
                    <TabsTrigger value="chemistry" className="text-pcb">
                        Chemistry
                    </TabsTrigger>
                    <TabsTrigger value="biology" className="text-pcb">
                        Biology
                    </TabsTrigger>
                </TabsList>
                {(["physics", "chemistry", "biology"] as Subject[]).map(
                    (subject) => (
                        <TabsContent key={subject} value={subject}>
                            <div className="space-y-6">
                                {syllabus[subject].map((chapter) =>
                                    renderChapterCard(subject, chapter),
                                )}
                            </div>
                        </TabsContent>
                    ),
                )}
            </Tabs>
        </div>
    );
};

export default VisionBoardComponent;
