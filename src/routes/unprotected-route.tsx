import { Navigate } from "react-router";

interface ProtectedRouteProps {
  element: React.ReactNode;
  authenticated: boolean;
}

const UnProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  authenticated,
}) => {
  return !authenticated ? element : <Navigate to="/" replace />;
};
export default UnProtectedRoute;
