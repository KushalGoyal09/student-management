import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Suspense, useEffect, useState } from "react";
import { useRecoilValueLoadable } from "recoil";
import Loading from "./Loading";
import { nameAtom, Role, userAtom } from "@/recoil/userAtom";
import WelcomeComponent from "./Welcome";
import Tiles from "./Tiles";
import permissionAtom from "@/recoil/permission";
import AdminWelcomeComponent from "./AdminWelcome";

interface Links {
    role: Array<Role | null>;
    label: string;
    path: string;
}

interface Permission {
    FeeManagement: boolean;
    KitDispatch: boolean;
    AssaignMentor: boolean;
}

const Layout = () => {
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [permission, setPermission] = useState<Permission | null>(null);
    const nameLoadable = useRecoilValueLoadable(nameAtom);
    const roleLoadable = useRecoilValueLoadable(userAtom);
    const permissionLoadable = useRecoilValueLoadable<Permission | null>(
        permissionAtom,
    );

    useEffect(() => {
        if (nameLoadable.state === "hasValue") {
            setName(nameLoadable.contents);
        }
    }, [nameLoadable]);

    useEffect(() => {
        if (roleLoadable.state === "hasValue") {
            setRole(roleLoadable.contents);
        }
    }, [roleLoadable]);

    useEffect(() => {
        if (permissionLoadable.state === "hasValue") {
            setPermission(permissionLoadable.contents);
        }
    }, [permissionLoadable]);

    const links: Links[] = [
        {
            role: [Role.admin],
            label: "Add Mentor",
            path: "/add/mentor",
        },
        {
            role: [Role.admin],
            label: "Add Senior Mentor",
            path: "/add/senior-mentor",
        },
        {
            role: [Role.admin],
            label: "Add Supervisor",
            path: "/add/supervisor",
        },
        {
            role: [Role.admin],
            label: "Add Student",
            path: "/add/student",
        },
        {
            role: [Role.admin],
            label: "See all supervisors",
            path: "/supervisor",
        },
        {
            role: [Role.supervisor, Role.admin],
            label: "All Senior Mentors",
            path: "/seniorMentor",
        },
        {
            role: [Role.supervisor, Role.admin, Role.seniorMentor],
            label: "All Group Mentors",
            path: "/mentor",
        },
        {
            role: [Role.seniorMentor, Role.admin, Role.supervisor],
            label: "Juniors",
            path: "/juniors",
        },
        {
            role: [Role.admin],
            label: "See all new admissions",
            path: "/new-admission",
        },
        {
            role: [Role.admin],
            label: "Fees Data",
            path: "/fee-details",
        },
        {
            role: [Role.admin],
            label: "Kit Distribution Data",
            path: "kit-data",
        },
        {
            role: [Role.admin],
            label: "Change Password",
            path: "/admin/ChangePassword",
        },
        {
            role: [Role.groupMentor],
            label: "See call records",
            path: "/call-records",
        },
        {
            role: [Role.seniorMentor],
            label: "My Planer",
            path: "/call",
        },
        {
            role: [Role.seniorMentor, Role.supervisor, Role.admin],
            label: "Syallabus",
            path: "/syllabus",
        },
        {
            role: [Role.groupMentor, Role.seniorMentor],
            label: "Create Target",
            path: "/target",
        },
        {
            role: [Role.supervisor],
            label: "Rate Mentor Performance",
            path: "/rating",
        },
        {
            role: [Role.groupMentor],
            label: "My Juniors",
            path: "/juniors",
        },
        {
            role: [Role.groupMentor],
            label: "Recent Feedbacks",
            path: "/mentor-feedback",
        },
        {
            role: [Role.groupMentor],
            label: "Syallabus",
            path: "/syllabus",
        },
        {
            role: [Role.groupMentor, Role.supervisor, Role.seniorMentor],
            label: "Raise a ticket",
            path: "/ticket/create",
        },
    ];

    if (permission?.FeeManagement === true) {
        links.push({
            role: [Role.supervisor],
            label: "Fee Management",
            path: "/fee-details",
        });
    }

    if (permission?.KitDispatch === true) {
        links.push({
            role: [Role.supervisor],
            label: "Kit Distribution",
            path: "/kit-data",
        });
    }

    const filteredLinks = links.filter((link) => link.role.includes(role));

    return (
        <Suspense fallback={<Loading />}>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                {name && role && role !== Role.admin && (
                    <WelcomeComponent name={name} />
                )}
                {name && role && role === Role.admin && (
                    <AdminWelcomeComponent />
                )}
                {role && role !== Role.admin && (
                    <Tiles filteredLinks={filteredLinks} />
                )}
                <Outlet />
            </div>
        </Suspense>
    );
};

export default Layout;
