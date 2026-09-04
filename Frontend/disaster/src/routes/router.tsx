
import { createBrowserRouter } from "react-router";
import LandingPage from "../pages/landing.page";

const Router=createBrowserRouter([
    {
        path:"/",
        element:<LandingPage />
    }
])
export default Router;