import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function AddSeniorMentor() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        supervisorId: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [supervisor, setSupervisors] = useState<
        {
            id: string;
            name: string;
            username: string;
        }[]
    >([]);

    useEffect(() => {
        const getSupervisors = async () => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/detail/supervisors`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    },
                );
                setSupervisors(data.data);
            } catch (error) {
                setSupervisors([]);
            }
        };
        getSupervisors();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prevData) => ({ ...prevData, supervisorId: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const { data } = await axios.post(
                `${backendUrl}/add/senior-mentor`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            setFormData({
                name: "",
                username: "",
                password: "",
                supervisorId: "",
            });
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
        <div className="container mx-auto py-10">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Add Senior Mentor</CardTitle>
                    <CardDescription>
                        Enter the details of the new senior mentor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seniorMentor">Supervisor</Label>
                            <Select
                                value={formData.supervisorId}
                                onValueChange={handleSelectChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a supervisor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supervisor.map((mentor) => (
                                        <SelectItem
                                            key={mentor.id}
                                            value={mentor.id}
                                        >
                                            {`${mentor.name} (${mentor.username})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">
                            Add Senior Mentor
                        </Button>
                    </form>
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
            </Card>
        </div>
    );
}
