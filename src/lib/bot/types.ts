export interface Film {
  id: string;
  title: string;
  year: number;
  director: string;
  genre: string[];
  rating: number | null;
  personalRating: number | null;
  notes: string;
  watchedAt: number;
  posterUrl: string | null;
  tags: string[];
  favorited: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string[];
  rating: number | null;
  personalRating: number | null;
  notes: string;
  readAt: number;
  coverUrl: string | null;
  tags: string[];
  favorited: boolean;
}

export interface Discussion {
  id: string;
  filmId?: string;
  bookId?: string;
  title: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  keyQuotes: string[];
  relatedTopics: string[];
  createdAt: number;
}

export interface MediaStats {
  totalFilms: number;
  totalBooks: number;
  totalDiscussions: number;
  favoriteFilms: number;
  favoriteBooks: number;
  topGenres: { genre: string; count: number }[];
  recentActivity: { type: "film" | "book" | "discussion"; title: string; date: number }[];
}

export const GENRES = {
  film: [
    "Aksiyon", "Bilim Kurgu", "Drama", "Komedi", "Korku",
    "Romantik", "Gerilim", "Animasyon", "Belgesel", "Macera",
    "Fantastik", "Savaş", "Suç", "Batı", "Müzikal",
  ],
  book: [
    "Roman", "Bilim Kurgu", "Fantastik", "Polisiye", "Tarih",
    "Felsefe", "Bilim", "Anı", " Şiir", "Deneme",
    "Korku", "Romantik", "Gerilim", "Psikoloji", "Fenomenoloji",
  ],
};

export const POSTER_PLACEHOLDERS = [
  "🎬", "🎥", "📽️", "🎞️", "🎦",
];

export const COVER_PLACEHOLDERS = [
  "📚", "📖", "📕", "📗", "📘",
];
