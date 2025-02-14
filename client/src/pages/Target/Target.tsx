import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, CalendarIcon } from "lucide-react";
import { useRecoilValue } from "recoil";
import existingStudents from "@/recoil/existingStudents";
import syllabusAtom from "@/recoil/syllabus";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PreviewModal from "./Preview";
import axios from "axios";
import PreviousTargets from "./PreviousTargets";

interface SubjectTarget {
    chapterId: number;
    numberOfLecture: number;
    isFinal?: boolean;
}

interface DayTarget {
    date: string;
    targetType: "Regular" | "Revision" | "Extra";
    physics: SubjectTarget[];
    chemistry: SubjectTarget[];
    biology: SubjectTarget[];
}

type TargetType = "Regular" | "Revision" | "Extra";
type Subject = "physics" | "chemistry" | "biology";

interface LecturesDoneResponse {
    data: {
        numberOfExtraLectures: number;
        numberOfRegularLectures: number;
        numberOfRevisionLectures: number;
    };
    success: boolean;
}

interface OngoingChapter {
    chapterId: number;
    lecturesPerDay: number;
    lecturesDone: number;
    isComplete: boolean;
}

const getLecturesDone = async (
    studentId: string,
    chapterId: number,
    subject: Subject,
): Promise<LecturesDoneResponse["data"]> => {
    const { data } = await axios.post<LecturesDoneResponse>(
        import.meta.env.VITE_BACKEND_URL + "/target/getLecturesDone",
        {
            studentId,
            chapterId,
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

export default function TargetAssignment() {
    const [checkboxStates, setCheckboxStates] = useState<{
        [key: string]: boolean;
    }>({});
    const [showRevision, setShowRevision] = useState(false);
    const [showRegular, setShowRegular] = useState(false);
    const [showExtra, setShowExtra] = useState(false);
    const students = useRecoilValue(existingStudents);
    const syllabus = useRecoilValue(syllabusAtom);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [dates, setDates] = useState<string[]>([]);
    const [targets, setTargets] = useState<DayTarget[]>([]);
    const [includeCommonSteps, setIncludeCommonSteps] = useState(false);
    const [specialNote, setSpecialNote] = useState("");
    const [includeSpecialNote, setIncludeSpecialNote] = useState(false);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [selectedChapters, setSelectedChapters] = useState<{
        [key in TargetType]: {
            [key in Subject]: number[];
        };
    }>({
        Regular: {
            physics: [0, 0, 0],
            chemistry: [0, 0, 0],
            biology: [0, 0, 0],
        },
        Revision: {
            physics: [0, 0, 0],
            chemistry: [0, 0, 0],
            biology: [0, 0, 0],
        },
        Extra: {
            physics: [0, 0, 0],
            chemistry: [0, 0, 0],
            biology: [0, 0, 0],
        },
    });
    const [ongoingChapters, setOngoingChapters] = useState<{
        [key in TargetType]: {
            [key in Subject]: OngoingChapter[];
        };
    }>({
        Regular: {
            physics: [],
            chemistry: [],
            biology: [],
        },
        Revision: {
            physics: [],
            chemistry: [],
            biology: [],
        },
        Extra: {
            physics: [],
            chemistry: [],
            biology: [],
        },
    });

    useEffect(() => {
        const initialDates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            return date.toISOString().split("T")[0];
        });
        setDates(initialDates);
    }, [startDate]);

    const addDay = () => {
        const lastDate = new Date(dates[dates.length - 1]);
        lastDate.setDate(lastDate.getDate() + 1);
        setDates([...dates, lastDate.toISOString().split("T")[0]]);
    };

    const handleTargetChange = (
        date: string,
        targetType: TargetType,
        subject: Subject,
        columnIndex: number,
        checked: boolean,
    ) => {
        const chapterId = selectedChapters[targetType][subject][columnIndex];
        if (chapterId === 0) return;
        const checkboxKey = `${date}-${targetType}-${subject}-${columnIndex}`;
        setCheckboxStates((prev) => ({
            ...prev,
            [checkboxKey]: checked,
        }));
        setTargets((prevTargets) => {
            const targetIndex = prevTargets.findIndex(
                (t) => t.date === date && t.targetType === targetType,
            );
            if (targetIndex === -1) {
                const lecturesPerDay =
                    ongoingChapters[targetType][subject].find(
                        (chapter) => chapter.chapterId === chapterId,
                    )?.lecturesPerDay || 1;
                return [
                    ...prevTargets,
                    {
                        date,
                        targetType,
                        physics:
                            subject === "physics"
                                ? [
                                      {
                                          chapterId,
                                          numberOfLecture: lecturesPerDay,
                                      },
                                  ]
                                : [],
                        chemistry:
                            subject === "chemistry"
                                ? [
                                      {
                                          chapterId,
                                          numberOfLecture: lecturesPerDay,
                                      },
                                  ]
                                : [],
                        biology:
                            subject === "biology"
                                ? [
                                      {
                                          chapterId,
                                          numberOfLecture: lecturesPerDay,
                                      },
                                  ]
                                : [],
                    },
                ];
            } else {
                const updatedTargets = [...prevTargets];
                if (checked) {
                    const lecturesPerDay =
                        ongoingChapters[targetType][subject].find(
                            (chapter) => chapter.chapterId === chapterId,
                        )?.lecturesPerDay || 1;
                    updatedTargets[targetIndex][subject].push({
                        chapterId,
                        numberOfLecture: lecturesPerDay,
                    });
                } else {
                    updatedTargets[targetIndex][subject] = updatedTargets[
                        targetIndex
                    ][subject].filter((t) => t.chapterId !== chapterId);
                }
                return updatedTargets;
            }
        });

        // Update lectures done for the chapter
        setOngoingChapters((prev) => {
            const updatedOngoingChapters = { ...prev };
            const chapterIndex = updatedOngoingChapters[targetType][
                subject
            ].findIndex((chapter) => chapter.chapterId === chapterId);

            if (chapterIndex !== -1) {
                const lecturesPerDay =
                    updatedOngoingChapters[targetType][subject][chapterIndex]
                        .lecturesPerDay;
                updatedOngoingChapters[targetType][subject][
                    chapterIndex
                ].lecturesDone += checked ? lecturesPerDay : -lecturesPerDay;
            }

            return updatedOngoingChapters;
        });
    };

    const handleChapterSelect = async (
        targetType: TargetType,
        subject: Subject,
        columnIndex: number,
        chapterId: number,
    ) => {
        setSelectedChapters((prev) => ({
            ...prev,
            [targetType]: {
                ...prev[targetType],
                [subject]: prev[targetType][subject].map((id, index) =>
                    index === columnIndex ? chapterId : id,
                ),
            },
        }));

        if (selectedStudent && chapterId !== 0) {
            try {
                const lecturesDone = await getLecturesDone(
                    selectedStudent,
                    chapterId,
                    subject,
                );
                const lecturesDoneCount =
                    targetType === "Regular"
                        ? lecturesDone.numberOfRegularLectures
                        : targetType === "Revision"
                          ? lecturesDone.numberOfRevisionLectures
                          : lecturesDone.numberOfExtraLectures;

                setOngoingChapters((prev) => {
                    const updatedOngoingChapters = { ...prev };
                    const chapterIndex = updatedOngoingChapters[targetType][
                        subject
                    ].findIndex((chapter) => chapter.chapterId === chapterId);

                    if (chapterIndex === -1) {
                        updatedOngoingChapters[targetType][subject].push({
                            chapterId,
                            lecturesPerDay: 1,
                            lecturesDone: lecturesDoneCount,
                            isComplete: false,
                        });
                    } else {
                        updatedOngoingChapters[targetType][subject][
                            chapterIndex
                        ].lecturesDone = lecturesDoneCount;
                    }

                    return updatedOngoingChapters;
                });
            } catch (error) {
                console.error("Error fetching lectures done:", error);
            }
        }
    };

    const handleLecturesPerDayChange = (
        targetType: TargetType,
        subject: Subject,
        chapterId: number,
        value: number,
    ) => {
        setOngoingChapters((prev) => {
            const updatedOngoingChapters = { ...prev };
            const chapterIndex = updatedOngoingChapters[targetType][
                subject
            ].findIndex((chapter) => chapter.chapterId === chapterId);

            if (chapterIndex !== -1) {
                updatedOngoingChapters[targetType][subject][
                    chapterIndex
                ].lecturesPerDay = value;
            }

            return updatedOngoingChapters;
        });
    };

    const handleMarkComplete = (
        targetType: TargetType,
        subject: Subject,
        chapterId: number,
        isComplete: boolean,
    ) => {
        setOngoingChapters((prev) => {
            const updatedOngoingChapters = { ...prev };
            const chapterIndex = updatedOngoingChapters[targetType][
                subject
            ].findIndex((chapter) => chapter.chapterId === chapterId);

            if (chapterIndex !== -1) {
                updatedOngoingChapters[targetType][subject][
                    chapterIndex
                ].isComplete = isComplete;
            }

            return updatedOngoingChapters;
        });

        // Set isFinal to true for the last target of this chapter if marked as complete
        if (isComplete) {
            setTargets((prevTargets) => {
                const updatedTargets = [...prevTargets];
                const lastTargetIndex = (() => {
                    for (let i = updatedTargets.length - 1; i >= 0; i--) {
                        const target = updatedTargets[i];
                        if (
                            target.targetType === targetType &&
                            target[subject].some(
                                (t: SubjectTarget) => t.chapterId === chapterId,
                            )
                        ) {
                            return i;
                        }
                    }
                    return -1;
                })();

                if (lastTargetIndex !== -1) {
                    const chapterIndex = updatedTargets[lastTargetIndex][
                        subject
                    ].findIndex((t) => t.chapterId === chapterId);
                    if (chapterIndex !== -1) {
                        updatedTargets[lastTargetIndex][subject][
                            chapterIndex
                        ].isFinal = true;
                    }
                }

                return updatedTargets;
            });
        }
    };

    const handlePreview = () => {
        console.log(targets);
        setIsPreviewOpen(true);
    };

    const renderOngoingChaptersBox = (targetType: TargetType) => (
        <Card className="mt-4 bg-white shadow-md">
            <CardHeader>
                <CardTitle className="text-pcb text-xl sm:text-2xl">
                    Ongoing Chapters
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="physics" className="w-full">
                    <TabsList className="bg-pcb/5 flex justify-evenly mb-4">
                        {["physics", "chemistry", "biology"].map((subject) => (
                            <TabsTrigger
                                key={subject}
                                value={subject}
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white w-full text-xs sm:text-sm py-1 sm:py-2"
                            >
                                {subject.charAt(0).toUpperCase() +
                                    subject.slice(1)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {["physics", "chemistry", "biology"].map((subject) => (
                        <TabsContent key={subject} value={subject}>
                            {ongoingChapters[targetType][
                                subject as Subject
                            ].map((chapter) => (
                                <div
                                    key={chapter.chapterId}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b last:border-b-0"
                                >
                                    <span className="font-medium mb-2 sm:mb-0">
                                        {
                                            syllabus[subject as Subject].find(
                                                (c) =>
                                                    c.id === chapter.chapterId,
                                            )?.chapterName
                                        }
                                    </span>
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Label
                                                htmlFor={`lectures-per-day-${targetType}-${subject}-${chapter.chapterId}`}
                                                className="text-xs sm:text-sm whitespace-nowrap"
                                            >
                                                Lectures/day:
                                            </Label>
                                            <Input
                                                id={`lectures-per-day-${targetType}-${subject}-${chapter.chapterId}`}
                                                type="number"
                                                value={chapter.lecturesPerDay}
                                                onChange={(e) =>
                                                    handleLecturesPerDayChange(
                                                        targetType,
                                                        subject as Subject,
                                                        chapter.chapterId,
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                className="w-12 h-8 text-sm"
                                                min="1"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label
                                                htmlFor={`lectures-done-${targetType}-${subject}-${chapter.chapterId}`}
                                                className="text-xs sm:text-sm whitespace-nowrap"
                                            >
                                                Lectures done:
                                            </Label>
                                            <span
                                                id={`lectures-done-${targetType}-${subject}-${chapter.chapterId}`}
                                                className="text-sm font-medium"
                                            >
                                                {chapter.lecturesDone}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                                            <Label
                                                htmlFor={`complete-${targetType}-${subject}-${chapter.chapterId}`}
                                                className="text-xs sm:text-sm"
                                            >
                                                Complete:
                                            </Label>
                                            <Switch
                                                id={`complete-${targetType}-${subject}-${chapter.chapterId}`}
                                                checked={chapter.isComplete}
                                                onCheckedChange={(checked) =>
                                                    handleMarkComplete(
                                                        targetType,
                                                        subject as Subject,
                                                        chapter.chapterId,
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );

    const renderSubjectTable = (targetType: TargetType, subject: Subject) => (
        <Card className="mt-4 bg-white shadow-md">
            <CardHeader>
                <CardTitle className="text-pcb">
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto relative">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-pcb/20">
                                <th className="p-4 text-pcb sticky left-0 bg-white z-10">
                                    Date
                                </th>
                                {[0, 1, 2].map((_, index) => (
                                    <th key={index} className="p-2">
                                        <Select
                                            onValueChange={(value) =>
                                                handleChapterSelect(
                                                    targetType,
                                                    subject,
                                                    index,
                                                    Number(value),
                                                )
                                            }
                                            value={selectedChapters[targetType][
                                                subject
                                            ][index].toString()}
                                        >
                                            <SelectTrigger className="border-pcb/30 text-pcb">
                                                <SelectValue
                                                    placeholder={
                                                        "Select chapter"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {syllabus[subject].map(
                                                    (chapter) => (
                                                        <SelectItem
                                                            key={chapter.id}
                                                            value={chapter.id.toString()}
                                                        >
                                                            {
                                                                chapter.chapterName
                                                            }
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dates.map((date) => (
                                <tr
                                    key={date}
                                    className="border-b border-pcb/10"
                                >
                                    <td className="p-2 text-pcb text-center sticky left-0 bg-white z-10">
                                        {format(new Date(date), "MMM dd")}
                                    </td>
                                    {[0, 1, 2].map((_, index) => (
                                        <td
                                            key={`${date}-${index}`}
                                            className="p-2 text-center"
                                        >
                                            <Checkbox
                                                id={`target-${targetType}-${subject}-${date}-${index}`}
                                                className="border-pcb/30 text-pcb"
                                                checked={
                                                    checkboxStates[
                                                        `${date}-${targetType}-${subject}-${index}`
                                                    ] || false
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleTargetChange(
                                                        date,
                                                        targetType,
                                                        subject,
                                                        index,
                                                        checked as boolean,
                                                    )
                                                }
                                                disabled={
                                                    selectedChapters[
                                                        targetType
                                                    ][subject][index] === 0
                                                }
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );

    const renderTargetSection = (targetType: TargetType) => (
        <Card className="mt-8 bg-white shadow-md">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`${targetType}-targets-checkbox`}
                        checked={
                            targetType === "Regular"
                                ? showRegular
                                : targetType === "Revision"
                                  ? showRevision
                                  : showExtra
                        }
                        onCheckedChange={(checked) => {
                            if (targetType === "Regular") {
                                setShowRegular(checked as boolean);
                            } else if (targetType === "Revision") {
                                setShowRevision(checked as boolean);
                            } else {
                                setShowExtra(checked as boolean);
                            }
                        }}
                        className="border-pcb/30 text-pcb"
                    />
                    <Label
                        htmlFor={`${targetType}-targets-checkbox`}
                        className="text-pcb"
                    >
                        {targetType} Targets
                    </Label>
                </div>
            </CardHeader>
            {((targetType === "Regular" && showRegular) ||
                (targetType === "Revision" && showRevision) ||
                (targetType === "Extra" && showExtra)) && (
                <CardContent>
                    {renderOngoingChaptersBox(targetType)}
                    <Tabs defaultValue="physics" className="w-full mt-4">
                        <TabsList className="bg-pcb/5 flex justify-evenly">
                            <TabsTrigger
                                value="physics"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white w-full"
                            >
                                Physics
                            </TabsTrigger>
                            <TabsTrigger
                                value="chemistry"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white w-full"
                            >
                                Chemistry
                            </TabsTrigger>
                            <TabsTrigger
                                value="biology"
                                className="data-[state=active]:bg-pcb data-[state=active]:text-white w-full"
                            >
                                Biology
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="physics">
                            {renderSubjectTable(targetType, "physics")}
                        </TabsContent>
                        <TabsContent value="chemistry">
                            {renderSubjectTable(targetType, "chemistry")}
                        </TabsContent>
                        <TabsContent value="biology">
                            {renderSubjectTable(targetType, "biology")}
                        </TabsContent>
                    </Tabs>
                    <Button
                        onClick={addDay}
                        className="mt-4 bg-pcb text-white hover:bg-pcb/90"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Day
                    </Button>
                </CardContent>
            )}
        </Card>
    );

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-pcb">
                Target Assignment
            </h1>

            <Card className="mb-6 bg-white shadow-md">
                <CardContent className="p-4">
                    <div className="mb-4">
                        <Label htmlFor="student-select" className="text-pcb">
                            Select Junior
                        </Label>
                        <Select
                            onValueChange={setSelectedStudent}
                            value={selectedStudent}
                        >
                            <SelectTrigger
                                id="student-select"
                                className="border-pcb/30 text-pcb"
                            >
                                <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem
                                        key={student.id}
                                        value={student.id}
                                    >
                                        {student.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="start-date" className="text-pcb">
                            Start Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="start-date"
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal border-pcb/30 text-pcb"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? (
                                        format(startDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) =>
                                        date && setStartDate(date)
                                    }
                                    initialFocus
                                    className="border-pcb/10"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            <PreviousTargets
                studentId={selectedStudent}
                startDate={startDate}
            />

            {renderTargetSection("Regular")}
            {renderTargetSection("Revision")}
            {renderTargetSection("Extra")}

            <Card className="mt-8 bg-white shadow-md">
                <CardContent className="p-4">
                    <div className="mb-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="include-common-steps"
                                checked={includeCommonSteps}
                                onCheckedChange={(checked) =>
                                    setIncludeCommonSteps(checked as boolean)
                                }
                                className="border-pcb/30 text-pcb"
                            />
                            <Label
                                htmlFor="include-common-steps"
                                className="text-pcb"
                            >
                                Include common steps
                            </Label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                                id="include-special-note"
                                checked={includeSpecialNote}
                                onCheckedChange={(checked) =>
                                    setIncludeSpecialNote(checked as boolean)
                                }
                                className="border-pcb/30 text-pcb"
                            />
                            <Label
                                htmlFor="include-special-note"
                                className="text-pcb"
                            >
                                Mentor's Special Note
                            </Label>
                        </div>
                        {includeSpecialNote && (
                            <Textarea
                                id="special-note"
                                placeholder="Enter special note"
                                value={specialNote}
                                onChange={(e) => setSpecialNote(e.target.value)}
                                className="border-pcb/30 text-pcb placeholder-pcb/50"
                            />
                        )}
                    </div>

                    <Button
                        onClick={handlePreview}
                        className="w-full bg-pcb text-white hover:bg-pcb/90"
                    >
                        Preview
                    </Button>
                </CardContent>
            </Card>
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                onEdit={() => setIsPreviewOpen(false)}
                data={{
                    studentId: selectedStudent,
                    studentName:
                        students.find((s) => s.id === selectedStudent)?.name ||
                        "",
                    targets: {
                        regular: targets.filter(
                            (t) => t.targetType === "Regular",
                        ),
                        revision: targets.filter(
                            (t) => t.targetType === "Revision",
                        ),
                        extra: targets.filter((t) => t.targetType === "Extra"),
                    },
                    includeCommonSteps,
                    specialNote: includeSpecialNote ? specialNote : null,
                    whatsappGroupLink:
                        students.find((s) => s.id === selectedStudent)
                            ?.whattsapGroupLink || null,
                }}
            />
        </div>
    );
}
