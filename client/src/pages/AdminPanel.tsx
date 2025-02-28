import { Link, useNavigate } from "react-router-dom";
import {
    Users,
    GraduationCap,
    DollarSign,
    Package,
    Ticket,
    FileText,
    HandCoins,
    UserRoundPen,
    Target,
} from "lucide-react";

export default function AdminPanel() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center mb-6"></div>
                <h1 className="text-3xl font-bold text-center mb-8 text-pcb">
                    What's up?
                </h1>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                        {
                            title: "MENTOR",
                            icon: <Users className="h-8 w-8" />,
                            path: "/admin/mentor",
                        },
                        {
                            title: "JUNIOR",
                            icon: <GraduationCap className="h-8 w-8" />,
                            path: "/juniors",
                        },
                        {
                            title: "FEE",
                            icon: <DollarSign className="h-8 w-8" />,
                            path: "/fee-details",
                        },
                        {
                            title: "KIT",
                            icon: <Package className="h-8 w-8" />,
                            path: "/kit-data",
                        },
                        {
                            title: "TICKETS",
                            icon: <Ticket className="h-8 w-8" />,
                            path: "/tickets",
                        },
                        {
                            title: "SYLLABUS",
                            icon: <FileText className="h-8 w-8" />,
                            path: "/admin/syllabus",
                        },
                        {
                            title: "SALARY",
                            icon: <HandCoins className="h-8 w-8" />,
                            path: "/salary",
                        },
                        {
                            title: "MANAGE ROLES",
                            icon: <UserRoundPen className="h-8 w-8" />,
                            path: "/role",
                        },
                        {
                            title: "TARGET",
                            icon: <Target className="h-8 w-8" />,
                            path: "/manage-target",
                        },
                    ].map((item, index) => (
                        <button
                            key={index}
                            className="flex flex-col items-center justify-center bg-pcb/90 text-white rounded-lg p-4 hover:bg-pcb transition-colors"
                            onClick={() => navigate(item.path)}
                        >
                            {item.icon}
                            <span className="mt-2 font-semibold">
                                {item.title}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        to="/change-password"
                        className="text-pcb hover:underline"
                    >
                        Change password
                    </Link>
                </div>
            </div>
        </div>
    );
}
