"use client";

import { useMediaStore } from "@/stores/useMediaStore";
import { StarRating } from "./CinemaTheme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Heart, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Film as FilmType } from "@/lib/bot/types";
import { GENRES } from "@/lib/bot/types";

export function FilmShelf() {
  const films = useMediaStore((s) => s.films);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Film className="size-4 text-amber-500" />
          Film Koleksiyonu ({films.length})
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdd(!showAdd)}
          className="gap-1"
        >
          <Plus className="size-3" />
          Ekle
        </Button>
      </div>

      {showAdd && <AddFilmForm onClose={() => setShowAdd(false)} />}

      {films.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Henüz film eklenmemiş. Sinematek ile sohbet ederken filmleri kaydedebilirsin.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {films.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilmCard({ film }: { film: FilmType }) {
  const updateFilm = useMediaStore((s) => s.updateFilm);
  const removeFilm = useMediaStore((s) => s.removeFilm);

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden group">
      <div className="aspect-[2/3] bg-gradient-to-b from-amber-900/20 to-amber-950/40 flex items-center justify-center text-4xl relative">
        🎬
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => updateFilm(film.id, { favorited: !film.favorited })}
          >
            <Heart
              className={`size-4 ${film.favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="font-medium text-sm truncate" title={film.title}>
          {film.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {film.director} · {film.year}
        </div>
        <div className="flex flex-wrap gap-1">
          {film.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500"
            >
              {g}
            </span>
          ))}
        </div>
        <StarRating
          value={film.personalRating ?? 0}
          onChange={(v) => updateFilm(film.id, { personalRating: v })}
        />
        <div className="flex justify-end">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => removeFilm(film.id)}
            className="text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddFilmForm({ onClose }: { onClose: () => void }) {
  const addFilm = useMediaStore((s) => s.addFilm);
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genre, setGenre] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const film: FilmType = {
      id: `film_${Date.now()}`,
      title: title.trim(),
      year: parseInt(year) || new Date().getFullYear(),
      director: director.trim() || "Bilinmeyen",
      genre,
      rating: null,
      personalRating: null,
      notes: "",
      watchedAt: Date.now(),
      posterUrl: null,
      tags: [],
      favorited: false,
    };

    addFilm(film);
    onClose();
  }

  function toggleGenre(g: string) {
    setGenre((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Yeni Film Ekle</span>
            <Button size="icon-xs" variant="ghost" type="button" onClick={onClose}>
              <X className="size-3" />
            </Button>
          </div>

          <input
            type="text"
            placeholder="Film adı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
          />

          <input
            type="text"
            placeholder="Yönetmen (opsiyonel)"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
          />

          <input
            type="number"
            placeholder="Yıl"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
          />

          <div className="flex flex-wrap gap-1">
            {GENRES.film.slice(0, 8).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`text-xs px-2 py-1 rounded ${
                  genre.includes(g)
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <Button type="submit" size="sm" className="w-full">
            Ekle
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
