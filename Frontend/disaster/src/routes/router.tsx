
import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "../pages/landing.page";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import DisasterDashboard from "../pages/dashboard.page";
import EmergencyResponse from "../pages/EmergencyResponse";
import AiAnalysis from "../pages/aiAnalysis.page";

const Router = createBrowserRouter([
    {
        path:"/",
        element:<LandingPage />
    },
    {
        path:"/about",
        element:<Navigate to="/#about" replace />
    },
    {
        path:"/contact",
        element:<Navigate to="/#contact" replace />
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
    },
    {
        path:"/ai-analysis",
        element:<AiAnalysis />
    }
]);
export default Router;