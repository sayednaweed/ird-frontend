import { setToken } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth/auth-store";
import axios from "axios";

// import secureLocalStorage from "react-secure-storage";
const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1/`,
});
axiosClient.defaults.withCredentials = true;

axiosClient.interceptors.request.use((config) => {
  return config;
});
let refreshTokenPromise: any = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle 403 Unauthorized
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      // If refreshTokenPromise is already running, wait for it
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshAccessToken();
      }
      try {
        await refreshTokenPromise;
        refreshTokenPromise = null; // Reset promise after completion

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // window.location.href = `/auth/${conf?.type}/login`; // Redirect to login
        // return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export async function refreshAccessToken() {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/refresh-token`,
      {}, // Request body, usually empty, but can be filled if needed
      {
        withCredentials: true, // Ensure credentials (cookies) are included
      }
    );
    useAuthStore.setState({
      token: response.data?.access_token,
    });
    setToken({
      type: response.data.type.toLowerCase(),
    });
  } catch (error: any) {
    throw error;
  }
  return true;
}
export default axiosClient;
