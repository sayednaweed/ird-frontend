import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.VITE_NOTIFICATION_API;
const socket = io(URL, {
  autoConnect: false,
  withCredentials: true, // ✅ SEND cookies like `access_token`
  secure: false, // ✅ false in localhost, true only in production HTTPS
});

export default socket;
