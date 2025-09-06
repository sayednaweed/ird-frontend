// useSocketEvent.ts
import socket from "@/lib/socket/socket";
import { useEffect } from "react";

export const useSocketEvent = (
  eventName: string,
  handler: (data: any) => void
) => {
  useEffect(() => {
    socket.on(eventName, handler);
    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
};
