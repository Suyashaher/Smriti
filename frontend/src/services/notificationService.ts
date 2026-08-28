import { playReminderChime } from "./audioService";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }
  
  if (Notification.permission === "granted") {
    return "granted";
  }

  return await Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

export async function sendNativeNotification(title: string, options?: NotificationOptions): Promise<void> {
  // Always play audio fallback regardless of native notification success
  playReminderChime();

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  // Try service worker registration first for PWA consistency
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
      return;
    } catch (e) {
      console.warn("Service worker notification failed, falling back to basic Notification", e);
    }
  }

  // Fallback to basic notification
  new Notification(title, options);
}
