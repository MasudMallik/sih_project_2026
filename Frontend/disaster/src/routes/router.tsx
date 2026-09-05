
import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/landing.page";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import DisasterDashboard from "../pages/dashboard.page";
import EmergencyResponse from "../pages/EmergencyResponse";

const Router = createBrowserRouter([
    {
        path:"/",
        element:<LandingPage />
    },
    {
        path:"/signup",
        element:<SignUp />
    },
    {
        path:"/login",
        element:<Login />
        },
        {
        path:"/dashboard",
        element:<DisasterDashboard />
    },
    {
        path:"/emergency-response",
        element:<EmergencyResponse />
    }
]);
export default Router;