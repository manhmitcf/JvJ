import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X, ChevronLeft } from "lucide-react";
import { useConversationStore } from "@/features/conversation/stores/conversation-store";
import { useAuthStore } from "@/features/auth/auth-store";
import { cn } from "@/utils/cn";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  return `${days} ngày`;
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => (part[0] ?? "").toUpperCase()).join("") || "?";
}

function Avatar({ src, name, size = 10 }: { src?: string; name: string; size?: number }) {
  const hasImage = Boolean(src?.trim());
  return (
    <div
      className={`h-${size} w-${size} shrink-0 rounded-full border-2 border-soft-mint overflow-hidden bg-soft-mint text-primary`}
    >
      {hasImage ? (
        <img src={src!.trim()} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className={`flex h-full w-full items-center justify-center text-[${size === 10 ? 10 : size === 12 ? 12 : 10}px] font-black leading-none`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

function ConversationList({
  onSelect,
  activeId,
  currentUserId,
}: {
  onSelect: (id: string) => void;
  activeId?: string;
  currentUserId: string;
}) {
  const { conversations, isLoading } = useConversationStore();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-botanical-border border-t-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <MessageSquare className="h-16 w-16 text-surface-container" />
        <p className="mt-4 font-black text-sage-secondary">Chưa có cuộc hội thoại nào</p>
        <p className="mt-1 px-8 text-sm text-muted-text">
          Bắt đầu nhắn tin với kỹ thuật viên từ trang hồ sơ của họ.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      {conversations.map((conv) => {
        const otherParty =
          conv.customer.id === currentUserId ? conv.therapist : conv.customer;
        return (
          <button
            key={conv.id}
            onClick={() => void onSelect(conv.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all",
              activeId === conv.id ? "bg-primary/10" : "hover:bg-surface-container-low"
            )}
          >
            <div className="relative shrink-0">
              <Avatar src={otherParty.avatar_url} name={otherParty.full_name} size={12} />
              {conv.unread_count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                  {conv.unread_count > 9 ? "9+" : conv.unread_count}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm font-black",
                    conv.unread_count > 0 ? "text-ink-primary" : "text-sage-secondary"
                  )}
                >
                  {otherParty.full_name}
                </p>
                {conv.last_message_at && (
                  <span className="shrink-0 text-[10px] font-semibold text-muted-text">
                    {formatTime(conv.last_message_at)}
                  </span>
                )}
              </div>
              {conv.last_message_preview && (
                <p
                  className={cn(
                    "truncate text-xs",
                    conv.unread_count > 0 ? "font-semibold text-ink-primary" : "text-muted-text"
                  )}
                >
                  {conv.last_message_preview}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatView({ onBack }: { onBack: () => void }) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id ?? "";

  const { activeConversation, isSending, sendMessage, markRead } = useConversationStore();

  useEffect(() => {
    if (activeConversation) {
      void markRead(activeConversation.id);
    }
  }, [activeConversation, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !activeConversation || isSending) return;
    setInputValue("");
    try {
      await sendMessage(activeConversation.id, content);
    } catch {
      setInputValue(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!activeConversation) return null;

  const otherParty =
    activeConversation.customer.id === currentUserId
      ? activeConversation.therapist
      : activeConversation.customer;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-botanical-border px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-xl p-2 transition-colors hover:bg-surface-container-low"
        >
          <ChevronLeft className="h-5 w-5 text-sage-secondary" />
        </button>
        <Avatar src={otherParty.avatar_url} name={otherParty.full_name} size={10} />
        <div>
          <p className="font-black text-ink-primary">{otherParty.full_name}</p>
          <p className="text-xs font-semibold text-muted-text">Kỹ thuật viên</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!activeConversation.messages || activeConversation.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="h-12 w-12 text-surface-container" />
            <p className="mt-3 font-black text-sage-secondary">Chưa có tin nhắn nào</p>
            <p className="mt-1 text-sm text-muted-text">
              Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeConversation.messages.map((msg) => {
              const isMine = msg.sender.id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-3xl px-4 py-2.5 text-sm",
                      isMine
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md bg-surface-container-low text-ink-primary"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isMine ? "text-right text-white/60" : "text-muted-text"
                      )}
                    >
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-botanical-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-botanical-border bg-warm-bg px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!inputValue.trim() || isSending}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-hover disabled:opacity-40"
          >
            {isSending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const [showChat, setShowChat] = useState(false);
  const { conversations, activeConversation, error, isOpen, open, close, setActiveConversation, fetchConversations, fetchConversation } = useConversationStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isOpen && user && (user.role === "customer" || user.role === "therapist")) {
      void fetchConversations();
    }
  }, [isOpen, user, fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      setShowChat(true);
    }
  }, [activeConversation]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  if (!user || (user.role !== "customer" && user.role !== "therapist")) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          open();
          setShowChat(false);
          setActiveConversation(null);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl active:scale-95"
        aria-label="Mở tin nhắn"
      >
        <MessageSquare className="h-6 w-6 text-white" />
        {totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              close();
              setShowChat(false);
            }}
          />

          <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-botanical-border bg-soft-mint px-4 py-4">
              <h2 className="text-lg font-black text-ink-primary">
                {showChat ? "Tin nhắn" : "Hội thoại"}
              </h2>
              <button
                onClick={() => {
                  close();
                  setShowChat(false);
                }}
                className="rounded-xl p-2 transition-colors hover:bg-surface-container-low"
              >
                <X className="h-5 w-5 text-sage-secondary" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {showChat ? (
              <ChatView onBack={() => setShowChat(false)} />
            ) : (
              <ConversationList
                onSelect={(id) => {
                  void fetchConversation(id);
                  setShowChat(true);
                }}
                activeId={activeConversation?.id}
                currentUserId={user.id}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function openChatWithTherapist(therapistId: string) {
  const store = useConversationStore.getState();
  (async () => {
    try {
      const convId = await store.startConversation(therapistId);
      await store.fetchConversations();
      await store.fetchConversation(convId);
      store.open();
    } catch (err) {
      console.error("openChatWithTherapist failed:", err);
      const message = err instanceof Error ? err.message : "Không thể mở cuộc hội thoại. Vui lòng đăng nhập.";
      alert(message);
    }
  })();
}
