import { createRoot } from "react-dom/client";
import "./index.css";
import AppProvider from "@/providers/app-provider.tsx";
import "@/lib/i18n/i18n.ts";
import { ThemeProvider } from "@/providers/theme-provider.tsx";
import React, { Suspense } from "react";
import { GlobalStateProvider } from "@/context/GlobalStateContext";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
const LazyApp = React.lazy(() => import("@/App.tsx"));
import { BrowserRouter } from "react-router";
import "react-international-phone/style.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <AppProvider>
      <Suspense
        fallback={
          <div className="h-screen bg-secondary flex justify-center items-center">
            <NastranSpinner />
          </div>
        }
      >
        <GlobalStateProvider>
          <BrowserRouter>
            <LazyApp />
          </BrowserRouter>
        </GlobalStateProvider>
      </Suspense>
    </AppProvider>
  </ThemeProvider>
);
