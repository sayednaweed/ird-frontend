import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { Toaster } from "@/components/ui/sonner";
import { useDirectionChange } from "@/lib/i18n/use-direction-change";
import socket from "@/lib/socket/socket";
import { useAuthStore } from "@/stores/auth/auth-store";
import { lazy, useEffect } from "react";
const GlobalDownloader = lazy(
  () => import("@/components/custom-ui/download-manager/GlobalDownloader")
);
export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useDirectionChange();
  const loadUser = useAuthStore((state) => state.loadUser);
  const loading = useAuthStore((state) => state.loading);
  const token = useAuthStore((state) => state.token);

  function onConnect() {
    console.log("onConnect");
  }

  function onDisconnect() {
    console.log("onDisconnect");
  }
  useEffect(() => {
    loadUser();
  }, []);
  useEffect(() => {
    if (!loading && token && !socket.connected) {
      if (!socket.connected) {
        socket.auth = { token: token };
        socket.connect();
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
      }
    }
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [token, loading]);
  if (loading)
    return (
      <div className="h-screen bg-secondary flex justify-center items-center">
        <NastranSpinner />
      </div>
    );

  return (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
      <GlobalDownloader />
    </>
  );
}
