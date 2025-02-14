import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FeeStructureForm } from "./FeeStructureForm";
import { PaymentList } from "./PayemntList";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type StudentFeeManagementProps = {
    studentId: string;
};

type Payment = {
    id: string;
    amount: number;
    date: string;
    transactionId: string | null;
    mode: string | null;
    cleared: boolean;
};

type MentorshipPlan = "Elite" | "Pro" | "Max";

type FeeData = {
    totalAmountPaid: number;
    totalAmountDue: number;
    feesPlan: number;
    allClear: boolean;
    mentorshipPlan: MentorshipPlan;
    payments: Payment[];
};

type FeeDataResponse = {
    success: true;
    data: FeeData | null;
};

const fetchFeeData = async (studentId: string) => {
    const { data } = await axios.post<FeeDataResponse>(
        `${backendUrl}/new/fee-data`,
        { studentId },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data.data;
};

const setFeeStructure = async (
    studentId: string,
    feePlan: number,
    mentorshipPlan: MentorshipPlan,
    payments: Payment[],
) => {
    const { data } = await axios.post(
        `${backendUrl}/new/set-fee-details`,
        {
            studentId,
            feesPlan: feePlan,
            mentorshipPlan,
            payments,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data;
};

const markFeeClear = async (studentId: string, allClear: boolean) => {
    const { data } = await axios.post(
        `${backendUrl}/new/allClear`,
        {
            studentId,
            allClear,
        },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        },
    );
    return data;
};

export default function StudentFeeManagement({
    studentId,
}: StudentFeeManagementProps) {
    const [feeData, setFeeData] = useState<FeeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadFeeData();
    }, [studentId]);

    const loadFeeData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchFeeData(studentId);
            setFeeData(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load fee data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeeStructureSubmit = async (
        mentorshipPlan: MentorshipPlan,
        feePlan: number,
        payments: Payment[],
    ) => {
        try {
            await setFeeStructure(studentId, feePlan, mentorshipPlan, payments);
            toast({
                title: "Success",
                description: "Fee structure has been set successfully.",
            });
            loadFeeData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to set fee structure. Please try again.",
                variant: "destructive",
            });
        }
    };

    const addPayment = async (studentId: string, payment: Payment) => {
        const { data } = await axios.post(
            `${backendUrl}/new/add-payment`,
            {
                studentId,
                payment,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        return data;
    };

    const handlePaymentEdit = async (
        paymentId: string,
        updatedPayment: Partial<Payment>,
    ) => {
        try {
            // Find the existing payment
            const existingPayment = feeData?.payments.find(
                (p) => p.id === paymentId,
            );
            if (!existingPayment) {
                throw new Error("Payment not found");
            }

            // Merge the existing payment with the updates
            const mergedPayment: Payment = {
                ...existingPayment,
                ...updatedPayment,
                id: paymentId, // Ensure the ID remains unchanged
            };

            // Use the addPayment function to update the payment
            await addPayment(studentId, mergedPayment);

            toast({
                title: "Success",
                description: "Payment has been updated successfully.",
            });
            loadFeeData();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update payment. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleAllClearToggle = async (allClear: boolean) => {
        try {
            await markFeeClear(studentId, allClear);
            toast({
                title: "Success",
                description: `Fee status has been marked as ${allClear ? "cleared" : "not cleared"}.`,
            });
            loadFeeData();
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "Failed to update fee clear status. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getFeePlanColor = (feesPlan: number) => {
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

    const getMentorshipPlanColor = (mentorshipPlan: MentorshipPlan) => {
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    if (!feeData) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Set Fee Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    <FeeStructureForm onSubmit={handleFeeStructureSubmit} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fee Management</CardTitle>
                {/* <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button variant="outline">Edit Fee Structure</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Fee Structure</DialogTitle>
                        </DialogHeader>
                        <FeeStructureForm
                            onSubmit={(mentorshipPlan, feePlan, payments) => {
                                handleFeeStructureSubmit(
                                    mentorshipPlan,
                                    feePlan,
                                    payments,
                                );
                                setIsEditDialogOpen(false);
                            }}
                            initialData={feeData}
                        />
                    </DialogContent>
                </Dialog> */}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium">
                            Total Amount{" "}
                            <span className="text-green-400 font-bold">
                                Paid
                            </span>{" "}
                        </p>
                        <p className="text-2xl font-bold">
                            ₹{feeData.totalAmountPaid}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            Total Amount{" "}
                            <span className="text-red-400 font-bold">
                                Due
                            </span>{" "}
                        </p>
                        <p className="text-2xl font-bold">
                            ₹{feeData.totalAmountDue}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Fee Plan</p>
                        <p
                            className={
                                `text-xl font-bold ` +
                                getFeePlanColor(feeData.feesPlan)
                            }
                        >
                            {feeData.feesPlan} installment(s)
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Mentorship Plan</p>
                        <p
                            className={
                                "text-xl font-bold " +
                                getMentorshipPlanColor(feeData.mentorshipPlan)
                            }
                        >
                            {feeData.mentorshipPlan}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={feeData.allClear}
                            onCheckedChange={handleAllClearToggle}
                            id="all-clear"
                        />
                        <label
                            htmlFor="all-clear"
                            className="text-sm font-medium"
                        >
                            All Clear
                        </label>
                    </div>
                </div>
                <PaymentList
                    payments={feeData.payments}
                    onEditPayment={handlePaymentEdit}
                />
            </CardContent>
        </Card>
    );
}
