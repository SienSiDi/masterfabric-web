"use client";

import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  eventId?: string;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  scored?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  modelId: string | null;
  modelHash: string | null;
  loading: boolean;
  streaming: boolean;
  engineReady: boolean;
  loadProgress: number;
  loadStatus: string;
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistant: (content: string) => void;
  setSessionId: (id: string) => void;
  setModelId: (id: string) => void;
  setModelHash: (hash: string) => void;
  setLoading: (v: boolean) => void;
  setStreaming: (v: boolean) => void;
  setEngineReady: (v: boolean) => void;
  setLoadProgress: (p: number) => void;
  setLoadStatus: (s: string) => void;
  markScored: (eventId: string) => void;
  clear: () => void;
}

let msgCounter = 0;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  sessionId: null,
  modelId: null,
  modelHash: null,
  loading: false,
  streaming: false,
  engineReady: false,
  loadProgress: 0,
  loadStatus: "",

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content };
      }
      return { messages: msgs };
    }),

  setSessionId: (id) => set({ sessionId: id }),
  setModelId: (id) => set({ modelId: id }),
  setModelHash: (hash) => set({ modelHash: hash }),
  setLoading: (v) => set({ loading: v }),
  setStreaming: (v) => set({ streaming: v }),
  setEngineReady: (v) => set({ engineReady: v }),
  setLoadProgress: (p) => set({ loadProgress: p }),
  setLoadStatus: (s) => set({ loadStatus: s }),

  markScored: (eventId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.eventId === eventId ? { ...m, scored: true } : m
      ),
    })),

  clear: () =>
    set({
      messages: [],
      sessionId: null,
      loading: false,
      streaming: false,
    }),
}));

export function nextMsgId(): string {
  return `msg_${Date.now()}_${++msgCounter}`;
}
