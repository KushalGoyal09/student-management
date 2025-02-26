import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { lazy } from "react";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login/Login"));
const AddMentor = lazy(() => import("./pages/Add/AddMentor"));
const AddSeniorMentor = lazy(() => import("./pages/Add/AddSeniorMentor"));
const AddStudent = lazy(() => import("./pages/Add/AddStudent"));
const AddSupervisor = lazy(() => import("./pages/Add/AddSupervisor"));
const Target = lazy(() => import("./pages/Target/Test"));
const ChangePassword = lazy(() => import("./pages/Admin/ChangePassword"));
const MentorRatingPage = lazy(() => import("./pages/SupervisorRating"));
const SupervisorDetails = lazy(() => import("./pages/Detail/Supervisor"));
const SeniorMentorDetail = lazy(() => import("./pages/Detail/SeniorMentor"));
const MentorDetail = lazy(() => import("./pages/Detail/Mentor"));
const MentorDetailMain = lazy(() => import("./pages/Detail/MentorDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewAdmissions = lazy(() => import("./pages/New/NewAdmissions"));
const FeeDetail = lazy(() => import("./pages/New/FeeDetail"));
const KitDispatchPage = lazy(() => import("./pages/New/KitDetails"));
const Layout = lazy(() => import("./components/Layout"));
const MentorFeedback = lazy(() => import("./pages/MentorFeedbacks"));
const MentorPage = lazy(() => import("./pages/MentorPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ComplaintTickets = lazy(() => import("./pages/SeeAllTickets"));
const Juniors = lazy(() => import("./pages/Juniors"));
const StudentProfile = lazy(() => import("./pages/Profile/StudentProfile"));
const CallRecord = lazy(() => import("./pages/Call/CallRecordMentor"));
const SeniorCall = lazy(() => import("./pages/Call/CallRecordSenior"));
const MentorSalaryManagement = lazy(() => import("./pages/MentorSalary"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const SyllabusComponent = lazy(() => import("./pages/Syallabus/NeetSyallabus"));
const Syallabus = lazy(() => import("./pages/Syallabus/Syallabus"));
const AddEmploy = lazy(() => import("./pages/Add/AddEmploy"));
const Ticket = lazy(() => import("./pages/Ticket/Ticket"));
const Employee = lazy(() => import("./pages/Detail/Employee"));
const PremadeTarget = lazy(() => import("./pages/PremadeTarget/PremadeTarget"));
import { RecoilRoot } from "recoil";

const App = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "/",
                    element: <Home />,
                },
                {
                    path: "/login",
                    element: <Login />,
                },
                {
                    path: "/premade-target",
                    element: <PremadeTarget />,
                },
                {
                    path: "/change-password",
                    element: <ChangePassword />,
                },
                {
                    path: "/add",
                    children: [
                        {
                            path: "mentor",
                            element: <AddMentor />,
                        },
                        {
                            path: "student",
                            element: <AddStudent />,
                        },
                        {
                            path: "supervisor",
                            element: <AddSupervisor />,
                        },
                        {
                            path: "senior-mentor",
                            element: <AddSeniorMentor />,
                        },
                        {
                            path: "employee",
                            element: <AddEmploy />,
                        },
                    ],
                },
                {
                    path: "/call",
                    element: <SeniorCall />,
                },
                {
                    path: "/target",
                    element: <Target />,
                },
                {
                    path: "/rating",
                    element: <MentorRatingPage />,
                },
                {
                    path: "mentor-feedback",
                    element: <MentorFeedback />,
                },
                {
                    path: "/supervisor",
                    element: <SupervisorDetails />,
                },
                {
                    path: "/seniorMentor",
                    element: <SeniorMentorDetail />,
                },
                {
                    path: "/mentor",
                    element: <MentorDetail />,
                },
                {
                    path: "/mentor/:username",
                    element: <MentorDetailMain />,
                },
                {
                    path: "/AdminPanel",
                    element: <AdminPanel />,
                },
                {
                    path: "/profile",
                    children: [
                        {
                            path: ":id",
                            element: <StudentProfile />,
                        },
                    ],
                },
                {
                    path: "/new-admission",
                    element: <NewAdmissions />,
                },
                {
                    path: "/fee-details",
                    element: <FeeDetail />,
                },
                {
                    path: "/kit-data",
                    element: <KitDispatchPage />,
                },
                {
                    path: "/call-records",
                    element: <CallRecord />,
                },
                {
                    path: "/employes",
                    element: <Employee />,
                },
                {
                    path: "/syllabus",
                    element: <SyllabusComponent />,
                },
                {
                    path: "/admin/syllabus",
                    element: <Syallabus />,
                },
                {
                    path: "admin/mentor",
                    element: <MentorPage />,
                },
                {
                    path: "ticket/create",
                    element: <Ticket />,
                },
                {
                    path: "tickets",
                    element: <ComplaintTickets />,
                },
                {
                    path: "juniors",
                    element: <Juniors />,
                },
                {
                    path: "/salary",
                    element: <MentorSalaryManagement />,
                },
                {
                    path: "/role",
                    element: <RoleManagement />,
                },
                {
                    path: "*",
                    element: <NotFound />,
                },
            ],
        },
    ]);

    return (
        <RecoilRoot>
            <Toaster />
            <RouterProvider router={router} />
        </RecoilRoot>
    );
};

export default App;
