import { useEffect } from "react";
import { Bell, CheckCheck, ChevronRight, X } from "lucide-react";
import { useNotificationStore } from "@/features/notifications/stores/notification-store";
import { Link } from "react-router-dom";


function formatTimeAgo(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return date.toLocaleDateString("vi-VN");
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-ink-primary">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    fetchNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    open,
    close,
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const handleToggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-full p-2 text-[#181c1c] transition-colors hover:text-primary"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 min-w-[18px] rounded-full bg-red-600 px-1 text-center text-[10px] font-bold text-white ring-2 ring-[#f7faf8]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[360px] rounded-2xl border border-botanical-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-botanical-border px-md py-sm">
            <p className="text-body-sm font-black text-ink-primary">Thông báo</p>
            <div className="flex items-center gap-xs">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-xs rounded-full px-xs py-1 text-xs font-bold text-primary hover:bg-soft-mint"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Đọc tất cả
                </button>
              ) : null}
              <button
                type="button"
                onClick={close}
                className="rounded-full p-1 text-sage-secondary transition-colors hover:text-ink-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-sm p-md">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-surface-container-lowest" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-md text-center text-label-caption text-sage-secondary">
                Không có thông báo mới.
              </p>
            ) : (
              <div className="divide-y divide-botanical-border">
                {notifications.map((notification) => {
                  const href =
                    notification.data?.booking_id && notification.data?.code
                      ? `/app/appointments`
                      : notification.data?.profile_id
                        ? `/admin/therapists/${notification.data.profile_id}`
                        : null;

                  const content = (
                    <div
                      className={`flex gap-md px-md py-sm transition-colors ${!notification.is_read ? "bg-soft-mint/40 hover:bg-soft-mint/60" : "hover:bg-surface-container-lowest"}`}
                    >
                      <div className="mt-xs h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-sm">
                          <p className="text-body-sm font-black text-ink-primary">{renderBold(notification.title)}</p>
                          <span className="text-label-caption text-sage-secondary whitespace-nowrap">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="mt-xs truncate text-body-sm text-sage-secondary">{renderBold(notification.message)}</p>
                        {!notification.is_read ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="mt-xs text-xs font-bold text-primary hover:underline"
                          >
                            Đánh dấu đã đọc
                          </button>
                        ) : null}
                      </div>
                      {href ? <ChevronRight className="h-4 w-4 shrink-0 text-sage-secondary" /> : null}
                    </div>
                  );

                  if (href) {
                    return (
                      <Link
                        key={notification.id}
                        to={href}
                        className="block"
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                          close();
                        }}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={notification.id}
                      className="block"
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
