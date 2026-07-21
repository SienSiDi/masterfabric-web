"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function StoreHydrator() {
  const hydrateChat = useChatStore((s) => s.hydrate);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateChat();
  }, [hydrateAuth, hydrateChat]);

  return null;
}
