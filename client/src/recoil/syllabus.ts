import { atom, selector } from "recoil";
import { tokenAtom } from "./userAtom";

interface Chapter {
    id: number;
    chapterName: string;
    createdAt: Date;
}

interface Syllabus {
    physics: Chapter[];
    chemistry: Chapter[];
    biology: Chapter[];
}

const fetchSyllabus = async (token: string): Promise<Syllabus> => {
    const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/syllabus/getAll",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    const data = await response.json();
    return data;
};

const syllabusAtom = atom({
    key: "syllabus",
    default: selector({
        key: "syllabus/default",
        get: async ({ get }) => {
            const token = get(tokenAtom);
            if (!token) {
                return {
                    physics: [],
                    chemistry: [],
                    biology: [],
                };
            }
            return await fetchSyllabus(token);
        },
    }),
});

export default syllabusAtom;
