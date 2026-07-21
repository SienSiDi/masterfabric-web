import { useQuery } from "@tanstack/react-query";
import { listSessions } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export function useSessions() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["sessions"],
    queryFn: listSessions,
    enabled: !!user,
    staleTime: 30_000,
  });
}
