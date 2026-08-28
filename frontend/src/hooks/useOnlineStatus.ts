import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";

export function useOnlineStatus(): boolean {
  const online = useUiStore((s) => s.online);
  const setOnline = useUiStore((s) => s.setOnline);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [setOnline]);

  return online;
}
