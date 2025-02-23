import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import existingStudents from "@/recoil/existingStudents";
import syllabusAtom from "@/recoil/syllabus";
import PreviewModal from "./Preview";
import PreviousTargets from "./PreviousTargets";
import { TargetSection } from "./TargetSection";
import { getLecturesDone, getAllset, getTargetInSet } from "./api";
import {
    TargetType,
    Subject,
    DayTarget,
    SubjectTarget,
    OngoingChapter,
    TargetSet,
} from "./types";

const TargetAssignment = () => {
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
        [key in TargetType]: { [key in Subject]: number[] };
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
        Extra: { physics: [0, 0, 0], chemistry: [0, 0, 0], biology: [0, 0, 0] },
    });
    const [ongoingChapters, setOngoingChapters] = useState<{
        [key in TargetType]: { [key in Subject]: OngoingChapter[] };
    }>({
        Regular: { physics: [], chemistry: [], biology: [] },
        Revision: { physics: [], chemistry: [], biology: [] },
        Extra: { physics: [], chemistry: [], biology: [] },
    });
    const [sets, setSets] = useState<TargetSet[]>([]);
    const [selectedSet, setSelectedSet] = useState<{
        [key in TargetType]: string;
    }>({
        Regular: "",
        Revision: "",
        Extra: "",
    });
    const [dayRange, setDayRange] = useState<{
        [key in TargetType]: { from: number; to: number };
    }>({
        Regular: { from: 1, to: 1 },
        Revision: { from: 1, to: 1 },
        Extra: { from: 1, to: 1 },
    });

    useEffect(() => {
        const fetchSets = async () => {
            const fetchedSets = await getAllset();
            setSets(fetchedSets);
        };
        fetchSets();
    }, []);

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

    const handleLoadSet = async (targetType: TargetType) => {
        const setId = selectedSet[targetType];
        const fromDay = dayRange[targetType].from;
        const toDay = dayRange[targetType].to;

        if (!selectedStudent) {
            alert("Please select a student first");
            return;
        }
        if (!setId) {
            alert("Please select a set");
            return;
        }
        if (fromDay < 1 || toDay < fromDay) {
            alert("Invalid day range");
            return;
        }

        try {
            const fetchedTargets = await getTargetInSet(
                setId,
                1,
                toDay - fromDay + 1,
            );

            // Extend dates if needed
            const requiredLength = fromDay - 1 + fetchedTargets.length;
            if (requiredLength > dates.length) {
                const newDates = [...dates];
                let currentDate = new Date(newDates[newDates.length - 1]);
                for (let i = dates.length; i < requiredLength; i++) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    newDates.push(currentDate.toISOString().split("T")[0]);
                }
                setDates(newDates);
            }

            for (const [index, target] of fetchedTargets.entries()) {
                const currentDateIndex = fromDay - 1 + index;
                if (currentDateIndex >= dates.length) break;
                const date = dates[currentDateIndex];

                const processSubject = async (subject: Subject) => {
                    const subjectTarget = target[subject];
                    if (!subjectTarget) return;

                    // Find available column
                    const currentColumns =
                        selectedChapters[targetType][subject];
                    let columnIndex = currentColumns.indexOf(
                        subjectTarget.chapterId,
                    );
                    if (columnIndex === -1) {
                        columnIndex = currentColumns.findIndex(
                            (id) => id === 0,
                        );
                        if (columnIndex === -1) columnIndex = 0;
                    }

                    // Update selected chapter
                    await handleChapterSelect(
                        targetType,
                        subject,
                        columnIndex,
                        subjectTarget.chapterId,
                    );

                    // Update checkbox
                    const checkboxKey = `${date}-${targetType}-${subject}-${columnIndex}`;
                    setCheckboxStates((prev) => ({
                        ...prev,
                        [checkboxKey]: true,
                    }));

                    // Update targets
                    setTargets((prev) => {
                        const targetIndex = prev.findIndex(
                            (t) =>
                                t.date === date && t.targetType === targetType,
                        );
                        const newTarget = {
                            date,
                            targetType,
                            physics: [],
                            chemistry: [],
                            biology: [],
                            [subject]: [
                                {
                                    chapterId: subjectTarget.chapterId,
                                    numberOfLecture:
                                        subjectTarget.numberOfLecture,
                                },
                            ],
                        };

                        return targetIndex === -1
                            ? [...prev, newTarget]
                            : prev.map((t) =>
                                  t.date === date && t.targetType === targetType
                                      ? {
                                            ...t,
                                            [subject]: [
                                                ...t[subject],
                                                ...newTarget[subject],
                                            ],
                                        }
                                      : t,
                              );
                    });
                };

                await Promise.all([
                    processSubject("physics"),
                    processSubject("chemistry"),
                    processSubject("biology"),
                ]);
            }
        } catch (error) {
            console.error("Error loading set:", error);
            alert("Failed to load set");
        }
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
        setCheckboxStates((prev) => ({ ...prev, [checkboxKey]: checked }));
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

            {(["Regular", "Revision", "Extra"] as TargetType[]).map(
                (targetType) => (
                    <div key={targetType}>
                        <TargetSection
                            targetType={targetType}
                            showState={
                                targetType === "Regular"
                                    ? showRegular
                                    : targetType === "Revision"
                                      ? showRevision
                                      : showExtra
                            }
                            setShowState={
                                targetType === "Regular"
                                    ? setShowRegular
                                    : targetType === "Revision"
                                      ? setShowRevision
                                      : setShowExtra
                            }
                            addDay={addDay}
                            ongoingChapters={ongoingChapters}
                            handleLecturesPerDayChange={
                                handleLecturesPerDayChange
                            }
                            handleMarkComplete={handleMarkComplete}
                            dates={dates}
                            selectedChapters={selectedChapters}
                            checkboxStates={checkboxStates}
                            handleChapterSelect={handleChapterSelect}
                            handleTargetChange={handleTargetChange}
                            syllabus={syllabus}
                        />

                        <Card className="mt-4 bg-white shadow-md">
                            <CardContent className="p-4">
                                <div className="mb-4">
                                    <Label className="text-pcb">
                                        Load Premade {targetType} Targets
                                    </Label>
                                    <Select
                                        value={selectedSet[targetType]}
                                        onValueChange={(value) =>
                                            setSelectedSet((prev) => ({
                                                ...prev,
                                                [targetType]: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a set" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sets.map((set) => (
                                                <SelectItem
                                                    key={set.id}
                                                    value={set.id}
                                                >
                                                    {set.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <Label>From Day</Label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={dayRange[targetType].from}
                                            onChange={(e) =>
                                                setDayRange((prev) => ({
                                                    ...prev,
                                                    [targetType]: {
                                                        ...prev[targetType],
                                                        from: Math.max(
                                                            1,
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="border rounded p-2 w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label>To Day</Label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={dayRange[targetType].to}
                                            onChange={(e) =>
                                                setDayRange((prev) => ({
                                                    ...prev,
                                                    [targetType]: {
                                                        ...prev[targetType],
                                                        to: Math.max(
                                                            1,
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        ),
                                                    },
                                                }))
                                            }
                                            className="border rounded p-2 w-full"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleLoadSet(targetType)}
                                    className="w-full bg-pcb text-white hover:bg-pcb/90"
                                >
                                    Load {targetType} Set
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ),
            )}

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
};

export default TargetAssignment;
