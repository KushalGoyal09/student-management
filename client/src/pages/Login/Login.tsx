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
import { AlertCircle } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { Role, tokenAtom, userAtom } from "@/recoil/userAtom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Response {
    success: boolean;
    message: string;
    token: string;
    role: Role;
}

export default function MentorLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const setToken = useSetRecoilState(tokenAtom);
    const setRole = useSetRecoilState(userAtom);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }
        try {
            const { data } = await axios.post<Response>(`${backendUrl}/login`, {
                username,
                password,
            });
            localStorage.setItem("token", data.token);
            setToken(data.token);
            //@ts-ignore
            setRole(data.role);
            navigate("/");
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.response?.data.message) {
                    setError(error.response.data.message);
                    return;
                }
            }
            setError("Something went wrong");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Login
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
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
                            Log In
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
