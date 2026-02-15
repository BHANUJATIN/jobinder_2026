"use client";

import { create } from "zustand";
import api from "@/lib/api";

const useTables = create((set, get) => ({
  tables: [],
  currentTable: null,
  loading: false,

  fetchTables: async (folderId) => {
    set({ loading: true });
    try {
      const params = folderId ? { folderId } : {};
      const { data } = await api.get("/tables", { params });
      set({ tables: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchTable: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/tables/${id}`);
      set({ currentTable: data, loading: false });
      return data;
    } catch {
      set({ loading: false });
    }
  },

  createTable: async (tableData) => {
    const { data } = await api.post("/tables", tableData);
    set({ tables: [...get().tables, data] });
    return data;
  },

  updateTable: async (id, tableData) => {
    const { data } = await api.put(`/tables/${id}`, tableData);
    set({
      tables: get().tables.map((t) => (t.id === id ? data : t)),
      currentTable: data,
    });
    return data;
  },

  deleteTable: async (id) => {
    await api.delete(`/tables/${id}`);
    set({ tables: get().tables.filter((t) => t.id !== id) });
  },

  runNow: async (id) => {
    const { data } = await api.post(`/tables/${id}/run-now`);
    return data;
  },

  updateConfig: async (id, configData) => {
    const { data } = await api.put(`/tables/${id}/config`, configData);
    return data;
  },
}));

export default useTables;
