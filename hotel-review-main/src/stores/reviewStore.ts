import { create } from 'zustand';
import type { Review, ManagerResponse, ReviewFilters } from '@/types';
import { reviews as initialReviews } from '@/data/reviews';
import { responses as initialResponses } from '@/data/responses';

const REVIEWS_KEY = 'a25_reviews';
const RESPONSES_KEY = 'a25_responses';

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function applyFilters(reviews: Review[], filters: ReviewFilters) {
  const q = filters.search ? normalizeText(filters.search) : '';

  return reviews
    .filter((review) => {
      if (filters.branch_id && review.branch_id !== filters.branch_id) {
        return false;
      }

      if (filters.channel && review.channel !== filters.channel) {
        return false;
      }

      if (filters.rating && review.rating !== filters.rating) {
        return false;
      }

      if (filters.sentiment && review.sentiment !== filters.sentiment) {
        return false;
      }

      if (filters.status && review.status !== filters.status) {
        return false;
      }

      if (filters.date_from && review.review_date < filters.date_from) {
        return false;
      }

      if (filters.date_to && review.review_date > filters.date_to) {
        return false;
      }

      if (q) {
        const guestName = normalizeText(review.guest_name);
        const content = normalizeText(review.content);
        const notes = review.notes ? normalizeText(review.notes) : '';

        if (
          !guestName.includes(q) &&
          !content.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => b.review_date.localeCompare(a.review_date));
}

interface ReviewState {
  reviews: Review[];
  responses: ManagerResponse[];
  filters: ReviewFilters;
  page: number;
  pageSize: number;

  setFilters: (filters: ReviewFilters) => void;
  setPage: (page: number) => void;
  getFilteredReviews: () => Review[];
  getTotalPages: () => number;
  getPagedReviews: () => Review[];

  addReview: (review: Review) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  getReview: (id: string) => Review | undefined;

  addResponse: (response: ManagerResponse) => void;
  getResponsesForReview: (reviewId: string) => ManagerResponse[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: loadFromStorage(REVIEWS_KEY, initialReviews),
  responses: loadFromStorage(RESPONSES_KEY, initialResponses),
  filters: {},
  page: 1,
  pageSize: 20,

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
      page: 1,
    })),

  setPage: (page) =>
    set((state) => {
      const totalPages = get().getTotalPages();
      const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

      if (safePage === state.page) return state;

      return { page: safePage };
    }),

  getFilteredReviews: () => {
    const { reviews, filters } = get();
    return applyFilters(reviews, filters);
  },

  getTotalPages: () => {
    const { pageSize } = get();
    const total = get().getFilteredReviews().length;

    return Math.max(1, Math.ceil(total / pageSize));
  },

  getPagedReviews: () => {
    const { page, pageSize } = get();
    const filtered = get().getFilteredReviews();
    const start = (page - 1) * pageSize;

    return filtered.slice(start, start + pageSize);
  },

  addReview: (review) => {
    set((state) => {
      const updated = [review, ...state.reviews];
      saveToStorage(REVIEWS_KEY, updated);

      return {
        reviews: updated,
        page: 1,
      };
    });
  },

  updateReview: (id, updates) => {
    set((state) => {
      const updated = state.reviews.map((review) =>
        review.id === id
          ? {
              ...review,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : review,
      );

      saveToStorage(REVIEWS_KEY, updated);

      return { reviews: updated };
    });
  },

  getReview: (id) => get().reviews.find((review) => review.id === id),

  addResponse: (response) => {
    set((state) => {
      const updated = [response, ...state.responses];
      saveToStorage(RESPONSES_KEY, updated);

      return { responses: updated };
    });
  },

  getResponsesForReview: (reviewId) =>
    get()
      .responses.filter((response) => response.review_id === reviewId)
      .sort((a, b) => b.response_date.localeCompare(a.response_date)),
}));