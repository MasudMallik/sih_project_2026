import { Navigate, Outlet } from 'react-router';
import { getGovtUser } from '../services/govtAuth.service';

export function ProtectedGovtRoute() {
  const user = getGovtUser();
  if (!user) {
    return <Navigate to="/govt/login" replace />;
  }
  return <Outlet />;
}

export default ProtectedGovtRoute;
