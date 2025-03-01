import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    months,
    Month,
    Role,
    GroupMentor,
    SeniorMentor,
    Employee,
    Salary,
    CommonSalary,
    getAllGm,
    getAllSm,
    getAllemployes,
    getCommonSalaryDetails,
    getSalaryDetails,
    editSalary,
    setCommonSalaryDetails,
} from "./salaryUtils";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function SalaryManagement() {
    const [selectedMonth, setSelectedMonth] = useState<Month>(
        months[new Date().getMonth()] as Month,
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState<Role>("GroupMentor");
    const [mentors, setMentors] = useState<{
        GroupMentor: GroupMentor[];
        SeniorMentor: GroupMentor[];
        Employee: Employee[];
    }>({
        GroupMentor: [],
        SeniorMentor: [],
        Employee: [],
    });
    const [salaries, setSalaries] = useState<{
        GroupMentor: Salary[];
        SeniorMentor: Salary[];
        Employee: Salary[];
    }>({
        GroupMentor: [],
        SeniorMentor: [],
        Employee: [],
    });
    const [commonSalary, setCommonSalary] = useState<CommonSalary | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setSuccess(false);
        fetchData();
    }, [selectedMonth, selectedYear, activeTab]);

    const fetchData = async () => {
        const [gm, sm, emp] = await Promise.all([
            getAllGm(),
            getAllSm(),
            getAllemployes(),
        ]);
        setMentors({
            GroupMentor: gm,
            SeniorMentor: sm,
            Employee: emp,
        });

        const [gmSalaries, smSalaries, empSalaries] = await Promise.all([
            getSalaryDetails(selectedMonth, selectedYear, "GroupMentor"),
            getSalaryDetails(selectedMonth, selectedYear, "SeniorMentor"),
            getSalaryDetails(selectedMonth, selectedYear, "Employee"),
        ]);
        setSalaries({
            GroupMentor: gmSalaries,
            SeniorMentor: smSalaries,
            Employee: empSalaries,
        });

        const fetchedCommonSalary = await getCommonSalaryDetails(activeTab);
        setCommonSalary(
            fetchedCommonSalary || {
                baseSalary: 0,
                perAj: 0,
                payAccordingToRating: false,
                perAjLess: 0,
                perAjMore: 0,
            },
        );
    };

    const handleEditSalary = async (
        userId: string,
        totalSalary: number,
        bonus: number,
        paid: boolean,
    ) => {
        const newsalary = await editSalary(
            selectedMonth,
            selectedYear,
            userId,
            totalSalary,
            bonus,
            paid,
            activeTab,
        );
        const updatedSalaries = salaries[activeTab].map((salary) =>
            salary.userId === userId ? newsalary : salary,
        );
        setSalaries({ ...salaries, [activeTab]: updatedSalaries });
        setEditingId(null);
    };

    const handleEditCommonSalary = async () => {
        setIsLoading(true);
        setSuccess(false);
        if (commonSalary) {
            await setCommonSalaryDetails(
                activeTab,
                commonSalary.perAj,
                commonSalary.perAjLess,
                commonSalary.perAjMore,
                commonSalary.payAccordingToRating,
                commonSalary.baseSalary,
            );
            await updateAllSalaries();
        }
        setIsLoading(false);
        setSuccess(true);
        toast({
            title: "Common Salary Updated",
            description: "Common salary settings updated successfully",
        });
    };

    const updateAllSalaries = async () => {
        const promises = mentors[activeTab].map((mentor) => {
            const salary = {
                userId: mentor.id,
                totalSalary:
                    activeTab !== "Employee" && commonSalary
                        ? calculateTotalSalary(
                              mentor as GroupMentor | SeniorMentor,
                              commonSalary,
                          )
                        : 0,
                bonus: 0,
                paid: false,
            };
            return editSalary(
                selectedMonth,
                selectedYear,
                mentor.id,
                salary.totalSalary,
                salary.bonus,
                salary.paid,
                activeTab,
            );
        });
        await Promise.all(promises);
        fetchData();
    };

    const calculateTotalSalary = (
        mentor: GroupMentor | SeniorMentor,
        commonSalary: CommonSalary,
    ) => {
        if (commonSalary.payAccordingToRating) {
            return mentor.overallRating >= 4.5
                ? commonSalary.perAjMore * mentor.studentCount +
                      commonSalary.baseSalary
                : commonSalary.perAjLess * mentor.studentCount +
                      commonSalary.baseSalary;
        } else {
            return (
                commonSalary.perAj * mentor.studentCount +
                commonSalary.baseSalary
            );
        }
    };

    const totalPaid = Object.values(salaries)
        .flat()
        .filter((salary) => salary.paid)
        .reduce((sum, salary) => sum + salary.totalSalary + salary.bonus, 0);

    const totalToPay = Object.values(salaries)
        .flat()
        .filter((salary) => !salary.paid)
        .reduce((sum, salary) => sum + salary.totalSalary + salary.bonus, 0);

    const handleSalaryChange = (
        userId: string,
        field: "totalSalary" | "bonus",
        value: number,
    ) => {
        const updatedSalaries = salaries[activeTab].map((salary) =>
            salary.userId === userId ? { ...salary, [field]: value } : salary,
        );
        setSalaries({ ...salaries, [activeTab]: updatedSalaries });
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-pcb">
                Salary Management
            </h1>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <Select
                    value={selectedMonth}
                    onValueChange={(value: Month) => setSelectedMonth(value)}
                >
                    <SelectTrigger className="w-full sm:w-[180px] bg-white border-pcb">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem key={month} value={month}>
                                {month}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full sm:w-[120px] bg-white border-pcb"
                />
            </div>
            <div className="bg-pcb text-white p-6 text-xl rounded-sm m-2">
                <p className="mb-2">
                    Total To Pay:{" "}
                    <span className="text-red-500">
                        {" "}
                        {totalToPay.toFixed(2)}
                    </span>
                </p>
                <p>
                    Total Paid:{" "}
                    <span className="text-green-600">
                        {" "}
                        {totalPaid.toFixed(2)}
                    </span>
                </p>
            </div>
            <Tabs
                value={activeTab}
                //@ts-ignore
                onValueChange={(value: Role) => setActiveTab(value)}
                className="mb-6"
            >
                <TabsList className="bg-pcb/10 p-1 rounded-lg">
                    <TabsTrigger
                        value="GroupMentor"
                        className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                    >
                        GM
                    </TabsTrigger>
                    <TabsTrigger
                        value="SeniorMentor"
                        className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                    >
                        SM
                    </TabsTrigger>
                    <TabsTrigger
                        value="Employee"
                        className="data-[state=active]:bg-pcb data-[state=active]:text-white"
                    >
                        Others
                    </TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                    <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <CardContent className="p-6">
                            {commonSalary &&
                                (activeTab === "GroupMentor" ||
                                    activeTab === "SeniorMentor") && (
                                    <div className="mb-6 p-6 border rounded-lg shadow-sm bg-gray-50">
                                        <h3 className="text-xl font-semibold mb-4 text-pcb">
                                            Common Pay Settings
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                            <div className="flex flex-col">
                                                <Label
                                                    htmlFor="basePay"
                                                    className="mb-2 text-pcb"
                                                >
                                                    BASE PAY
                                                </Label>
                                                <Input
                                                    type="number"
                                                    id="basePay"
                                                    value={
                                                        commonSalary.baseSalary ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setCommonSalary({
                                                            ...commonSalary,
                                                            baseSalary: Number(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    placeholder="Base Pay"
                                                    className="w-full border-pcb"
                                                />
                                            </div>
                                            {!commonSalary.payAccordingToRating && (
                                                <div className="flex flex-col">
                                                    <Label
                                                        htmlFor="perAj"
                                                        className="mb-2 text-pcb"
                                                    >
                                                        PER AJ
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        id="perAj"
                                                        value={
                                                            commonSalary.perAj ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setCommonSalary({
                                                                ...commonSalary,
                                                                perAj: Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            })
                                                        }
                                                        placeholder="Per AJ"
                                                        className="w-full border-pcb"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2 col-span-full">
                                                <input
                                                    type="checkbox"
                                                    id="payAsPerRating"
                                                    checked={
                                                        commonSalary.payAccordingToRating
                                                    }
                                                    onChange={(e) =>
                                                        setCommonSalary({
                                                            ...commonSalary,
                                                            payAccordingToRating:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    }
                                                    className="form-checkbox h-5 w-5 text-pcb"
                                                />
                                                <Label
                                                    htmlFor="payAsPerRating"
                                                    className="cursor-pointer text-pcb"
                                                >
                                                    Pay As Per Rating
                                                </Label>
                                            </div>
                                            {commonSalary.payAccordingToRating && (
                                                <>
                                                    <div className="flex flex-col">
                                                        <Label
                                                            htmlFor="perAjLess"
                                                            className="mb-2 text-pcb"
                                                        >
                                                            PER AJ (rating &lt;
                                                            4.5)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            id="perAjLess"
                                                            value={
                                                                commonSalary.perAjLess ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setCommonSalary(
                                                                    {
                                                                        ...commonSalary,
                                                                        perAjLess:
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                                )
                                                            }
                                                            placeholder="Pay for Less than 4.5 rating"
                                                            className="w-full border-pcb"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Label
                                                            htmlFor="perAjMore"
                                                            className="mb-2 text-pcb"
                                                        >
                                                            PER AJ (rating &gt;
                                                            4.5)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            id="perAjMore"
                                                            value={
                                                                commonSalary.perAjMore ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setCommonSalary(
                                                                    {
                                                                        ...commonSalary,
                                                                        perAjMore:
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                                )
                                                            }
                                                            placeholder="Pay for More than 4.5 rating"
                                                            className="w-full border-pcb"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <Button
                                            onClick={handleEditCommonSalary}
                                            className="mt-6 w-full sm:w-auto bg-pcb hover:bg-pcb/90 text-white p-2 rounded"
                                        >
                                            {isLoading
                                                ? "Saving..."
                                                : "Save Common Settings"}
                                        </Button>
                                        <div>
                                            {success && (
                                                <p className="text-green-600 mt-2">
                                                    Settings saved
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            <div className="overflow-x-auto relative">
                                <div className="min-w-[800px]">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-white z-20">
                                            <TableRow className="bg-pcb/10">
                                                <TableHead className="sticky top-0 bg-pcb/10 text-pcb z-30">
                                                    Name
                                                </TableHead>
                                                {activeTab !== "Employee" && (
                                                    <>
                                                        <TableHead className="text-pcb">
                                                            Student Count
                                                        </TableHead>
                                                        <TableHead className="text-pcb">
                                                            Overall Rating
                                                        </TableHead>
                                                    </>
                                                )}
                                                {activeTab === "Employee" && (
                                                    <TableHead className="text-pcb">
                                                        Phone Number
                                                    </TableHead>
                                                )}
                                                <TableHead className="text-pcb">
                                                    Bonus
                                                </TableHead>
                                                <TableHead className="text-pcb">
                                                    Total Salary
                                                </TableHead>
                                                <TableHead className="text-pcb">
                                                    Paid
                                                </TableHead>
                                                <TableHead className="text-pcb">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mentors[activeTab].map(
                                                (mentor) => {
                                                    const salary = salaries[
                                                        activeTab
                                                    ].find(
                                                        (s) =>
                                                            s.userId ===
                                                            mentor.id,
                                                    ) || {
                                                        userId: mentor.id,
                                                        totalSalary:
                                                            activeTab !==
                                                                "Employee" &&
                                                            commonSalary
                                                                ? calculateTotalSalary(
                                                                      mentor as
                                                                          | GroupMentor
                                                                          | SeniorMentor,
                                                                      commonSalary,
                                                                  )
                                                                : 0,
                                                        bonus: 0,
                                                        paid: false,
                                                    };
                                                    const isEditing =
                                                        editingId === mentor.id;
                                                    return (
                                                        <TableRow
                                                            key={mentor.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <TableCell className="sticky left-0 bg-white z-10">
                                                                {mentor.name}
                                                            </TableCell>
                                                            {activeTab !==
                                                                "Employee" && (
                                                                <>
                                                                    <TableCell>
                                                                        {
                                                                            (
                                                                                mentor as
                                                                                    | GroupMentor
                                                                                    | SeniorMentor
                                                                            )
                                                                                .studentCount
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {(
                                                                            mentor as
                                                                                | GroupMentor
                                                                                | SeniorMentor
                                                                        ).overallRating.toFixed(
                                                                            2,
                                                                        )}
                                                                    </TableCell>
                                                                </>
                                                            )}
                                                            {activeTab ===
                                                                "Employee" && (
                                                                <TableCell>
                                                                    {
                                                                        (
                                                                            mentor as Employee
                                                                        )
                                                                            .phoneNumber
                                                                    }
                                                                </TableCell>
                                                            )}
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        salary.bonus ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleSalaryChange(
                                                                            mentor.id,
                                                                            "bonus",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    readOnly={
                                                                        !isEditing
                                                                    }
                                                                    className="w-full border-pcb"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        salary.totalSalary ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleSalaryChange(
                                                                            mentor.id,
                                                                            "totalSalary",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    readOnly={
                                                                        !isEditing
                                                                    }
                                                                    className="w-full border-pcb"
                                                                />
                                                            </TableCell>

                                                            <TableCell>
                                                                <Button
                                                                    onClick={() =>
                                                                        handleEditSalary(
                                                                            mentor.id,
                                                                            salary.totalSalary,
                                                                            salary.bonus,
                                                                            !salary.paid,
                                                                        )
                                                                    }
                                                                    variant={
                                                                        salary.paid
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                    className={
                                                                        salary.paid
                                                                            ? "bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                                                                            : "border-pcb text-pcb hover:bg-pcb hover:text-white w-full sm:w-auto"
                                                                    }
                                                                >
                                                                    {salary.paid
                                                                        ? "Paid"
                                                                        : "Not Paid"}
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell>
                                                                {isEditing ? (
                                                                    <Button
                                                                        onClick={() =>
                                                                            handleEditSalary(
                                                                                mentor.id,
                                                                                salary.totalSalary,
                                                                                salary.bonus,
                                                                                salary.paid,
                                                                            )
                                                                        }
                                                                        className="bg-pcb hover:bg-pcb/90 text-white w-full sm:w-auto"
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() =>
                                                                            setEditingId(
                                                                                mentor.id,
                                                                            )
                                                                        }
                                                                        className="bg-pcb hover:bg-pcb/90 text-white w-full sm:w-auto"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                },
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
