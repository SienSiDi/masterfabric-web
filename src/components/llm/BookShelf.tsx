"use client";

import { useMediaStore } from "@/stores/useMediaStore";
import { StarRating } from "./CinemaTheme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Book } from "@/lib/bot/types";
import { GENRES } from "@/lib/bot/types";

export function BookShelf() {
  const books = useMediaStore((s) => s.books);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="size-4 text-blue-500" />
          Kitap Koleksiyonu ({books.length})
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

      {showAdd && <AddBookForm onClose={() => setShowAdd(false)} />}

      {books.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Henüz kitap eklenmemiş. Sinematek ile sohbet ederken kitapları kaydedebilirsin.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const updateBook = useMediaStore((s) => s.updateBook);
  const removeBook = useMediaStore((s) => s.removeBook);

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden group">
      <CardContent className="p-3 flex gap-3">
        <div className="w-12 h-16 bg-gradient-to-b from-blue-900/30 to-blue-950/50 rounded flex items-center justify-center text-xl flex-shrink-0">
          📖
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium text-sm truncate" title={book.title}>
              {book.title}
            </div>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => updateBook(book.id, { favorited: !book.favorited })}
              className="flex-shrink-0"
            >
              <Heart
                className={`size-3 ${book.favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
              />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {book.author} · {book.year}
          </div>

          <div className="flex flex-wrap gap-1">
            {book.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <StarRating
              value={book.personalRating ?? 0}
              onChange={(v) => updateBook(book.id, { personalRating: v })}
            />
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => removeBook(book.id)}
              className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddBookForm({ onClose }: { onClose: () => void }) {
  const addBook = useMediaStore((s) => s.addBook);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genre, setGenre] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const book: Book = {
      id: `book_${Date.now()}`,
      title: title.trim(),
      author: author.trim() || "Bilinmeyen Yazar",
      year: parseInt(year) || new Date().getFullYear(),
      genre,
      rating: null,
      personalRating: null,
      notes: "",
      readAt: Date.now(),
      coverUrl: null,
      tags: [],
      favorited: false,
    };

    addBook(book);
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
            <span className="text-sm font-medium">Yeni Kitap Ekle</span>
            <Button size="icon-xs" variant="ghost" type="button" onClick={onClose}>
              <X className="size-3" />
            </Button>
          </div>

          <input
            type="text"
            placeholder="Kitap adı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
          />

          <input
            type="text"
            placeholder="Yazar"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
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
            {GENRES.book.slice(0, 8).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`text-xs px-2 py-1 rounded ${
                  genre.includes(g)
                    ? "bg-blue-500 text-white"
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
