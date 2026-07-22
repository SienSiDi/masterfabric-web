"use client";

import { create } from "zustand";
import type { Film, Book, Discussion, MediaStats } from "@/lib/bot/types";

interface MediaState {
  films: Film[];
  books: Book[];
  discussions: Discussion[];
  addFilm: (film: Film) => void;
  updateFilm: (id: string, updates: Partial<Film>) => void;
  removeFilm: (id: string) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  addDiscussion: (discussion: Discussion) => void;
  removeDiscussion: (id: string) => void;
  getStats: () => MediaStats;
  hydrate: () => void;
}

const FILMS_KEY = "mf_films_v1";
const BOOKS_KEY = "mf_books_v1";
const DISCUSSIONS_KEY = "mf_discussions_v1";

function loadFilms(): Film[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FILMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadBooks(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadDiscussions(): Discussion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DISCUSSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useMediaStore = create<MediaState>((set, get) => ({
  films: loadFilms(),
  books: loadBooks(),
  discussions: loadDiscussions(),

  addFilm: (film) => {
    set((s) => ({ films: [...s.films, film] }));
    persist(FILMS_KEY, get().films);
  },

  updateFilm: (id, updates) => {
    set((s) => ({
      films: s.films.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
    persist(FILMS_KEY, get().films);
  },

  removeFilm: (id) => {
    set((s) => ({ films: s.films.filter((f) => f.id !== id) }));
    persist(FILMS_KEY, get().films);
  },

  addBook: (book) => {
    set((s) => ({ books: [...s.books, book] }));
    persist(BOOKS_KEY, get().books);
  },

  updateBook: (id, updates) => {
    set((s) => ({
      books: s.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
    persist(BOOKS_KEY, get().books);
  },

  removeBook: (id) => {
    set((s) => ({ books: s.books.filter((b) => b.id !== id) }));
    persist(BOOKS_KEY, get().books);
  },

  addDiscussion: (discussion) => {
    set((s) => ({ discussions: [...s.discussions, discussion] }));
    persist(DISCUSSIONS_KEY, get().discussions);
  },

  removeDiscussion: (id) => {
    set((s) => ({ discussions: s.discussions.filter((d) => d.id !== id) }));
    persist(DISCUSSIONS_KEY, get().discussions);
  },

  getStats: (): MediaStats => {
    const { films, books, discussions } = get();

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
  },

  hydrate: () => {
    set({
      films: loadFilms(),
      books: loadBooks(),
      discussions: loadDiscussions(),
    });
  },
}));
