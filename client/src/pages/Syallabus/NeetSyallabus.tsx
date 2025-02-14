import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Role, userAtom } from "@/recoil/userAtom";
import syllabusAtom from "@/recoil/syllabus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

type Subject = "physics" | "chemistry" | "biology";

const addChapter = async (
    subject: Subject,
    chapterName: string,
): Promise<Chapter> => {
    const { data } = await axios.post(
        `${backendUrl}/syllabus/add`,
        {
            chapterName,
            subject,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const deleteChapter = async (
    subject: Subject,
    chapterId: number,
): Promise<boolean> => {
    try {
        await axios.post(
            `${backendUrl}/syllabus/delete`,
            {
                chapterId,
                subject,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        return true;
    } catch (error) {
        return false;
    }
};

export default function SyllabusComponent() {
    const role = useRecoilValue(userAtom);
    const [syllabus, setSyllabus] = useRecoilState<Syllabus>(syllabusAtom);
    const [newChapter, setNewChapter] = useState("");
    const [activeTab, setActiveTab] = useState<Subject>("physics");

    const handleAddChapter = async () => {
        if (newChapter.trim()) {
            const chapter = await addChapter(activeTab, newChapter);
            setSyllabus((prev) => ({
                ...prev,
                [activeTab]: [...prev[activeTab], chapter],
            }));
            setNewChapter("");
        }
    };

    const handleDeleteChapter = async (chapterId: number) => {
        const success = await deleteChapter(activeTab, chapterId);
        if (success) {
            setSyllabus((prev) => ({
                ...prev,
                [activeTab]: prev[activeTab].filter(
                    (chapter) => chapter.id !== chapterId,
                ),
            }));
        } else {
            toast({
                title: "Error",
                description: "Failed to delete chapter",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pcb/10 to-pcb/5 p-2 sm:p-4 md:p-8">
            <Card className="max-w-full sm:max-w-4xl mx-auto shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-pcb">
                        Neet Syllabus
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="physics"
                        onValueChange={(value) =>
                            setActiveTab(value as Subject)
                        }
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger
                                value="physics"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Physics
                            </TabsTrigger>
                            <TabsTrigger
                                value="chemistry"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Chemistry
                            </TabsTrigger>
                            <TabsTrigger
                                value="biology"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                            >
                                Biology
                            </TabsTrigger>
                        </TabsList>
                        {(["physics", "chemistry", "biology"] as const).map(
                            (subject) => (
                                <TabsContent key={subject} value={subject}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-pcb">
                                                {subject
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    subject.slice(1)}{" "}
                                                Syllabus
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {role === Role.admin && (
                                                <div className="flex space-x-2 mb-4">
                                                    <Input
                                                        placeholder="New chapter name"
                                                        value={newChapter}
                                                        onChange={(e) =>
                                                            setNewChapter(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        onClick={
                                                            handleAddChapter
                                                        }
                                                        className="bg-pcb hover:bg-pcb/90"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            )}
                                            <ul className="space-y-2">
                                                {syllabus[subject].map(
                                                    (chapter) => (
                                                        <li
                                                            key={chapter.id}
                                                            className="flex items-center justify-between p-2 bg-gray-100 rounded"
                                                        >
                                                            <span>
                                                                {
                                                                    chapter.chapterName
                                                                }
                                                            </span>
                                                            {role ===
                                                                Role.admin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleDeleteChapter(
                                                                            chapter.id,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ),
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
