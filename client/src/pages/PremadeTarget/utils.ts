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
    physics: SubjectTarget | null;
    chemistry: SubjectTarget | null;
    biology: SubjectTarget | null;
}

export interface CreateTarget {
    setId: string;
    day: number;
    physicsTarget: SubjectTarget | undefined;
    chemistryTarget: SubjectTarget | undefined;
    biologyTarget: SubjectTarget | undefined;
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

export const addSet = async (name: string): Promise<TargetSet | null> => {
    try {
        const { data } = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/premadeTarget/addSet",
            { name },
            getAuthHeaders(),
        );
        return data.data;
    } catch (error) {
        return null;
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
