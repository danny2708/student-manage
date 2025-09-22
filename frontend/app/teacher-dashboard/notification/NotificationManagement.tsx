"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "../../../src/hooks/useNotification";

export default function NotificationManagement() {
  const { notifications, loading, error, fetchNotifications, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && fetchNotifications) fetchNotifications();
  }, [open, fetchNotifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-full hover:bg-gray-200/10 relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications && notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {notifications.filter((n) => !n.is_read).length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50 origin-top-right"
          >
            <div className="p-3 border-b font-semibold">Notifications</div>

            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div
                      key={n.notification_id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${!n.is_read ? "bg-gray-50" : ""}`}
                      onClick={() => markAsRead && markAsRead(n.notification_id)}
                    >
                      <div className="font-medium">{n.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.sent_at).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                )}
              </div>
            )}

            <div className="p-2 text-center border-t">
              <button className="text-sm text-cyan-600 hover:underline">View all</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
