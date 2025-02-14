import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios, { isAxiosError } from "axios";
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
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Response {
    success: boolean;
    message: string;
    token: string;
}

export default function Component() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!password) {
            setError("Please enter both username and password");
            return;
        }
        try {
            const { data } = await axios.post<Response>(
                `${backendUrl}/admin/change-password`,
                {
                    newPassword: password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast({
                title: "Success",
                description: data.message,
            });
            navigate("/");
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.data.message) {
                    setError(error.response.data.message);
                    return;
                }
            }
            toast({
                description: "Somthing is wrong",
            });
            return;
        }
    };

    return (
        <div className="flex items-center justify-center py-10 bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Change Password</CardTitle>
                    <CardDescription>
                        Enter a strong new password
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center space-x-2 text-red-600">
                                <AlertCircle size={16} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Change Password
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
