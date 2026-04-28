import { create } from 'zustand';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { users } from '@/data/users';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;

  isAdmin: () => boolean;
  canViewAllBranches: () => boolean;
  canCreateReview: () => boolean;
  canEditReview: () => boolean;
  canRespondToReview: () => boolean;
  canFinalizeReview: () => boolean;
  canRespondToSpecificReview: (branchId: string) => boolean;
}

const STORAGE_KEY = 'a25_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  // 🔥 LOAD từ localStorage
  currentUser: (() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  })(),

  isAuthenticated: !!localStorage.getItem(STORAGE_KEY),

  login: (email, password) => {
    const user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user || password !== '123456') return false;

    // 🔥 Lưu vào localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    set({
      currentUser: user,
      isAuthenticated: true,
    });

    return true;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);

    set({
      currentUser: null,
      isAuthenticated: false,
    });
  },

  switchUser: (userId) => {
    const user = users.find((item) => item.id === userId);

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      set({
        currentUser: user,
        isAuthenticated: true,
      });
    }
  },

  isAdmin: () => get().currentUser?.role === UserRole.Admin,

  canViewAllBranches: () => true,

  canCreateReview: () => {
    const role = get().currentUser?.role;
    return role === UserRole.Admin || role === UserRole.CustomerService;
  },

  canEditReview: () => {
    const role = get().currentUser?.role;
    return role === UserRole.Admin || role === UserRole.CustomerService;
  },

  canRespondToReview: () => {
    const role = get().currentUser?.role;

    return (
      role === UserRole.Admin ||
      role === UserRole.Inspector ||
      role === UserRole.Trainer ||
      role === UserRole.ReceptionLeader ||
      role === UserRole.BranchDirector ||
      role === UserRole.BusinessDirector ||
      role === UserRole.CustomerService
    );
  },

  canFinalizeReview: () => get().currentUser?.role === UserRole.Admin,

  canRespondToSpecificReview: (branchId) => {
    const user = get().currentUser;

    if (!user) return false;

    if (user.role === UserRole.ReceptionLeader) {
      return user.branch_id === branchId;
    }

    return (
      user.role === UserRole.Admin ||
      user.role === UserRole.Inspector ||
      user.role === UserRole.Trainer ||
      user.role === UserRole.BranchDirector ||
      user.role === UserRole.BusinessDirector ||
      user.role === UserRole.CustomerService
    );
  },
}));