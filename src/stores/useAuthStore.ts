"use client";

import { create } from "zustand";
import type { User } from "@/lib/api/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (t: { accessToken: string; refreshToken: string; expiresIn: number }) => void;
  setSession: (s: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => void;
  clear: () => void;
  hydrate: () => void;
}

const SESSION_KEY = "mf_auth_session_v1";

interface PersistedSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

function loadPersisted(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function persistSession(s: PersistedSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (s) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  hydrated: false,

  setUser: (user) => set({ user }),

  setTokens: ({ accessToken, refreshToken, expiresIn }) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    set({ accessToken, refreshToken, expiresAt });
    const current = useAuthStore.getState().user;
    if (current) {
      persistSession({ user: current, accessToken, refreshToken, expiresAt });
    }
  },

  setSession: ({ user, accessToken, refreshToken, expiresIn }) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    set({ user, accessToken, refreshToken, expiresAt, hydrated: true });
    persistSession({ user, accessToken, refreshToken, expiresAt });
  },

  clear: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      hydrated: true,
    });
    persistSession(null);
  },

  hydrate: () => {
    if (useAuthStore.getState().hydrated) return;
    const p = loadPersisted();
    if (p) {
      if (p.expiresAt && p.expiresAt > Date.now()) {
        set({
          user: p.user,
          accessToken: p.accessToken,
          refreshToken: p.refreshToken,
          expiresAt: p.expiresAt,
          hydrated: true,
        });
        return;
      }
      persistSession(null);
    }
    set({ hydrated: true });
  },
}));
