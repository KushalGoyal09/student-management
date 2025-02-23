import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { OngoingChaptersBox } from "./OngoingChapter";
import { SubjectTable } from "./SubjectTable";

export const TargetSection = ({
    targetType,
    showState,
    setShowState,
    addDay,
    ongoingChapters,
    handleLecturesPerDayChange,
    handleMarkComplete,
    dates,
    selectedChapters,
    checkboxStates,
    handleChapterSelect,
    handleTargetChange,
    syllabus,
}: any) => (
    <Card className="mt-8 bg-white shadow-md">
        <CardHeader>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={`${targetType}-targets-checkbox`}
                    checked={showState}
                    onCheckedChange={(checked) =>
                        setShowState(checked as boolean)
                    }
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
        {showState && (
            <CardContent>
                <OngoingChaptersBox
                    targetType={targetType}
                    ongoingChapters={ongoingChapters}
                    handleLecturesPerDayChange={handleLecturesPerDayChange}
                    handleMarkComplete={handleMarkComplete}
                    syllabus={syllabus}
                />
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
                        <SubjectTable
                            targetType={targetType}
                            subject="physics"
                            dates={dates}
                            selectedChapters={selectedChapters}
                            checkboxStates={checkboxStates}
                            handleChapterSelect={handleChapterSelect}
                            handleTargetChange={handleTargetChange}
                            syllabus={syllabus}
                        />
                    </TabsContent>
                    <TabsContent value="chemistry">
                        <SubjectTable
                            targetType={targetType}
                            subject="chemistry"
                            dates={dates}
                            selectedChapters={selectedChapters}
                            checkboxStates={checkboxStates}
                            handleChapterSelect={handleChapterSelect}
                            handleTargetChange={handleTargetChange}
                            syllabus={syllabus}
                        />
                    </TabsContent>
                    <TabsContent value="biology">
                        <SubjectTable
                            targetType={targetType}
                            subject="biology"
                            dates={dates}
                            selectedChapters={selectedChapters}
                            checkboxStates={checkboxStates}
                            handleChapterSelect={handleChapterSelect}
                            handleTargetChange={handleTargetChange}
                            syllabus={syllabus}
                        />
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
