"use client";

import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import syllabusAtom from "@/recoil/syllabus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { getAllset, addSet, addTarget, getTargetInSet } from "./utils";
import type { CreateTarget, Target, TargetSet, SubjectTarget } from "./utils";
import { Loader2, Plus } from "lucide-react";

export default function PremadeTarget() {
    const syllabus = useRecoilValue(syllabusAtom);
    const [targetSets, setTargetSets] = useState<TargetSet[]>([]);
    const [selectedSet, setSelectedSet] = useState<string>("");
    const [fromDay, setFromDay] = useState<number>(1);
    const [toDay, setToDay] = useState<number>(100);
    const [targets, setTargets] = useState<Target[]>([]);
    const [loading, setLoading] = useState(false);
    const [newSetName, setNewSetName] = useState("");
    const [activeTab, setActiveTab] = useState("physics");
    const [isAddSetOpen, setIsAddSetOpen] = useState(false);

    const [newTarget, setNewTarget] = useState<CreateTarget>({
        setId: "",
        day: 1,
        physicsTarget: [],
        chemistryTarget: [],
        biologyTarget: [],
    });

    useEffect(() => {
        loadTargetSets();
    }, []);

    useEffect(() => {
        if (selectedSet && fromDay && toDay) {
            loadTargets();
        }
    }, [selectedSet, fromDay, toDay]);

    const loadTargetSets = async () => {
        try {
            const sets = await getAllset();
            setTargetSets(sets);
        } catch (error) {
            showError("Failed to load target sets");
        }
    };

    const loadTargets = async () => {
        if (!selectedSet) return;
        setLoading(true);
        try {
            const data = await getTargetInSet(selectedSet, fromDay, toDay);
            setTargets(data);
        } catch (error) {
            showError("Failed to load targets");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSet = async () => {
        if (!newSetName) {
            showError("Set name is required");
            return;
        }

        setLoading(true);
        try {
            const result = await addSet(newSetName);
            if (result?.id) {
                await loadTargetSets();
                setNewSetName("");
                setSelectedSet(result.id);
                setIsAddSetOpen(false);
                showSuccess("Target set created successfully");
            }
        } catch (error) {
            showError("Failed to create target set");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTarget = async () => {
        if (!newTarget.day || !selectedSet) {
            showError("Please fill all required fields");
            return;
        }

        const hasTargets =
            [
                ...newTarget.physicsTarget,
                ...newTarget.chemistryTarget,
                ...newTarget.biologyTarget,
            ].length > 0;

        if (!hasTargets) {
            showError("Please add at least one subject target");
            return;
        }

        try {
            const success = await addTarget({
                ...newTarget,
                setId: selectedSet,
            });

            if (success) {
                await loadTargets();
                setNewTarget({
                    setId: "",
                    day: 1,
                    physicsTarget: [],
                    chemistryTarget: [],
                    biologyTarget: [],
                });
                showSuccess("Target added successfully");
            }
        } catch (error) {
            showError("Failed to add target");
        }
    };

    const addSubjectTarget = (subject: keyof CreateTarget) => {
        const newSubjectTarget = {
            chapterId: 0,
            numberOfLecture: 1,
            isFinal: false,
        };

        setNewTarget((prev) => ({
            ...prev,
            //@ts-ignore
            [subject]: [...prev[subject], newSubjectTarget],
        }));
    };

    const updateSubjectTarget = (
        subject: keyof CreateTarget,
        index: number,
        field: keyof SubjectTarget,
        value: any,
    ) => {
        setNewTarget((prev) => {
            const updatedTargets = [...prev[subject]];
            updatedTargets[index] = {
                ...updatedTargets[index],
                [field]: value,
            };
            return { ...prev, [subject]: updatedTargets };
        });
    };

    const showError = (message: string) => {
        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });
    };

    const showSuccess = (message: string) => {
        toast({
            title: "Success",
            description: message,
        });
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="min-w-[200px]">
                        <Select
                            value={selectedSet}
                            onValueChange={setSelectedSet}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select target set" />
                            </SelectTrigger>
                            <SelectContent>
                                {targetSets.map((set) => (
                                    <SelectItem key={set.id} value={set.id}>
                                        {set.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isAddSetOpen} onOpenChange={setIsAddSetOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" /> New Set
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Target Set</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Set Name</Label>
                                    <Input
                                        value={newSetName}
                                        onChange={(e) =>
                                            setNewSetName(e.target.value)
                                        }
                                        placeholder="Enter set name"
                                    />
                                </div>
                                <Button
                                    onClick={handleAddSet}
                                    disabled={!newSetName || loading}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Create Set"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Day Range Selector */}
                <div className="flex gap-4 items-end">
                    <div className="space-y-2">
                        <Label className="text-sm">From Day</Label>
                        <Input
                            type="number"
                            min={1}
                            value={fromDay}
                            onChange={(e) =>
                                setFromDay(Math.max(1, Number(e.target.value)))
                            }
                            className="w-24"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm">To Day</Label>
                        <Input
                            type="number"
                            min={fromDay}
                            value={toDay}
                            onChange={(e) =>
                                setToDay(
                                    Math.max(fromDay, Number(e.target.value)),
                                )
                            }
                            className="w-24"
                        />
                    </div>
                </div>
            </div>

            {/* Add Target Dialog */}
            {selectedSet && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Target
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Target</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Day *</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={newTarget.day}
                                        onChange={(e) =>
                                            setNewTarget((prev) => ({
                                                ...prev,
                                                day: Math.max(
                                                    1,
                                                    Number(e.target.value),
                                                ),
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <Tabs defaultValue="physics">
                                <TabsList className="grid grid-cols-3">
                                    <TabsTrigger value="physics">
                                        Physics
                                    </TabsTrigger>
                                    <TabsTrigger value="chemistry">
                                        Chemistry
                                    </TabsTrigger>
                                    <TabsTrigger value="biology">
                                        Biology
                                    </TabsTrigger>
                                </TabsList>

                                {(
                                    ["physics", "chemistry", "biology"] as const
                                ).map((subject) => (
                                    <TabsContent key={subject} value={subject}>
                                        <div className="space-y-4">
                                            {newTarget[`${subject}Target`].map(
                                                (target, index) => (
                                                    <div
                                                        key={index}
                                                        className="space-y-3 p-4 border rounded-lg relative"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                setNewTarget(
                                                                    (prev) => {
                                                                        const updatedTargets =
                                                                            [
                                                                                ...prev[
                                                                                    `${subject}Target`
                                                                                ],
                                                                            ];
                                                                        updatedTargets.splice(
                                                                            index,
                                                                            1,
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            [`${subject}Target`]:
                                                                                updatedTargets,
                                                                        };
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="lucide lucide-trash-2"
                                                            >
                                                                <path d="M3 6h18"></path>
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                                <line
                                                                    x1="10"
                                                                    y1="11"
                                                                    x2="10"
                                                                    y2="17"
                                                                ></line>
                                                                <line
                                                                    x1="14"
                                                                    y1="11"
                                                                    x2="14"
                                                                    y2="17"
                                                                ></line>
                                                            </svg>
                                                        </Button>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Chapter *
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    target.chapterId?.toString() ||
                                                                    ""
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updateSubjectTarget(
                                                                        `${subject}Target`,
                                                                        index,
                                                                        "chapterId",
                                                                        Number(
                                                                            value,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select chapter" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {syllabus[
                                                                        subject
                                                                    ].map(
                                                                        (
                                                                            chapter,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    chapter.id
                                                                                }
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
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Number of
                                                                Lectures *
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={
                                                                    target.numberOfLecture
                                                                }
                                                                onChange={(e) =>
                                                                    updateSubjectTarget(
                                                                        `${subject}Target`,
                                                                        index,
                                                                        "numberOfLecture",
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${subject}-final-${index}`}
                                                                checked={
                                                                    target.isFinal
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    updateSubjectTarget(
                                                                        `${subject}Target`,
                                                                        index,
                                                                        "isFinal",
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={`${subject}-final-${index}`}
                                                            >
                                                                Final Chapter
                                                            </Label>
                                                        </div>
                                                    </div>
                                                ),
                                            )}

                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    addSubjectTarget(
                                                        `${subject}Target`,
                                                    )
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" />{" "}
                                                Add Chapter
                                            </Button>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>

                            <Button
                                onClick={handleAddTarget}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "Add Target"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Targets Table */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                    <TabsTrigger value="physics" className="flex-1">
                        Physics
                    </TabsTrigger>
                    <TabsTrigger value="chemistry" className="flex-1">
                        Chemistry
                    </TabsTrigger>
                    <TabsTrigger value="biology" className="flex-1">
                        Biology
                    </TabsTrigger>
                </TabsList>

                {(["physics", "chemistry", "biology"] as const).map(
                    (subject) => (
                        <TabsContent key={subject} value={subject}>
                            <div className="rounded-lg border shadow-sm overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted">
                                        <TableRow>
                                            <TableHead>Day</TableHead>
                                            <TableHead>Chapters</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {targets.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="text-center h-24"
                                                >
                                                    No targets found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            // Group targets by day
                                            Object.entries(
                                                targets.reduce(
                                                    (acc, target) => {
                                                        if (!acc[target.day]) {
                                                            acc[target.day] =
                                                                [];
                                                        }
                                                        acc[target.day].push(
                                                            target,
                                                        );
                                                        return acc;
                                                    },
                                                    {} as Record<
                                                        number,
                                                        Target[]
                                                    >,
                                                ),
                                            )
                                                .sort(
                                                    ([dayA], [dayB]) =>
                                                        Number(dayA) -
                                                        Number(dayB),
                                                )
                                                .map(
                                                    (
                                                        [day, dayTargets],
                                                        dayIndex,
                                                    ) => (
                                                        <TableRow
                                                            key={day}
                                                            className={
                                                                dayIndex % 2 ===
                                                                0
                                                                    ? "bg-gray-50 dark:bg-gray-800/50"
                                                                    : ""
                                                            }
                                                        >
                                                            <TableCell className="font-medium align-top">
                                                                {day}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-3">
                                                                    {dayTargets.flatMap(
                                                                        (
                                                                            target,
                                                                        ) =>
                                                                            target[
                                                                                subject
                                                                            ].map(
                                                                                (
                                                                                    subjectTarget,
                                                                                    index,
                                                                                ) => {
                                                                                    const chapter =
                                                                                        syllabus[
                                                                                            subject
                                                                                        ].find(
                                                                                            (
                                                                                                ch,
                                                                                            ) =>
                                                                                                ch.id ===
                                                                                                subjectTarget.chapterId,
                                                                                        );

                                                                                    return chapter ? (
                                                                                        <div
                                                                                            key={`${target.id}-${index}`}
                                                                                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                                                                                        >
                                                                                            <div>
                                                                                                <span className="font-medium">
                                                                                                    {
                                                                                                        chapter.chapterName
                                                                                                    }
                                                                                                </span>
                                                                                                <div className="text-sm text-muted-foreground">
                                                                                                    Lectures/day
                                                                                                    :{" "}
                                                                                                    {
                                                                                                        subjectTarget.numberOfLecture
                                                                                                    }
                                                                                                </div>
                                                                                            </div>
                                                                                            <div>
                                                                                                {!subjectTarget.isFinal ? (
                                                                                                    <span className="text-red-500">
                                                                                                        Incomplete
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-green-500">
                                                                                                        Complete
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : null;
                                                                                },
                                                                            ),
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    ),
                )}
            </Tabs>
        </div>
    );
}
