import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { LoginType, RegisterType } from "../lib/validationSchema";
import { AxiosError } from "axios";
import { clearUser, getToken, setUser } from "./localStorage";

const BASE_URL = "ws://localhost:8080";

export interface User {
  user_id: number;
  name: string;
  phone_number: string;
  token: string;
  about: string | null;
  profile_picture_url: string | null;
  createdAt: string;
}

export interface Conversation {
  type: string;
  conversation_id: number;
  last_message_id: number | null;
  order_date: Date;
  created_at: Date;
}

interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: Array<Conversation>;
  socket: WebSocket | null;
  checkAuth: () => Promise<void>;
  signup: (data: RegisterType) => Promise<void>;
  login: (data: LoginType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<RegisterType>) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  getAllConversation: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/users/profile");
      set({ authUser: { ...res.data.response, token: getToken() } });
      await get().getAllConversation();
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/users/register", data);
      console.log(res.data.response);
      set({ authUser: res.data.response });
      setUser(res.data.response);
      toast.success("Account created successfully");
      await get().getAllConversation();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/users/login", data);
      set({ authUser: res.data.response });
      setUser(res.data.response);
      toast.success("Logged in successfully");
      await get().getAllConversation();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      // await axiosInstance.post("/users/logout");
      clearUser();
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/users/update-profile", data);
      set({ authUser: res.data.response });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message);
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return;

    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const newSocket = new WebSocket(
      `${BASE_URL}?authHeader=Bearer ${authUser.token}`
    );

    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      socket.close();
    }
  },

  getAllConversation: async () => {
    try {
      const res = await axiosInstance.get("/conversations");
      set({ onlineUsers: res.data.response });
    } catch (error) {
      console.log("Error in all conversation:", error);
      set({ onlineUsers: [] });
    }
  },
}));
