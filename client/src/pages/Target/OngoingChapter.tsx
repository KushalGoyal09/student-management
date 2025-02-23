import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OngoingChaptersBoxProps, Subject } from "./types";

export const OngoingChaptersBox = ({
    targetType,
    ongoingChapters,
    handleLecturesPerDayChange,
    handleMarkComplete,
    syllabus,
}: OngoingChaptersBoxProps) => (
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
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {["physics", "chemistry", "biology"].map((subject) => (
                    <TabsContent key={subject} value={subject}>
                        {ongoingChapters[targetType][subject].map(
                            (chapter: any) => (
                                <div
                                    key={chapter.chapterId}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b last:border-b-0"
                                >
                                    <span className="font-medium mb-2 sm:mb-0">
                                        {
                                            syllabus[subject as Subject].find(
                                                (c: any) =>
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
                            ),
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </CardContent>
    </Card>
);
