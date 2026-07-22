"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Film, BookOpen, MessageSquare, Heart, TrendingUp } from "lucide-react";
import { useMediaStore } from "@/stores/useMediaStore";
import { useMemo } from "react";

function useStats() {
  const films = useMediaStore((s) => s.films);
  const books = useMediaStore((s) => s.books);
  const discussions = useMediaStore((s) => s.discussions);
  return useMemo(() => {
    const genreCount = new Map<string, number>();
    films.forEach((f) => f.genre.forEach((g) => genreCount.set(g, (genreCount.get(g) || 0) + 1)));
    books.forEach((b) => b.genre.forEach((g) => genreCount.set(g, (genreCount.get(g) || 0) + 1)));
    const topGenres = Array.from(genreCount.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const recentActivity = [
      ...films.map((f) => ({ type: "film" as const, title: f.title, date: f.watchedAt })),
      ...books.map((b) => ({ type: "book" as const, title: b.title, date: b.readAt })),
      ...discussions.map((d) => ({ type: "discussion" as const, title: d.title, date: d.createdAt })),
    ]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
    return {
      totalFilms: films.length,
      totalBooks: books.length,
      totalDiscussions: discussions.length,
      favoriteFilms: films.filter((f) => f.favorited).length,
      favoriteBooks: books.filter((b) => b.favorited).length,
      topGenres,
      recentActivity,
    };
  }, [films, books, discussions]);
}

export function CinemaStats() {
  const stats = useStats();

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Film className="size-4" />}
        label="Filmler"
        value={stats.totalFilms}
        accent="text-amber-500"
      />
      <StatCard
        icon={<BookOpen className="size-4" />}
        label="Kitaplar"
        value={stats.totalBooks}
        accent="text-blue-500"
      />
      <StatCard
        icon={<MessageSquare className="size-4" />}
        label="Tartışmalar"
        value={stats.totalDiscussions}
        accent="text-green-500"
      />
      <StatCard
        icon={<Heart className="size-4" />}
        label="Favoriler"
        value={stats.favoriteFilms + stats.favoriteBooks}
        accent="text-red-500"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className={accent}>{icon}</div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopGenres() {
  const stats = useStats();

  if (stats.topGenres.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="size-4" />
            Popüler Türler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground text-center py-4">
            Henüz tür verisi yok
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="size-4" />
          Popüler Türler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.topGenres.map((g) => (
            <div key={g.genre} className="flex items-center justify-between text-xs">
              <span>{g.genre}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(g.count / Math.max(...stats.topGenres.map((x) => x.count))) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-muted-foreground">{g.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivity() {
  const stats = useStats();

  if (stats.recentActivity.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Son Aktivite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground text-center py-4">
            Henüz aktivite yok
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Son Aktivite</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">
                {a.type === "film" ? "🎬" : a.type === "book" ? "📖" : "💬"}
              </span>
              <span className="truncate flex-1">{a.title}</span>
              <span className="text-muted-foreground">
                {new Date(a.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={`size-5 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
        >
          <Star
            className={`size-full ${
              star <= value ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
