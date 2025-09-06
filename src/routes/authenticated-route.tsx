import { Navigate } from "react-router";

interface AuthenticatedRouteProps {
  element: React.ReactNode;
  authenticated: boolean;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  element,
  authenticated,
}) => {
  return authenticated ? element : <Navigate to="/" replace />;
};
export default AuthenticatedRoute;
