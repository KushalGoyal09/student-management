import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Payment {
    amount: number;
    date: Date;
    mode: string | null;
    transactionId: string | null;
    cleared: boolean;
}

type MentorshipPlan = "Elite" | "Pro" | "Max";

interface StudentFees {
    feesPlan: number;
    allClear: boolean;
    mentorshipPlan: MentorshipPlan;
    payments: Payment[];
}

interface Student {
    totalAmountPaid: number;
    totalAmountDue: number;
    id: string;
    name: string;
    whattsapNumber: string;
    createdAt: Date;
    Fees: StudentFees | null;
}

export default function FeeDetails() {
    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
        new Set(),
    );
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [feePlanFilter, setFeePlanFilter] = useState("all");
    const [allClearFilter, setAllClearFilter] = useState("all");
    const [mentorshipPlanFilter, setMentorshipPlanFilter] = useState("all");
    const [totalAmountDue, setTotalAmountDue] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/new/fee-data`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setStudents(data.data);
                setTotalAmountDue(data.totalAmountDue);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load students. Please try again.",
                    variant: "destructive",
                });
            }
        };
        fetchStudents();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedStudents((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    const formatPlan = (fees: StudentFees | null) => {
        if (!fees) {
            return "Not Set";
        } else {
            return fees.feesPlan === 0 ? "Not Set" : `${fees.feesPlan} Time`;
        }
    };

    const getFeePlanColor = (feesPlan: number | undefined) => {
        switch (feesPlan) {
            case 1:
                return "text-green-500";
            case 2:
                return "text-blue-500";
            case 3:
                return "text-purple-500";
            default:
                return "text-gray-500";
        }
    };

    const getMentorshipPlanColor = (
        mentorshipPlan: MentorshipPlan | undefined,
    ) => {
        switch (mentorshipPlan) {
            case "Elite":
                return "text-yellow-500";
            case "Pro":
                return "text-blue-500";
            case "Max":
                return "text-purple-500";
            default:
                return "text-gray-500";
        }
    };

    const filteredStudents = students.filter((student) => {
        const nameMatch = student.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const numberMatch = student.whattsapNumber.includes(searchTerm);
        let transactionIdMatch = false;
        if (student.Fees) {
            student.Fees.payments.forEach((payment) => {
                if (payment.transactionId) {
                    transactionIdMatch =
                        transactionIdMatch ||
                        payment.transactionId.includes(searchTerm);
                }
            });
        }
        const feePlanMatch =
            feePlanFilter === "all" ||
            (feePlanFilter === "not-set" && !student.Fees) ||
            (student.Fees &&
                student.Fees.feesPlan.toString() === feePlanFilter);
        const allClearMatch =
            allClearFilter === "all" ||
            (allClearFilter === "true" && student.Fees?.allClear) ||
            (allClearFilter === "false" &&
                (!student.Fees || !student.Fees.allClear));
        const mentorshipPlanMatch =
            mentorshipPlanFilter === "all" ||
            (student.Fees &&
                student.Fees.mentorshipPlan === mentorshipPlanFilter);
        return (
            (nameMatch || numberMatch || transactionIdMatch) &&
            feePlanMatch &&
            allClearMatch &&
            mentorshipPlanMatch
        );
    });

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Student Fee Details
            </h1>
            <div className="mb-4 text-center text-lg font-semibold">
                Total Amount Due: {formatCurrency(totalAmountDue)}
            </div>
            <div className="space-y-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Select
                        value={feePlanFilter}
                        onValueChange={setFeePlanFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Fee Plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Fee Plans</SelectItem>
                            <SelectItem value="not-set">Not Set</SelectItem>
                            <SelectItem value="1">1 Time</SelectItem>
                            <SelectItem value="2">2 Times</SelectItem>
                            <SelectItem value="3">3 Times</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={allClearFilter}
                        onValueChange={setAllClearFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="true">Cleared</SelectItem>
                            <SelectItem value="false">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={mentorshipPlanFilter}
                        onValueChange={setMentorshipPlanFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Mentorship" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="Elite">Elite</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                            <SelectItem value="Max">Max</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-4">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="overflow-hidden">
                        <CardHeader
                            className="pb-2"
                            onClick={() => navigate(`/profile/${student.id}`)}
                        >
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>{student.name}</span>
                                <Badge
                                    variant={
                                        student.Fees?.allClear
                                            ? "default"
                                            : "destructive"
                                    }
                                >
                                    {student.Fees?.allClear
                                        ? "Cleared"
                                        : "Pending"}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-sm space-y-1"
                                onClick={() =>
                                    navigate(`/profile/${student.id}`)
                                }
                            >
                                <p>
                                    Total Paid:{" "}
                                    {formatCurrency(student.totalAmountPaid)}
                                </p>
                                <p>
                                    Total UnPaid Amount:{" "}
                                    {formatCurrency(student.totalAmountDue)}
                                </p>
                                <p>
                                    Created At: {formatDate(student.createdAt)}
                                </p>
                                <p>Whattsap Number: {student.whattsapNumber}</p>
                                <p
                                    className={getFeePlanColor(
                                        student.Fees?.feesPlan,
                                    )}
                                >
                                    Fee Plan: {formatPlan(student.Fees)}
                                </p>
                                <p
                                    className={getMentorshipPlanColor(
                                        student.Fees?.mentorshipPlan,
                                    )}
                                >
                                    Mentorship Plan:{" "}
                                    {student.Fees?.mentorshipPlan || "Not Set"}
                                </p>
                            </div>
                            {student.Fees &&
                                student.Fees.payments.length > 0 && (
                                    <div className="mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-between"
                                            onClick={() =>
                                                toggleExpand(student.id)
                                            }
                                        >
                                            Payment History
                                            {expandedStudents.has(
                                                student.id,
                                            ) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                        {expandedStudents.has(student.id) && (
                                            <div className="mt-2 space-y-2">
                                                {student.Fees.payments.map(
                                                    (payment, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-sm border-t pt-2"
                                                        >
                                                            <p>
                                                                Amount:{" "}
                                                                {formatCurrency(
                                                                    payment.amount,
                                                                )}
                                                            </p>
                                                            <p>
                                                                Date:{" "}
                                                                {formatDate(
                                                                    payment.date,
                                                                )}
                                                            </p>
                                                            <p>
                                                                Mode:{" "}
                                                                {payment.mode ||
                                                                    "N/A"}
                                                            </p>
                                                            <p>
                                                                Transaction ID:{" "}
                                                                {payment.transactionId ||
                                                                    "N/A"}
                                                            </p>
                                                            <p
                                                                className={
                                                                    payment.cleared
                                                                        ? "text-green-500"
                                                                        : "text-red-500"
                                                                }
                                                            >
                                                                Cleared:{" "}
                                                                {payment.cleared
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
