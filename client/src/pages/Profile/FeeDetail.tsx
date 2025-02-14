import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit2, Check, X } from "lucide-react";
import axios from "axios";
import { format, addDays, differenceInDays } from "date-fns";
import { Switch } from "@/components/ui/switch";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Payment = {
    amount: number;
    date: Date;
    mode: string | null;
};

type MentorshipPlan = "Elite" | "Pro" | "Max";

type FeeData = {
    totalAmountPaid: number;
    feesPlan: number | null;
    mentorshipPlan: MentorshipPlan | null;
    allClear: boolean;
    payments: Payment[];
};

type Props = {
    studentId: string;
};

const feeStructure = {
    Elite: { one: 12990, two: [7500, 7500], three: [5500, 5500, 3990] },
    Pro: { one: 13999, two: [7500, 7500], three: [5500, 5500, 5000] },
    Max: { one: 24999, two: [15000, 15000] },
};

export default function FeeManagement({ studentId }: Props) {
    const [feeData, setFeeData] = useState<FeeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newPayment, setNewPayment] = useState<Payment | null>(null);
    const [editingPayment, setEditingPayment] = useState<number | null>(null);
    const { toast } = useToast();

    const handleAddPayment = () => {
        if (feeData && feeData.feesPlan && feeData.mentorshipPlan) {
            const plan = feeStructure[feeData.mentorshipPlan];
            // @ts-ignore
            const amount =
                feeData.feesPlan === 1
                    ? plan.one
                    : feeData.feesPlan === 2
                      ? plan.two[0]
                      : //@ts-ignore
                        plan.three[0];
            setNewPayment({
                date: new Date(),
                mode: "UPI",
                amount: amount,
            });
        }
    };

    useEffect(() => {
        const fetchFeeData = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.post(
                    `${backendUrl}/new/fee-data`,
                    { studentId },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    },
                );
                setFeeData(data.data);
            } catch (error) {
                toast({
                    description: "Failed to load fee data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeeData();
    }, [studentId, toast]);

    const sendPaymentToBackend = async () => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/new/add-payment`,
                {
                    studentId,
                    payment: newPayment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setFeeData(data.data);
            toast({
                title: "Success",
                description: "Payment added successfully.",
            });
            setNewPayment(null);

            if (feeData && feeData.feesPlan) {
                if (data.data.payments.length === feeData.feesPlan) {
                    setFeeData({ ...feeData, allClear: true });
                    handleUpdateFee({ allClear: true });
                }
            }
        } catch (error) {
            toast({
                description: "Failed to add payment. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleUpdateFee = async ({
        allClear,
        feePlan,
        mentorshipPlan,
    }: {
        allClear?: boolean;
        feePlan?: number | null;
        mentorshipPlan?: MentorshipPlan | null;
    }) => {
        if (!feeData) {
            return;
        }
        if (allClear === undefined) {
            allClear = feeData.allClear;
        }
        if (feePlan === undefined) {
            feePlan = feeData.feesPlan;
        }
        if (mentorshipPlan === undefined) {
            mentorshipPlan = feeData.mentorshipPlan;
        }
        try {
            const { data } = await axios.put(
                `${backendUrl}/new/update-fee-details`,
                {
                    studentId,
                    feesPlan: feePlan,
                    allClear: allClear,
                    mentorshipPlan: mentorshipPlan,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast({
                title: "Success",
                description: "Fee details updated successfully.",
                variant: "default",
            });
            setFeeData(data.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update fee details. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getDueDays = (lastPaymentDate: Date) => {
        const nextPaymentDate = addDays(new Date(lastPaymentDate), 45);
        const today = new Date();
        const daysLeft = differenceInDays(nextPaymentDate, today);
        return daysLeft;
    };

    const handleEditPayment = (index: number) => {
        setEditingPayment(index);
    };

    const handleSavePayment = async (index: number) => {
        if (!feeData) return;
        try {
            const { data } = await axios.put(
                `${backendUrl}/new/update-payment`,
                {
                    studentId,
                    paymentIndex: index,
                    payment: feeData.payments[index],
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setFeeData(data.data);
            setEditingPayment(null);
            toast({
                title: "Success",
                description: "Payment updated successfully.",
            });
        } catch (error) {
            toast({
                description: "Failed to update payment. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full mt-6">
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!feeData) {
        return (
            <Card className="w-full mt-6">
                <CardContent className="p-6">
                    <p className="text-center text-gray-500">
                        No fee data available
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full mt-6 max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Fee Management
                </CardTitle>
                <div className="flex space-x-2 mt-2">
                    <Badge
                        variant={feeData.allClear ? "default" : "destructive"}
                    >
                        {feeData.allClear ? "All Clear" : "Not Cleared"}
                    </Badge>
                    {feeData.feesPlan && (
                        <Badge variant="secondary">
                            Fee Plan: {feeData.feesPlan} Time
                            {feeData.feesPlan > 1 ? "s" : ""}
                        </Badge>
                    )}
                    {!feeData.feesPlan && (
                        <Badge variant="secondary">Fee Plan: Not Set</Badge>
                    )}
                    {feeData.mentorshipPlan && (
                        <Badge variant="outline">
                            Mentorship: {feeData.mentorshipPlan}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-md">
                            <span className="font-semibold text-gray-700">
                                Total Amount Paid:
                            </span>
                            <span className="text-lg font-bold text-green-600">
                                ₹{feeData.totalAmountPaid}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mentorshipPlan">Mentorship Plan</Label>
                        <Select
                            value={feeData.mentorshipPlan || undefined}
                            onValueChange={(value: MentorshipPlan) => {
                                setFeeData({
                                    ...feeData,
                                    mentorshipPlan: value,
                                });
                                handleUpdateFee({ mentorshipPlan: value });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Mentorship Plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Elite">Elite</SelectItem>
                                <SelectItem value="Pro">Pro</SelectItem>
                                <SelectItem value="Max">Max</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label htmlFor="feePlan">Fee Plan</Label>
                        <Select
                            value={feeData.feesPlan?.toString()}
                            onValueChange={(value) => {
                                setFeeData({
                                    ...feeData,
                                    feesPlan: parseInt(value),
                                });
                                handleUpdateFee({ feePlan: parseInt(value) });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Fee Plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">One Time</SelectItem>
                                <SelectItem value="2">Two Time</SelectItem>
                                <SelectItem value="3">Three Time</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="allClear">All Clear</Label>
                            <Switch
                                id="allClear"
                                disabled={!feeData.feesPlan}
                                checked={feeData.allClear}
                                onCheckedChange={(value) => {
                                    setFeeData({ ...feeData, allClear: value });
                                    handleUpdateFee({ allClear: value });
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment History</Label>
                        {feeData.payments.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No previous payments
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {feeData.payments.map((payment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-100 rounded-md"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-700">
                                                Amount:
                                            </span>
                                            {editingPayment === index ? (
                                                <Input
                                                    type="number"
                                                    value={payment.amount}
                                                    onChange={(e) => {
                                                        const newPayments = [
                                                            ...feeData.payments,
                                                        ];
                                                        newPayments[
                                                            index
                                                        ].amount = Number(
                                                            e.target.value,
                                                        );
                                                        setFeeData({
                                                            ...feeData,
                                                            payments:
                                                                newPayments,
                                                        });
                                                    }}
                                                    className="w-24"
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-green-600">
                                                    ₹{payment.amount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-700">
                                                Date:
                                            </span>
                                            {editingPayment === index ? (
                                                <Input
                                                    type="date"
                                                    value={format(
                                                        new Date(payment.date),
                                                        "yyyy-MM-dd",
                                                    )}
                                                    onChange={(e) => {
                                                        const newPayments = [
                                                            ...feeData.payments,
                                                        ];
                                                        newPayments[
                                                            index
                                                        ].date = new Date(
                                                            e.target.value,
                                                        );
                                                        setFeeData({
                                                            ...feeData,
                                                            payments:
                                                                newPayments,
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-blue-600">
                                                    {format(
                                                        new Date(payment.date),
                                                        "dd MMM yyyy",
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-700">
                                                Mode:
                                            </span>
                                            {editingPayment === index ? (
                                                <Input
                                                    type="text"
                                                    value={payment.mode || ""}
                                                    onChange={(e) => {
                                                        const newPayments = [
                                                            ...feeData.payments,
                                                        ];
                                                        newPayments[
                                                            index
                                                        ].mode = e.target.value;
                                                        setFeeData({
                                                            ...feeData,
                                                            payments:
                                                                newPayments,
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-lg font-bold text-purple-600">
                                                    {payment.mode}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            {editingPayment === index ? (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            handleSavePayment(
                                                                index,
                                                            )
                                                        }
                                                        size="sm"
                                                        className="mr-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            setEditingPayment(
                                                                null,
                                                            )
                                                        }
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={() =>
                                                        handleEditPayment(index)
                                                    }
                                                    size="sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {feeData.payments.length !== 0 &&
                                    !feeData.allClear && (
                                        <div>
                                            <p className=" text-gray-500 bg-gray-100 rounded-md p-5">
                                                Next Payment Due in{" "}
                                                <span className="text-red-600">
                                                    {getDueDays(
                                                        feeData.payments[
                                                            feeData.payments
                                                                .length - 1
                                                        ].date,
                                                    )}
                                                </span>{" "}
                                                days
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>

                    {newPayment && (
                        <div className="space-y-2">
                            <Label>Add New Payment</Label>
                            <div className="flex flex-col space-y-2">
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={newPayment.amount || ""}
                                    onChange={(e) =>
                                        setNewPayment({
                                            ...newPayment,
                                            amount: Number(e.target.value),
                                        })
                                    }
                                />
                                <Input
                                    type="date"
                                    value={format(
                                        new Date(newPayment.date),
                                        "yyyy-MM-dd",
                                    )}
                                    onChange={(e) =>
                                        setNewPayment({
                                            ...newPayment,
                                            date: new Date(e.target.value),
                                        })
                                    }
                                />
                                <Input
                                    type="text"
                                    placeholder="Mode of Payment"
                                    value={newPayment?.mode || ""}
                                    onChange={(e) =>
                                        setNewPayment({
                                            ...newPayment,
                                            mode: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                    {!newPayment && (
                        <Button onClick={handleAddPayment} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Payment
                        </Button>
                    )}
                    {newPayment && (
                        <Button
                            onClick={sendPaymentToBackend}
                            className="w-full"
                        >
                            Submit
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
