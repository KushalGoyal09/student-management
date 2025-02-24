import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecoilValue } from "recoil";
import existingStudents from "@/recoil/existingStudents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, SortAsc, Users } from "lucide-react";

export default function ExistingStudents() {
    const students = useRecoilValue(existingStudents);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");

    const openWhatsApp = (whatsappLink: string) => {
        window.open(whatsappLink, "_blank");
    };

    const filteredAndSortedStudents = useMemo(() => {
        return students
            .filter((student) => {
                const searchLower = search.toLowerCase();
                return (
                    student.name.toLowerCase().includes(searchLower) ||
                    student.whattsapNumber.includes(search)
                );
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "name-asc":
                        return a.name.localeCompare(b.name);
                    case "name-desc":
                        return b.name.localeCompare(a.name);
                    case "status":
                        return Number(b.status) - Number(a.status);
                    case "newest":
                        return (
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        );
                    case "oldest":
                        return (
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                        );
                    default:
                        return 0;
                }
            });
    }, [students, search, sortBy]);

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                    <h1 className="text-2xl font-bold">Student List</h1>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">
                            {filteredAndSortedStudents.length} Students
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SortAsc className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name-desc">
                                Name (Z-A)
                            </SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredAndSortedStudents.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No students found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedStudents.map((student) => (
                        <Card
                            key={student.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                        >
                            <CardContent
                                className="p-4"
                                onClick={() =>
                                    navigate(`/profile/${student.id}`)
                                }
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h2 className="font-semibold text-lg">
                                            {student.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {student.class}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            student.status
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {student.status ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <strong>Platform:</strong>{" "}
                                        {student.platform}
                                    </div>
                                    <div>
                                        <strong>Dropper Status:</strong>{" "}
                                        {student.dropperStatus}
                                    </div>
                                    <div>
                                        <strong>Previous Score:</strong>{" "}
                                        {student.previousScore}
                                    </div>
                                    <div className="flex items-center cursor-pointer hover:text-primary">
                                        <span>{student.whattsapNumber}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {student.whattsapGroupLink && (
                                    <Button
                                        className="w-full bg-green-500 hover:bg-green-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openWhatsApp(
                                                student.whattsapGroupLink!,
                                            );
                                        }}
                                    >
                                        Open WhatsApp
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
