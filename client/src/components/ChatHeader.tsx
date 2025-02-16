import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

export default function ChatHeader() {
  const { selectConversation, setSelectedConversation } = useChatStore();
  // const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={ "/avatar.png"}
                alt={"image"}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectConversation?.last_message_id}</h3>
            <p className="text-sm text-base-content/70">
              {/* {onlineUsers.includes(selectConversation)
                ? "Online"
                : "Offline"} */}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedConversation(null)}>
          <X />
        </button>
      </div>
    </div>
  );
}
