import type { Donor, Organization, User } from "@/database/models";
import { useAuthStore } from "@/stores/auth/auth-store";

export const useUserAuthState = () => {
  const { user, authenticated, loading, loginUser, logoutUser, setUser } =
    useAuthStore();

  return {
    user: user as User,
    authenticated,
    loading,
    loginUser,
    logoutUser,
    setUser,
  };
};

export const useOrganizationAuthState = () => {
  const {
    user,
    authenticated,
    loading,
    setUser,
    loginOrganization,
    logoutOrganization,
  } = useAuthStore();

  return {
    user: user as Organization,
    authenticated,
    loading,
    setUser,
    loginOrganization,
    logoutOrganization,
  };
};
export const useDonorAuthState = () => {
  const { user, authenticated, loading, setUser, loginDonor, logoutDonor } =
    useAuthStore();

  return {
    user: user as Donor,
    authenticated,
    loading,
    setUser,
    loginDonor,
    logoutDonor,
  };
};
export const useGeneralAuthState = useAuthStore;
