import axios from "axios";

export interface TargetSet {
    id: string;
    name: string;
    createdAt: Date;
}

export interface SubjectTarget {
    chapterId: number;
    numberOfLecture: number;
    isFinal: boolean;
}

export interface Target {
    id: string;
    day: number;
    physics: SubjectTarget[];
    chemistry: SubjectTarget[];
    biology: SubjectTarget[];
}

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