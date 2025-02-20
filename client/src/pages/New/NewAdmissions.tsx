"use client";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecoilValue } from "recoil";
import newStudents from "@/recoil/newStudents";
import { StudentCard } from "@/components/NewStudentCard";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Student {
    id: string;
    name: string;
    whattsapNumber: string;
    callNumber: string;
    target: string;
    StudyHours: string;
    class: string;
    dropperStatus: string;
    previousScore: string;
    platform: string;
    createdAt: Date;
    status: boolean;
}

interface FilterOptions {
    dropperStatus: string[];
    platform: string[];
    class: string[];
    target: string[];
}

export default function NewAdmissions() {
    const students: Student[] = useRecoilValue(newStudents);
    const router = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        dropperStatus: "",
        platform: "",
        status: "",
        class: "",
        studyHoursRange: [0, 24],
        target: "",
    });
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        dropperStatus: [],
        platform: [],
        class: [],
        target: [],
    });

    useEffect(() => {
        const options: FilterOptions = {
            dropperStatus: Array.from(
                new Set(students.map((s) => s.dropperStatus)),
            ),
            platform: Array.from(new Set(students.map((s) => s.platform))),
            class: Array.from(new Set(students.map((s) => s.class))),
            target: Array.from(new Set(students.map((s) => s.target))),
        };
        setFilterOptions(options);
    }, [students]);

    const filteredAndSortedStudents = useMemo(() => {
        return students
            .filter((student) => {
                const searchMatch =
                    student.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    student.whattsapNumber.includes(searchTerm) ||
                    student.callNumber.includes(searchTerm);

                const filterMatch =
                    (!filters.dropperStatus ||
                        student.dropperStatus === filters.dropperStatus) &&
                    (!filters.platform ||
                        student.platform === filters.platform) &&
                    (!filters.status ||
                        student.status === (filters.status === "active")) &&
                    (!filters.class || student.class === filters.class) &&
                    (!filters.target || student.target === filters.target) &&
                    Number.parseInt(student.StudyHours) >=
                        filters.studyHoursRange[0] &&
                    Number.parseInt(student.StudyHours) <=
                        filters.studyHoursRange[1];

                return searchMatch && filterMatch;
            })
            .sort((a, b) => {
                if (sortBy === "name") {
                    return sortOrder === "asc"
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                } else if (sortBy === "createdAt") {
                    return sortOrder === "asc"
                        ? new Date(a.createdAt).getTime() -
                              new Date(b.createdAt).getTime()
                        : new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime();
                }
                return 0;
            });
    }, [students, searchTerm, filters, sortBy, sortOrder]);

    const resetFilters = () => {
        setFilters({
            dropperStatus: "",
            platform: "",
            status: "",
            class: "",
            studyHoursRange: [0, 24],
            target: "",
        });
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                New Admissions
            </h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                    <Input
                        type="text"
                        placeholder="Search by name or phone number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />{" "}
                            Filters
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                    Filters
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Adjust the following filters to refine your
                                    search.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dropperStatus">
                                    Dropper Status
                                </Label>
                                <Select
                                    value={filters.dropperStatus}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            dropperStatus: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="dropperStatus">
                                        <SelectValue placeholder="Select Dropper Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {filterOptions.dropperStatus.map(
                                            (status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="platform">Platform</Label>
                                <Select
                                    value={filters.platform}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            platform: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="platform">
                                        <SelectValue placeholder="Select Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {filterOptions.platform.map(
                                            (platform) => (
                                                <SelectItem
                                                    key={platform}
                                                    value={platform}
                                                >
                                                    {platform}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="class">Class</Label>
                                <Select
                                    value={filters.class}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, class: value })
                                    }
                                >
                                    <SelectTrigger id="class">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {filterOptions.class.map(
                                            (classOption) => (
                                                <SelectItem
                                                    key={classOption}
                                                    value={classOption}
                                                >
                                                    {classOption}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="target">Target</Label>
                                <Select
                                    value={filters.target}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            target: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="target">
                                        <SelectValue placeholder="Select Target" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {filterOptions.target.map((target) => (
                                            <SelectItem
                                                key={target}
                                                value={target}
                                            >
                                                {target}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Study Hours Range</Label>
                                <Slider
                                    min={0}
                                    max={24}
                                    step={1}
                                    value={filters.studyHoursRange}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            studyHoursRange: value,
                                        })
                                    }
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>
                                        {filters.studyHoursRange[0]} hours
                                    </span>
                                    <span>
                                        {filters.studyHoursRange[1]} hours
                                    </span>
                                </div>
                            </div>
                            <Button onClick={resetFilters} variant="outline">
                                Reset Filters
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                        const [newSortBy, newSortOrder] = value.split("-");
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt-desc">
                            Latest First
                        </SelectItem>
                        <SelectItem value="createdAt-asc">
                            Oldest First
                        </SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedStudents.map((student) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onClick={() => router(`/profile/${student.id}`)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
