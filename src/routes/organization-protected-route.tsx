import { RoleEnum } from "@/database/model-enums";
import type { Donor, Organization, User } from "@/database/models";
import { Navigate } from "react-router";

interface OrganizationProtectedRouteProps {
  element: React.ReactNode;
  user: User | Organization | Donor;
  authenticated: boolean;
}

const OrganizationProtectedRoute: React.FC<OrganizationProtectedRouteProps> = ({
  element,
  user,
  authenticated,
}) => {
  const isAllowed = user.role.role == RoleEnum.organization;
  return isAllowed && authenticated ? (
    element
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};
export default OrganizationProtectedRoute;
