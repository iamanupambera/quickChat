import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { LoginType, RegisterType } from "../lib/validationSchema";
import { AxiosError } from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "ws://localhost:8080" : "/";

interface User {
  user_id: number;
  name: string;
  password: string;
  phone_number: string;
  token: string;
  about: string | null;
  profile_picture_url: string | null;
  createdAt: string;
}

interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: Array<unknown>;
  socket: WebSocket | null;
  checkAuth: () => Promise<void>;
  signup: (data: RegisterType) => Promise<void>;
  login: (data: LoginType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<RegisterType>) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
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
      set({ authUser: res.data.response });
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
      toast.success("Account created successfully");
      get().connectSocket();
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
      toast.success("Logged in successfully");
      get().connectSocket();
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
      await axiosInstance.post("/users/logout");
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

  // Establish a native WebSocket connection.
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return;

    // Check if a socket already exists and is either open or connecting.
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    // Create a new WebSocket connection with the token as a query parameter.
    const newSocket = new WebSocket(
      `${BASE_URL}?authHeader=Bearer ${authUser.token}`
    );

    // Set up event handlers using the native WebSocket API.
    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Assume that your server sends messages with a structure like:
        // { event: "getOnlineUsers", userIds: [...] }
        if (data.event === "getOnlineUsers") {
          set({ onlineUsers: data.userIds });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    set({ socket: newSocket });
  },

  // Disconnect the native WebSocket connection.
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
}));
