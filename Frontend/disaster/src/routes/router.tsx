
import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/landing.page";
import SignUp from "../pages/auth/SignUp";

const Router = createBrowserRouter([
    {
        path:"/",
        element:<LandingPage />
    },
    {
        path:"/signup",
        element:<SignUp />
    }
]);
export default Router;