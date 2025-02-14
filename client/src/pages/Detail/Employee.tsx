import { useState, useEffect } from "react";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Employee {
    id: string;
    name: string;
    phoneNumber: string;
}

const fetchEmployees = async (): Promise<Employee[]> => {
    const { data } = await axios.get(`${backendUrl}/detail/employes`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return data.data;
};

export default function Employee() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getEmployees = async () => {
            try {
                const fetchedEmployees = await fetchEmployees();
                setEmployees(fetchedEmployees);
                setIsLoading(false);
            } catch (err) {
                setError("Failed to fetch employees. Please try again later.");
                setIsLoading(false);
            }
        };

        getEmployees();
    }, []);

    if (isLoading) {
        return <div className="text-center py-4">Loading employees...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Employee List</h1>
            <ul className="space-y-4">
                {employees.map((employee) => (
                    <li
                        key={employee.id}
                        className="bg-white shadow rounded-lg p-4"
                    >
                        <h2 className="text-lg font-semibold">
                            {employee.name}
                        </h2>
                        <p className="text-gray-600">{employee.phoneNumber}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
