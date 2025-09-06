import { create } from "zustand";
import axiosClient from "@/lib/axois-client";
import {
  getConfiguration,
  removeToken,
  returnPermissionsMap,
  setToken,
} from "@/lib/utils";
import type { User, Donor, Organization } from "@/database/models";

type AuthUser = User;

interface AuthStore {
  user: AuthUser | Donor | Organization;
  authenticated: boolean;
  token?: string;
  loading: boolean;
  loginUser: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<any>;
  logoutUser: () => Promise<void>;
  setUser: (user: AuthUser | Donor | Organization) => void;
  loginOrganization: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<any>;
  logoutOrganization: () => Promise<void>;
  loginDonor: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<any>;
  logoutDonor: () => Promise<void>;
  loadUser: () => Promise<void>;
}

// Shared init user
const initUser: AuthUser = {
  id: "",
  full_name: "",
  username: "",
  email: "",
  profile: "",
  role: { role: 1, name: "super" },
  job: "",
  contact: "",
  division: "",
  created_at: "",
  gender: "",
  permissions: new Map(),
  registration_number: "",
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: initUser,
  authenticated: false,
  loading: true,

  loginUser: async (email, password, rememberMe) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await axiosClient.post("auth-user", formData);
      if (response.status === 200) {
        const user = response.data.user as User;
        user.permissions = returnPermissionsMap(response.data?.permissions);

        if (rememberMe) {
          setToken({ type: "user" });
        }

        set({
          user,
          authenticated: true,
          loading: false,
          token: response.data?.access_token,
        });
      }
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  logoutUser: async () => {
    try {
      await axiosClient.post("auth-logout");
    } catch (error) {
      console.error(error);
    }
    removeToken();
    set({ user: initUser, authenticated: false, loading: false });
  },

  loadUser: async () => {
    const config = getConfiguration();

    const type = config?.type ? config?.type : "user";
    try {
      const response = await axiosClient.get(`auth-${type}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        const user = response.data.user;
        user.permissions = returnPermissionsMap(response.data?.permissions);
        set({
          user,
          authenticated: true,
          loading: false,
          token: response.data?.access_token,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error(error);
      removeToken();
      set({ user: initUser, authenticated: false, loading: false });
    }
  },
  loginOrganization: async (email, password, rememberMe) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await axiosClient.post("auth-organization", formData);
      if (response.status === 200) {
        const user = response.data.user as Organization;
        user.permissions = returnPermissionsMap(response.data?.permissions);

        if (rememberMe) {
          setToken({ type: "organization" });
        }

        set({
          user,
          authenticated: true,
          loading: false,
          token: response.data?.access_token,
        });
      }
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  logoutOrganization: async () => {
    try {
      await axiosClient.post("organization/auth-logout");
    } catch (error) {
      console.error(error);
    }
    removeToken();
    set({ user: initUser, authenticated: false, loading: false });
  },
  loginDonor: async (email, password, rememberMe) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await axiosClient.post("auth-donor", formData);
      if (response.status === 200) {
        const user = response.data.user as Organization;
        user.permissions = returnPermissionsMap(response.data?.permissions);

        if (rememberMe) {
          setToken({ type: "donor" });
        }

        set({
          user,
          authenticated: true,
          loading: false,
          token: response.data?.access_token,
        });
      }
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  logoutDonor: async () => {
    try {
      await axiosClient.post("donor/auth-logout");
    } catch (error) {
      console.error(error);
    }
    removeToken();
    set({ user: initUser, authenticated: false, loading: false });
  },
  setUser: (user: AuthUser | Organization | Donor) => {
    set({ user });
  },
}));
