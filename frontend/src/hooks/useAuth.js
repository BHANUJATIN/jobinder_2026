"use client";

import { create } from "zustand";
import api from "@/lib/api";

const useAuth = create((set) => ({
  user: null,
  loading: true,

  init: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ loading: false });
        return;
      }
      const { data } = await api.get("/users/me");
      set({ user: data, loading: false });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ user: data.user });
    return data;
  },

  register: async (email, password, fullName, companyName) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      fullName,
      companyName,
    });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ user: data.user });
    return data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null });
    window.location.href = "/login";
  },

  updateUser: (user) => set({ user }),
}));

export default useAuth;
