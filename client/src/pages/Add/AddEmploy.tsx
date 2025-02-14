import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import axios, { isAxiosError } from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AddEmploy = () => {
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !phoneNumber) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/add/employee`,
                {
                    name,
                    phoneNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setName("");
            setPhoneNumber("");
            setSuccess(data.message);
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.data.message) {
                    setError(error.response.data.message);
                    return;
                }
            }
            setError("Something went wrong");
            return;
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Add Employee</CardTitle>
                    <CardDescription>
                        Enter the details of the new Employee
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Employee's full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter Employee's phone number"
                            />
                        </div>
                        {error && (
                            <div className="flex items-center space-x-2 text-red-600">
                                <AlertCircle size={16} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle2 size={16} />
                                <span className="text-sm">{success}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Add
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AddEmploy;
