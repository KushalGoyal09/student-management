import axios from "axios";
import { atom, selector } from "recoil";

export enum Role {
    superAdmin,
    admin,
    supervisor,
    seniorMentor,
    groupMentor,
    user,
}

interface Response {
    success: boolean;
    role: Role;
    name: string;
}

interface User {
    role: Role;
    name: string;
}

export const tokenAtom = atom({
    key: "token",
    default: localStorage.getItem("token"),
});

export const userAtom = atom<Role | null>({
    key: "userAtom",
    default: selector({
        key: "userAtom/default",
        get: async ({ get }) => {
            const tokenValue = get(tokenAtom);
            if (!tokenValue) {
                return null;
            }
            const user = await fetchUser(tokenValue);
            if (user) {
                return user.role;
            } else {
                return null;
            }
        },
    }),
});

export const nameAtom = atom<string | null>({
    key: "nameAtom",
    default: selector({
        key: "nameAtom/default",
        get: async ({ get }) => {
            const tokenValue = get(tokenAtom);
            if (!tokenValue) {
                return null;
            }
            const user = await fetchUser(tokenValue);
            if (user) {
                return user.name;
            } else {
                return null;
            }
        },
    }),
});

const fetchUser = async (token: string): Promise<User | null> => {
    try {
        const { data } = await axios.get<Response>(
            import.meta.env.VITE_BACKEND_URL + "/me",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        if (data.role) {
            return {
                role: data.role,
                name: data.name,
            };
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};
