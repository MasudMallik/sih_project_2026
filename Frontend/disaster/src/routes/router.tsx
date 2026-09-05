
import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/landing.page";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import DisasterDashboard from "../pages/dashboard.page";

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
    }
]);
export default Router;