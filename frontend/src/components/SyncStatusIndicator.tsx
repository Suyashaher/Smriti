import { useUiStore } from "@/store/uiStore";

export function SyncStatusIndicator() {
  const { online, syncStatus, backendAvailable } = useUiStore();

  if (!online) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200" title="You are offline. Data is saved on device.">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        Offline
      </div>
    );
  }

  if (!backendAvailable) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200" title="Connecting to server...">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        Connecting...
      </div>
    );
  }

  if (syncStatus === "syncing") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
        <span className="w-2 h-2 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
        Syncing...
      </div>
    );
  }

  if (syncStatus === "error") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        Sync Error
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      Saved
    </div>
  );
}
