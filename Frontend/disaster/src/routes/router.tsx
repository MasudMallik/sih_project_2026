
import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/landing.page";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";

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
    }
]);
export default Router;