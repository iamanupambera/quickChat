import { User } from "./useAuthStore";

export function getToken(): string | null {
  const data = localStorage.getItem("user");
  if (!data) return data;
  const user: User = JSON.parse(data);
  return user?.token || "";
}

export function setUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): User | null {
  const data = localStorage.getItem("user");
  if (!data) return null;
  return JSON.parse(data);
}

export function clearUser() {
  localStorage.removeItem("user");
}
