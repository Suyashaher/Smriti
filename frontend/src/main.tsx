import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { App } from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { initDatabase } from "@/db/init";
import { useUiStore } from "@/store/uiStore";
import "@/index.css";

registerSW({ immediate: true });

function Root() {
  const [ready, setReady] = useState(false);
  const dbError = useUiStore((s) => s.dbError);
  const setDbReady = useUiStore((s) => s.setDbReady);
  const setDbError = useUiStore((s) => s.setDbError);
  const setLocale = useUiStore((s) => s.setLocale);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const meta = await initDatabase();
        if (cancelled) return;
        await setLocale(meta.language);
        setDbReady(true);
        setDbError(null);
        setReady(true);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "IndexedDB failed";
        setDbError(message);
        setDbReady(false);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setDbError, setDbReady, setLocale]);

  if (!ready) {
    return <LoadingState />;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <ErrorState
          message={dbError}
          onRetry={() => {
            setReady(false);
            setDbError(null);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element missing");
}

createRoot(rootEl).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
