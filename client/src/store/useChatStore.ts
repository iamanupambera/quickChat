import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { Conversation, useAuthStore } from "./useAuthStore";
import { AxiosError } from "axios";
import { MessageType as sendMessageType } from "../lib/validationSchema";

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

interface Message {
  conversation_id: number;
  status: MessageStatus;
  message_content: string | null;
  sent_at: Date;
  message_id: number;
  sender_id: number;
  message_type: MessageType;
  media_url: string | null;
}

interface ChatStore {
  messages: Message[];
  conversations: Conversation[];
  selectConversation: Conversation | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;

  getConversations: () => Promise<void>;
  getMessages: (conversation_id: number) => Promise<void>;
  sendMessage: (messageData: sendMessageType) => Promise<void>;
  subscribeToConversations: () => void;
  unsubscribeFromConversations: () => void;
  setSelectedConversation: (selectedConversation: Conversation | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  conversations: [],
  selectConversation: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getConversations: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/conversations");
      set({ conversations: res.data.response });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (conversation_id: number) => {
    set({ isMessagesLoading: true });
    const { subscribeToConversations } = get();
    try {
      subscribeToConversations();
      const res = await axiosInstance.get(`/messages/${conversation_id}`);
      set({ messages: res.data.response });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectConversation } = get();
    try {
      await axiosInstance.post(`/messages`, {
        conversation_id: selectConversation?.conversation_id,
        message: { ...messageData, sent_at: new Date() },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    }
  },

  subscribeToConversations: () => {
    const { selectConversation } = get();
    if (!selectConversation) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.send(
      JSON.stringify({
        action: "subscribe",
        payload: {
          channel: `message:new:${selectConversation.conversation_id}`,
        },
      })
    );

    socket.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      set({
        messages: [...get().messages, data],
      });
    };
  },

  unsubscribeFromConversations: () => {
    const { selectConversation } = get();

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          action: "unsubscribe",
          payload: {
            channel: `message:new:${selectConversation?.conversation_id}`,
          },
        })
      );
    };
  },

  setSelectedConversation: (selectConversation) => {
    if (!selectConversation) {
      get().unsubscribeFromConversations();
    }
    set({ selectConversation });
  },
}));
