import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useRecoilValue } from "recoil";
import { Role, userAtom } from "@/recoil/userAtom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface SyllabusItem {
    id: string;
    chapterName: string;
}

interface SubjectData {
    [key: string]: SyllabusItem[];
}

export default function AdminSyllabus() {
    const [subjectData, setSubjectData] = useState<SubjectData>({
        physics: [],
        chemistry: [],
        biology: [],
    });

    const [newChapter, setNewChapter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const role = useRecoilValue(userAtom);

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setNewChapter(() => value);
    };

    const fetchSyllabus = async () => {
        try {
            const response = await fetch(`${backendUrl}/syllabus/getAll`);
            if (!response.ok) throw new Error("Failed to fetch syllabus");
            const data = await response.json();
            setSubjectData(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching syllabus:", error);
            setIsLoading(false);
        }
    };

    const addChapter = async (subject: string) => {
        if (!newChapter.trim()) return;
        try {
            const response = await fetch(
                `${backendUrl}/syllabus/add${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ chapterName: newChapter }),
                },
            );
            if (!response.ok)
                throw new Error(`Failed to add ${subject} chapter`);
            setNewChapter("");
            await fetchSyllabus();
        } catch (error) {
            if (isAxiosError(error)) {
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
                description: "Failed to add chapter",
            });
            return;
        }
    };

    const deleteChapter = async (subject: string, id: string) => {
        try {
            const response = await fetch(
                `${backendUrl}/syllabus/delete${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ chapterId: id }),
                },
            );
            if (!response.ok)
                throw new Error(`Failed to delete ${subject} chapter`);
            await fetchSyllabus();
        } catch (error) {
            if (isAxiosError(error)) {
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
                description: "Failed to delete chapter",
            });
            return;
        }
    };

    const SubjectTab = ({ subject }: { subject: string }) => (
        <TabsContent value={subject} className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}{" "}
                        Syllabus
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {role === Role.admin && (
                        <div className="mb-4 flex space-x-2">
                            <Input
                                placeholder={`Add new ${subject} chapter`}
                                value={newChapter}
                                onChange={handleInputChange}
                                autoFocus
                            />
                            <Button onClick={() => addChapter(subject)}>
                                Add
                            </Button>
                        </div>
                    )}
                    <ul className="space-y-2">
                        {subjectData[subject].map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between border-b pb-2"
                            >
                                <span>{item.chapterName}</span>
                                {role === Role.admin && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            deleteChapter(subject, item.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </TabsContent>
    );

    if (isLoading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-6 text-3xl font-bold">Syllabus Management</h1>
            <Tabs defaultValue="physics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="physics">Physics</TabsTrigger>
                    <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                    <TabsTrigger value="biology">Biology</TabsTrigger>
                </TabsList>
                <SubjectTab subject="physics" />
                <SubjectTab subject="chemistry" />
                <SubjectTab subject="biology" />
            </Tabs>
        </div>
    );
}
