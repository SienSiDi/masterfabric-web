import { useQuery } from "@tanstack/react-query";
import { me } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export function useMe() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["me"],
    queryFn: me,
    enabled: !!user,
    staleTime: 60_000,
  });
}
