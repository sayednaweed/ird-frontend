import { getAuthRouter } from "./routes/routes";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";

export default function App() {
  const { user, loading, authenticated } = useGeneralAuthState();
  if (loading) return;
  let routes = null;

  routes = getAuthRouter(user, authenticated);
  // else routes = getAuthRouter(user, authenticated);

  return routes;
}
