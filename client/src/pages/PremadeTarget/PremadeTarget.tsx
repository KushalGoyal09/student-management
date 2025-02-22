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
import type { CreateTarget, Target, TargetSet } from "./utils";

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
        physicsTarget: undefined,
        chemistryTarget: undefined,
        biologyTarget: undefined,
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
            toast({
                title: "Error",
                description: "Failed to load target sets",
                variant: "destructive",
            });
        }
    };

    const loadTargets = async () => {
        if (!selectedSet) return;
        setLoading(true);
        try {
            const data = await getTargetInSet(selectedSet, fromDay, toDay);
            setTargets(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load targets",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSet = async () => {
        if (!newSetName) return;
        setLoading(true);
        try {
            const result = await addSet(newSetName);
            if (result && result.id) {
                await loadTargetSets();
                setNewSetName("");
                setSelectedSet(result.id);
                setIsAddSetOpen(false);
                toast({
                    title: "Success",
                    description: "Target set created successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create target set",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddTarget = async (target: CreateTarget) => {
        try {
            const success = await addTarget(target);
            if (success) {
                await loadTargets();
                toast({
                    title: "Success",
                    description: "Target added successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add target",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <Select
                        value={selectedSet}
                        onValueChange={(value) => {
                            setSelectedSet(value);
                        }}
                    >
                        <SelectTrigger className="w-[200px]">
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

                    <Dialog open={isAddSetOpen} onOpenChange={setIsAddSetOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Add New Set</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Target Set</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="setName">Set Name</Label>
                                    <Input
                                        id="setName"
                                        value={newSetName}
                                        onChange={(e) =>
                                            setNewSetName(e.target.value)
                                        }
                                        placeholder="Enter set name"
                                    />
                                </div>
                                <Button
                                    onClick={handleAddSet}
                                    className="bg-pcb text-white hover:bg-pcb/90"
                                    disabled={!newSetName || loading}
                                >
                                    {loading ? "Creating..." : "Create Set"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {selectedSet && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="mt-4">Add New Target</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New Target</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Day</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={newTarget.day || ""}
                                                onChange={(e) =>
                                                    setNewTarget({
                                                        ...newTarget,
                                                        day: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Tabs defaultValue="physics">
                                        <TabsList>
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

                                        {[
                                            "physics",
                                            "chemistry",
                                            "biology",
                                        ].map((subject) => (
                                            <TabsContent
                                                key={subject}
                                                value={subject}
                                            >
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Chapter</Label>
                                                        <Select
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setNewTarget({
                                                                    ...newTarget,
                                                                    [`${subject}Target`]:
                                                                        {
                                                                            chapterId:
                                                                                Number(
                                                                                    value,
                                                                                ),
                                                                            numberOfLecture: 1,
                                                                            isFinal:
                                                                                false,
                                                                        },
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select chapter" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {syllabus[
                                                                    subject as keyof Syllabus
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
                                                            Number of Lectures
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            value={
                                                                newTarget[
                                                                    `${subject}Target` as keyof Pick<
                                                                        CreateTarget,
                                                                        | "physicsTarget"
                                                                        | "chemistryTarget"
                                                                        | "biologyTarget"
                                                                    >
                                                                ]
                                                                    ?.numberOfLecture ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setNewTarget({
                                                                    ...newTarget,
                                                                    [`${subject}Target`]:
                                                                        {
                                                                            ...newTarget[
                                                                                `${subject}Target` as keyof Pick<
                                                                                    CreateTarget,
                                                                                    | "physicsTarget"
                                                                                    | "chemistryTarget"
                                                                                    | "biologyTarget"
                                                                                >
                                                                            ],
                                                                            numberOfLecture:
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        },
                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${subject}-final`}
                                                            checked={
                                                                newTarget[
                                                                    `${subject}Target` as keyof Pick<
                                                                        CreateTarget,
                                                                        | "physicsTarget"
                                                                        | "chemistryTarget"
                                                                        | "biologyTarget"
                                                                    >
                                                                ]?.isFinal ||
                                                                false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setNewTarget({
                                                                    ...newTarget,
                                                                    [`${subject}Target`]:
                                                                        {
                                                                            ...newTarget[
                                                                                `${subject}Target` as keyof Pick<
                                                                                    CreateTarget,
                                                                                    | "physicsTarget"
                                                                                    | "chemistryTarget"
                                                                                    | "biologyTarget"
                                                                                >
                                                                            ],
                                                                            isFinal:
                                                                                checked as boolean,
                                                                        },
                                                                })
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`${subject}-final`}
                                                        >
                                                            Is Final
                                                        </Label>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>

                                    <Button
                                        onClick={() => {
                                            if (selectedSet) {
                                                handleAddTarget({
                                                    ...newTarget,
                                                    setId: selectedSet,
                                                });
                                            }
                                        }}
                                        className="bg-pcb text-white hover:bg-pcb/90"
                                    >
                                        Add Target
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="flex gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fromDay">From Day</Label>
                        <Input
                            id="fromDay"
                            type="number"
                            min={1}
                            value={fromDay || ""}
                            onChange={(e) => setFromDay(Number(e.target.value))}
                            className="w-24"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="toDay">To Day</Label>
                        <Input
                            id="toDay"
                            type="number"
                            value={toDay || ""}
                            onChange={(e) => setToDay(Number(e.target.value))}
                            className="w-24"
                        />
                    </div>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="physics">Physics</TabsTrigger>
                    <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                    <TabsTrigger value="biology">Biology</TabsTrigger>
                </TabsList>

                {["physics", "chemistry", "biology"].map((subject) => (
                    <TabsContent key={subject} value={subject}>
                        <div className="rounded-md border border-pcb/20">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Chapter</TableHead>
                                        <TableHead>Lectures</TableHead>
                                        <TableHead>Final</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {targets.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-4"
                                            >
                                                No targets found for selected
                                                days
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        targets.map((target, index) => {
                                            const subjectTarget =
                                                target[
                                                    subject as keyof Pick<
                                                        Target,
                                                        | "physics"
                                                        | "chemistry"
                                                        | "biology"
                                                    >
                                                ];
                                            const chapter = subjectTarget
                                                ? syllabus[
                                                      subject as keyof Syllabus
                                                  ].find(
                                                      (ch) =>
                                                          ch.id ===
                                                          subjectTarget.chapterId,
                                                  )
                                                : null;

                                            return (
                                                <TableRow
                                                    key={target.id}
                                                    className={
                                                        index % 2 === 0
                                                            ? "bg-pcb/5"
                                                            : ""
                                                    }
                                                >
                                                    <TableCell>
                                                        {target.day}
                                                    </TableCell>
                                                    <TableCell>
                                                        {chapter?.chapterName ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subjectTarget?.numberOfLecture ||
                                                            0}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subjectTarget?.isFinal
                                                            ? "Yes"
                                                            : "No"}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
