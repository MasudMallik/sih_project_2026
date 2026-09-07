import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "../pages/landing.page";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import DisasterDashboard from "../pages/dashboard.page";
import EmergencyResponse from "../pages/EmergencyResponse";
import Profile from "../pages/profile.page";
import LiveRiskMap from "../pages/liveRiskMap.page";
import AiAnalysisPage from "../pages/aiAnalysis.page";
import LandslideRiskPage from "../pages/landslide-risk.page";
import ProtectedRoute from "./ProtectedRoutes";
import GovtLogin from "../pages/govt/GovtLogin";
import GovtSignup from "../pages/govt/GovtSignup";
import GovtDashboard from "../pages/govt/GovtDashboard";
import GovtProfile from "../pages/govt/GovtProfile";
import GovtReports from "../pages/govt/GovtReports";
import ProtectedGovtRoute from "./ProtectedGovtRoute";

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
    path: "/govt/login",
    element: <GovtLogin />,
  },
  {
    path: "/govt/signup",
    element: <GovtSignup />,
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
      {
        path: "/landslide-risk",
        element: <LandslideRiskPage />,
      },
    ],
  },
  {
    element: <ProtectedGovtRoute />,
    children: [
      {
        path: "/govt/dashboard",
        element: <GovtDashboard />,
      },
      {
        path: "/govt/profile",
        element: <GovtProfile />,
      },
      {
        path: "/govt/reports",
        element: <GovtReports />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default Router;