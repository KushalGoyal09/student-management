import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { SubjectTableProps } from "./types";

export const SubjectTable = ({
    targetType,
    subject,
    dates,
    selectedChapters,
    checkboxStates,
    handleChapterSelect,
    handleTargetChange,
    syllabus,
}: SubjectTableProps) => (
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
                                                placeholder={"Select chapter"}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {syllabus[subject].map(
                                                (chapter: any) => (
                                                    <SelectItem
                                                        key={chapter.id}
                                                        value={chapter.id.toString()}
                                                    >
                                                        {chapter.chapterName}
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
                            <tr key={date} className="border-b border-pcb/10">
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
                                                selectedChapters[targetType][
                                                    subject
                                                ][index] === 0
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
