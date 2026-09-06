import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "../pages/landing.page";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import DisasterDashboard from "../pages/dashboard.page";
import EmergencyResponse from "../pages/EmergencyResponse";
import Profile from "../pages/profile.page";
import LiveRiskMap from "../pages/liveRiskMap.page";
import AiAnalysisPage from "../pages/aiAnalysis.page";
import ProtectedRoute from "./ProtectedRoutes";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DisasterDashboard />,
      },
      {
        path: "/emergency-response",
        element: <EmergencyResponse />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/risk-map",
        element: <LiveRiskMap />,
      },
      {
        path: "/ai-analysis",
        element: <AiAnalysisPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default Router;