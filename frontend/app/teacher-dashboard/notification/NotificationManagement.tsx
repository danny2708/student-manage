"use client"

import { useEffect, useState } from "react"
import { Bell, Check, X, Clock, AlertCircle, Info, CheckCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useNotifications } from "../../../src/hooks/useNotification"
import { BaseButton } from "../../../components/ui/base-button"
import { cn } from "../../../src/lib/utils"

interface NotificationItem {
  notification_id: string
  content: string
  sent_at: string
  is_read: boolean
  type?: "info" | "success" | "warning" | "error"
  priority?: "low" | "medium" | "high"
}

export default function NotificationManagement() {
  const { notifications, loading, error, fetchNotifications, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    if (open && fetchNotifications) fetchNotifications()
  }, [open, fetchNotifications])

  const unreadCount = notifications?.filter((n: NotificationItem) => !n.is_read).length || 0

  const filteredNotifications =
    notifications?.filter((n: NotificationItem) => {
      if (filter === "unread") return !n.is_read
      if (filter === "read") return n.is_read
      return true
    }) || []

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertCircle
      case "error":
        return X
      default:
        return Info
    }
  }

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case "success":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 mt-2 w-96 glass-card z-50 origin-top-right"
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <BaseButton
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          notifications?.forEach((n: NotificationItem) => {
                            if (!n.is_read && markAsRead) markAsRead(n.notification_id)
                          })
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark all read
                      </BaseButton>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="p-1 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                  {(["all", "unread", "read"] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={cn(
                        "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                        filter === filterType
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      {filterType === "unread" && unreadCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                        <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                          <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-medium">Failed to load notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">
                      {filter === "unread"
                        ? "No unread notifications"
                        : filter === "read"
                          ? "No read notifications"
                          : "No notifications"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredNotifications.map((notification: NotificationItem) => {
                      const IconComponent = getNotificationIcon(notification.type)
                      const iconColor = getNotificationColor(notification.type)
                      const priorityColor = getPriorityIndicator(notification.priority)

                      return (
                        <motion.div
                          key={notification.notification_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "p-4 cursor-pointer transition-all duration-200 hover:bg-accent/30 group",
                            !notification.is_read && "bg-accent/10",
                          )}
                          onClick={() => markAsRead && markAsRead(notification.notification_id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg bg-muted/50", iconColor)}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={cn(
                                    "text-sm leading-relaxed",
                                    !notification.is_read ? "font-medium text-foreground" : "text-muted-foreground",
                                  )}
                                >
                                  {notification.content}
                                </p>
                                {notification.priority && (
                                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-2", priorityColor)} />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.sent_at).toLocaleString()}
                                </span>
                                {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {filteredNotifications.length > 0 && (
                <div className="p-3 border-t border-border/50 text-center">
                  <BaseButton variant="ghost" size="sm" className="text-sm">
                    View all notifications
                  </BaseButton>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
