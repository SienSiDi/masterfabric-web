import { useQuery } from "@tanstack/react-query";
import { getMonitoring } from "@/lib/api/llm";
import { useAuthStore } from "@/stores/useAuthStore";

export function useMonitoring() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles.includes("admin");
  return useQuery({
    queryKey: ["monitoring"],
    queryFn: getMonitoring,
    enabled: !!isAdmin,
    staleTime: 15_000,
  });
}
