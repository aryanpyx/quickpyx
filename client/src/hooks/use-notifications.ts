import { useState, useEffect } from "react";

interface NotificationHook {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

export function useNotifications(): NotificationHook {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied";
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") return;
    
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported,
  };
}
