import axios from "axios";
import { LecturesDoneResponse,Subject,Target,TargetSet,CreateTarget } from "./types";

export const getLecturesDone = async (
    studentId: string,
    chapterId: number,
    subject: Subject,
): Promise<LecturesDoneResponse["data"]> => {
    const { data } = await axios.post<LecturesDoneResponse>(
        import.meta.env.VITE_BACKEND_URL + "/target/getLecturesDone",
        { studentId, chapterId, subject },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    return data.data;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getAllset = async (): Promise<TargetSet[]> => {
    try {
        const { data } = await axios.get(
            import.meta.env.VITE_BACKEND_URL + "/premadeTarget/getAllSet",
            getAuthHeaders(),
        );
        return data.data;
    } catch (error) {
        return [];
    }
};

export const getTargetInSet = async (
    setId: string,
    fromDay: number,
    toDay: number,
): Promise<Target[]> => {
    try {
        const { data } = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/premadeTarget/getTargetInSet",
            { setId, fromDay, toDay },
            getAuthHeaders(),
        );
        return data.data;
    } catch (error) {
        return [];
    }
};

export const addTarget = async (create: CreateTarget): Promise<Boolean> => {
    try {
        await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/premadeTarget/addTarget",
            create,
            getAuthHeaders(),
        );
        return true;
    } catch (error) {
        return false;
    }
};
