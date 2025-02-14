import { atom, selector } from "recoil";
import { Role, tokenAtom, userAtom } from "./userAtom";
import axios from "axios";

interface Permission {
    FeeManagement: boolean;
    KitDispatch: boolean;
    AssaignMentor: boolean;
}

const fetchPermission = async (token: string) => {
    const { data } = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/role/get",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return data.data;
};

const permissionAtom = atom<null | Permission>({
    key: "permission",
    default: selector({
        key: "permission/default",
        get: async ({ get }) => {
            const role = get(userAtom);
            if (role !== Role.supervisor) {
                return null;
            }
            const tokenValue = get(tokenAtom);
            if (!tokenValue) {
                return null;
            }
            const permission = await fetchPermission(tokenValue);
            return permission;
        },
    }),
});

export default permissionAtom;
