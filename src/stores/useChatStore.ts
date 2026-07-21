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
  hydrate: () => void;
}

let msgCounter = 0;

const CHAT_KEY = "mf_chat_v1";

interface PersistedChat {
  sessionId: string | null;
  modelId: string | null;
  modelHash: string | null;
  engineReady: boolean;
}

function loadPersistedChat(): PersistedChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedChat;
  } catch {
    return null;
  }
}

function persistChat(s: PersistedChat) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function saveCurrent() {
  const { sessionId, modelId, modelHash, engineReady } = useChatStore.getState();
  persistChat({ sessionId, modelId, modelHash, engineReady });
}

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

  setSessionId: (id) => { set({ sessionId: id }); saveCurrent(); },
  setModelId: (id) => { set({ modelId: id }); saveCurrent(); },
  setModelHash: (hash) => { set({ modelHash: hash }); saveCurrent(); },
  setLoading: (v) => set({ loading: v }),
  setStreaming: (v) => set({ streaming: v }),
  setEngineReady: (v) => { set({ engineReady: v }); saveCurrent(); },
  setLoadProgress: (p) => set({ loadProgress: p }),
  setLoadStatus: (s) => set({ loadStatus: s }),

  markScored: (eventId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.eventId === eventId ? { ...m, scored: true } : m
      ),
    })),

  clear: () => {
    set({
      messages: [],
      sessionId: null,
      loading: false,
      streaming: false,
    });
    persistChat({ sessionId: null, modelId: null, modelHash: null, engineReady: false });
  },

  hydrate: () => {
    const p = loadPersistedChat();
    if (p) {
      set({
        sessionId: p.sessionId,
        modelId: p.modelId,
        modelHash: p.modelHash,
        engineReady: p.engineReady,
      });
    }
  },
}));

export function nextMsgId(): string {
  return `msg_${Date.now()}_${++msgCounter}`;
}
