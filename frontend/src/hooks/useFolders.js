"use client";

import { create } from "zustand";
import api from "@/lib/api";

const useFolders = create((set, get) => ({
  folders: [],
  loading: false,

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/folders");
      set({ folders: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createFolder: async (folderData) => {
    const { data } = await api.post("/folders", folderData);
    set({ folders: [...get().folders, data] });
    return data;
  },

  updateFolder: async (id, folderData) => {
    const { data } = await api.put(`/folders/${id}`, folderData);
    set({
      folders: get().folders.map((f) => (f.id === id ? data : f)),
    });
    return data;
  },

  deleteFolder: async (id) => {
    await api.delete(`/folders/${id}`);
    set({ folders: get().folders.filter((f) => f.id !== id) });
  },
}));

export default useFolders;
