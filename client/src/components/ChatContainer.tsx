import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

export default function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectConversation,
    subscribeToConversations,
    unsubscribeFromConversations,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectConversation) {
      return;
    }
    getMessages(selectConversation.conversation_id);

    subscribeToConversations();

    return () => unsubscribeFromConversations();
  }, [
    getMessages,
    subscribeToConversations,
    unsubscribeFromConversations,
    selectConversation,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.message_id}
            className={`chat ${
              message.sender_id === authUser?.user_id
                ? "chat-end"
                : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.sender_id === authUser?.user_id
                      ? authUser.profile_picture_url || "/avatar.png"
                      : "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.sent_at)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.media_url && (
                <img
                  src={message.media_url}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.message_content && <p>{message.message_content}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
}
