import { useState, useEffect } from "react";
import axios from "axios";
import {
    ChevronDown,
    ChevronUp,
    Filter,
    BookOpen,
    Users,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubjectOverallSyllabus {
    chapterId: number;
    chapterName: string;
    seniorMentor: SeniorMentorCompletion[];
}

interface SeniorMentorCompletion {
    seniorMentorUsername: string;
    seniorMentorId: string;
    seniorMentorName: string;
    totalNumberOfStudents: number;
    totalNumberOfStudentsWhoHaveCompletedTheChapter: number;
    groupMentor: GroupMentorCompletion[];
}

interface Student {
    name: string;
}

interface GroupMentorCompletion {
    groupMentorUsername: string;
    groupMentorId: string;
    groupMentorName: string;
    totalNumberOfStudents: number;
    totalNumberOfStudentsWhoHaveCompletedTheChapter: number;
    students: Student[];
}

interface OverallSyllabusResponse {
    physics: SubjectOverallSyllabus[];
    chemistry: SubjectOverallSyllabus[];
    biology: SubjectOverallSyllabus[];
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const fetchOverallSyllabus = async (): Promise<OverallSyllabusResponse> => {
    const { data } = await axios.get(`${backendUrl}/overall`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return data.data;
};

export default function Component() {
    const [activeTab, setActiveTab] = useState<
        "physics" | "chemistry" | "biology"
    >("physics");
    const [syllabusData, setSyllabusData] =
        useState<OverallSyllabusResponse | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<{
        [key: string]: number[];
    }>({
        physics: [],
        chemistry: [],
        biology: [],
    });
    const [expandedSeniorMentors, setExpandedSeniorMentors] = useState<{
        [key: string]: string[];
    }>({
        physics: [],
        chemistry: [],
        biology: [],
    });
    const [expandedGroupMentors, setExpandedGroupMentors] = useState<{
        [key: string]: string[];
    }>({
        physics: [],
        chemistry: [],
        biology: [],
    });
    const [showFilter, setShowFilter] = useState(false);
    const [filter, setFilter] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        fetchOverallSyllabus().then(setSyllabusData);
    }, []);

    const toggleChapter = (chapterId: number) => {
        setExpandedChapters((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].includes(chapterId)
                ? prev[activeTab].filter((id) => id !== chapterId)
                : [...prev[activeTab], chapterId],
        }));
    };

    const toggleSeniorMentor = (seniorMentorId: string) => {
        setExpandedSeniorMentors((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].includes(seniorMentorId)
                ? prev[activeTab].filter((id) => id !== seniorMentorId)
                : [...prev[activeTab], seniorMentorId],
        }));
    };

    const toggleGroupMentor = (groupMentorId: string) => {
        setExpandedGroupMentors((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].includes(groupMentorId)
                ? prev[activeTab].filter((id) => id !== groupMentorId)
                : [...prev[activeTab], groupMentorId],
        }));
    };

    const toggleFilter = () => setShowFilter(!showFilter);

    const updateFilter = (seniorMentorId: string, groupMentorId: string) => {
        setFilter((prev) => {
            const newFilter = { ...prev };
            if (groupMentorId) {
                if (newFilter[seniorMentorId]?.includes(groupMentorId)) {
                    newFilter[seniorMentorId] = newFilter[
                        seniorMentorId
                    ].filter((id) => id !== groupMentorId);
                } else {
                    newFilter[seniorMentorId] = [
                        ...(newFilter[seniorMentorId] || []),
                        groupMentorId,
                    ];
                }
            } else {
                if (newFilter[seniorMentorId]) {
                    delete newFilter[seniorMentorId];
                } else {
                    const allGroupMentorIds =
                        syllabusData?.[activeTab][0].seniorMentor
                            .find((sm) => sm.seniorMentorId === seniorMentorId)
                            ?.groupMentor.map((gm) => gm.groupMentorId) || [];
                    newFilter[seniorMentorId] = allGroupMentorIds;
                }
            }
            return newFilter;
        });
    };

    const filterMentorsAndCalculateCounts = (
        mentors: SeniorMentorCompletion[],
    ) => {
        return mentors.reduce(
            (acc, senior) => {
                if (
                    Object.keys(filter).length > 0 &&
                    !filter[senior.seniorMentorId]
                )
                    return acc;

                const filteredGroupMentors = senior.groupMentor.filter(
                    (group) =>
                        !filter[senior.seniorMentorId] ||
                        filter[senior.seniorMentorId].includes(
                            group.groupMentorId,
                        ),
                );

                const totalStudents = filteredGroupMentors.reduce(
                    (sum, group) => sum + group.totalNumberOfStudents,
                    0,
                );
                const completedStudents = filteredGroupMentors.reduce(
                    (sum, group) =>
                        sum +
                        group.totalNumberOfStudentsWhoHaveCompletedTheChapter,
                    0,
                );

                acc.mentors.push({
                    ...senior,
                    groupMentor: filteredGroupMentors,
                    totalNumberOfStudents: totalStudents,
                    totalNumberOfStudentsWhoHaveCompletedTheChapter:
                        completedStudents,
                });

                acc.totalStudents += totalStudents;
                acc.completedStudents += completedStudents;

                return acc;
            },
            { mentors: [], totalStudents: 0, completedStudents: 0 } as {
                mentors: SeniorMentorCompletion[];
                totalStudents: number;
                completedStudents: number;
            },
        );
    };

    if (!syllabusData)
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pcb"></div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-pcb/10 to-pcb/5 p-2 sm:p-4 md:p-8">
            <Card className="max-w-full mx-auto shadow-lg overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-pcb">
                        Overall Batch Syllabus
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFilter}
                        className="hover:bg-pcb hover:text-white transition-colors"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                    {showFilter && (
                        <Card className="mb-4 bg-pcb/5 border-pcb/20">
                            <CardContent className="pt-4">
                                <h3 className="font-bold mb-2 text-pcb text-sm">
                                    Filter Mentors
                                </h3>
                                <ScrollArea className="h-[200px] pr-4">
                                    {syllabusData[
                                        activeTab
                                    ][0].seniorMentor.map((senior) => (
                                        <div
                                            key={senior.seniorMentorId}
                                            className="mb-3"
                                        >
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox text-pcb rounded"
                                                    checked={
                                                        !!filter[
                                                            senior
                                                                .seniorMentorId
                                                        ]
                                                    }
                                                    onChange={() =>
                                                        updateFilter(
                                                            senior.seniorMentorId,
                                                            "",
                                                        )
                                                    }
                                                />
                                                <span className="text-sm font-medium">
                                                    {senior.seniorMentorName}
                                                </span>
                                            </label>
                                            <div className="ml-6 mt-1 space-y-1">
                                                {senior.groupMentor.map(
                                                    (group) => (
                                                        <label
                                                            key={
                                                                group.groupMentorId
                                                            }
                                                            className="flex items-center space-x-2 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox text-pcb rounded"
                                                                checked={filter[
                                                                    senior
                                                                        .seniorMentorId
                                                                ]?.includes(
                                                                    group.groupMentorId,
                                                                )}
                                                                onChange={() =>
                                                                    updateFilter(
                                                                        senior.seniorMentorId,
                                                                        group.groupMentorId,
                                                                    )
                                                                }
                                                            />
                                                            <span className="text-xs">
                                                                {
                                                                    group.groupMentorName
                                                                }
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as typeof activeTab)
                        }
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-4">
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
                            (tab) => (
                                <TabsContent key={tab} value={tab}>
                                    <ScrollArea className="h-[calc(100vh-300px)] pr-2 sm:pr-4">
                                        <div className="space-y-3">
                                            {syllabusData[tab].map(
                                                (chapter) => {
                                                    const {
                                                        mentors,
                                                        totalStudents,
                                                        completedStudents,
                                                    } =
                                                        filterMentorsAndCalculateCounts(
                                                            chapter.seniorMentor,
                                                        );
                                                    return (
                                                        <Card
                                                            key={
                                                                chapter.chapterId
                                                            }
                                                            className="border-pcb/20"
                                                        >
                                                            <CardHeader className="py-2 bg-pcb/5">
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full text-left"
                                                                    onClick={() =>
                                                                        toggleChapter(
                                                                            chapter.chapterId,
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                                                                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                                                            <BookOpen className="h-4 w-4 flex-shrink-0 text-pcb" />
                                                                            <span className="font-semibold text-pcb text-sm break-words">
                                                                                {
                                                                                    chapter.chapterName
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2 sm:ml-auto">
                                                                            <div className="text-xs text-pcb whitespace-nowrap">
                                                                                {
                                                                                    completedStudents
                                                                                }

                                                                                /
                                                                                {
                                                                                    totalStudents
                                                                                }
                                                                            </div>
                                                                            {expandedChapters[
                                                                                activeTab
                                                                            ].includes(
                                                                                chapter.chapterId,
                                                                            ) ? (
                                                                                <ChevronUp className="h-4 w-4 text-pcb" />
                                                                            ) : (
                                                                                <ChevronDown className="h-4 w-4 text-pcb" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Button>
                                                            </CardHeader>

                                                            {expandedChapters[
                                                                activeTab
                                                            ].includes(
                                                                chapter.chapterId,
                                                            ) && (
                                                                <CardContent className="pt-2 px-2">
                                                                    <div className="space-y-4">
                                                                        {mentors.map(
                                                                            (
                                                                                senior,
                                                                            ) => (
                                                                                <Card
                                                                                    key={
                                                                                        senior.seniorMentorId
                                                                                    }
                                                                                    className="border-pink-700/20 overflow-hidden"
                                                                                >
                                                                                    <CardHeader className="py-2 bg-pink-700/10">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            className="w-full text-left"
                                                                                            onClick={() =>
                                                                                                toggleSeniorMentor(
                                                                                                    senior.seniorMentorId,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                                                                                                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                                                                                    <Users className="h-4 w-4 flex-shrink-0 text-pink-700" />
                                                                                                    <span className="font-medium text-pink-700 text-sm break-words">
                                                                                                        {
                                                                                                            senior.seniorMentorName
                                                                                                        }
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex items-center space-x-2 sm:ml-auto">
                                                                                                    <span className="text-xs text-pink-700 whitespace-nowrap">
                                                                                                        {
                                                                                                            senior.totalNumberOfStudentsWhoHaveCompletedTheChapter
                                                                                                        }

                                                                                                        /
                                                                                                        {
                                                                                                            senior.totalNumberOfStudents
                                                                                                        }
                                                                                                    </span>
                                                                                                    {expandedSeniorMentors[
                                                                                                        activeTab
                                                                                                    ].includes(
                                                                                                        senior.seniorMentorId,
                                                                                                    ) ? (
                                                                                                        <ChevronUp className="h-4 w-4 text-pink-700" />
                                                                                                    ) : (
                                                                                                        <ChevronDown className="h-4 w-4 text-pink-700" />
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </Button>
                                                                                    </CardHeader>

                                                                                    {expandedSeniorMentors[
                                                                                        activeTab
                                                                                    ].includes(
                                                                                        senior.seniorMentorId,
                                                                                    ) && (
                                                                                        <CardContent className="pt-2 px-2 bg-pink-700/5">
                                                                                            <div className="space-y-2">
                                                                                                {senior.groupMentor.map(
                                                                                                    (
                                                                                                        group,
                                                                                                    ) => (
                                                                                                        <Card
                                                                                                            key={
                                                                                                                group.groupMentorId
                                                                                                            }
                                                                                                            className="border-purple-600/20"
                                                                                                        >
                                                                                                            <CardHeader className="py-1 bg-purple-600/10">
                                                                                                                <Button
                                                                                                                    variant="ghost"
                                                                                                                    className="w-full text-left"
                                                                                                                    onClick={() =>
                                                                                                                        toggleGroupMentor(
                                                                                                                            group.groupMentorId,
                                                                                                                        )
                                                                                                                    }
                                                                                                                >
                                                                                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                                                                                                                        <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                                                                                                                            <User className="h-3 w-3 flex-shrink-0 text-purple-600" />
                                                                                                                            <span className="text-purple-600 text-xs break-words">
                                                                                                                                {
                                                                                                                                    group.groupMentorName
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center space-x-2 sm:ml-auto">
                                                                                                                            <span className="text-xs text-purple-600 whitespace-nowrap">
                                                                                                                                {
                                                                                                                                    group.totalNumberOfStudentsWhoHaveCompletedTheChapter
                                                                                                                                }

                                                                                                                                /
                                                                                                                                {
                                                                                                                                    group.totalNumberOfStudents
                                                                                                                                }
                                                                                                                            </span>
                                                                                                                            {expandedGroupMentors[
                                                                                                                                activeTab
                                                                                                                            ].includes(
                                                                                                                                group.groupMentorId,
                                                                                                                            ) ? (
                                                                                                                                <ChevronUp className="h-3 w-3 text-purple-600" />
                                                                                                                            ) : (
                                                                                                                                <ChevronDown className="h-3 w-3 text-purple-600" />
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </Button>
                                                                                                            </CardHeader>

                                                                                                            {expandedGroupMentors[
                                                                                                                activeTab
                                                                                                            ].includes(
                                                                                                                group.groupMentorId,
                                                                                                            ) && (
                                                                                                                <CardContent className="pt-2 px-2 bg-purple-600/5">
                                                                                                                    <ul className="space-y-1">
                                                                                                                        {group.students.map(
                                                                                                                            (
                                                                                                                                student,
                                                                                                                            ) => (
                                                                                                                                <li
                                                                                                                                    key={
                                                                                                                                        student.name
                                                                                                                                    }
                                                                                                                                    className="px-2 py-1 bg-purple-600/10 rounded-md text-xs flex items-center space-x-1 overflow-hidden"
                                                                                                                                >
                                                                                                                                    <User className="h-3 w-3 flex-shrink-0 text-purple-600" />
                                                                                                                                    <span className="text-purple-600 truncate">
                                                                                                                                        {
                                                                                                                                            student.name
                                                                                                                                        }
                                                                                                                                    </span>
                                                                                                                                </li>
                                                                                                                            ),
                                                                                                                        )}
                                                                                                                    </ul>
                                                                                                                </CardContent>
                                                                                                            )}
                                                                                                        </Card>
                                                                                                    ),
                                                                                                )}
                                                                                            </div>
                                                                                        </CardContent>
                                                                                    )}
                                                                                </Card>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            )}
                                                        </Card>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            ),
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
