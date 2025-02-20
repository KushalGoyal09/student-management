import { atom, selector } from "recoil";
import { tokenAtom } from "./userAtom";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export interface Student {
    id: string;
    name: string;
    whattsapNumber: string;
    callNumber: string;
    target: string;
    StudyHours: string;
    class: string;
    dropperStatus: string;
    previousScore: string;
    platform: string;
    createdAt: Date;
    status: boolean;
}

const fetchStudents = async (token: string): Promise<Student[]> => {
    try {
        const { data } = await axios.get(`${backendUrl}/new/students`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data.data;
    } catch (error) {
        return [];
    }
};

const newStudents = atom({
    key: "newStudents",
    default: selector({
        key: "newStudents/default",
        get: async ({ get }) => {
            const tokenValue = get(tokenAtom);
            if (!tokenValue) {
                return [];
            }
            return await fetchStudents(tokenValue);
        },
    }),
});

export default newStudents;
