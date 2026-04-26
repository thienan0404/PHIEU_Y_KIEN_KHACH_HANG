import { create } from 'zustand';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { users } from '@/data/users';

interface AuthState {
  currentUser: User;
  switchUser: (userId: string) => void;
  isAdmin: () => boolean;
  isBranchManager: () => boolean;
  canRespondToReview: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: users[0],

  switchUser: (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) set({ currentUser: user });
  },

  isAdmin: () => get().currentUser.role === UserRole.Admin,

  isBranchManager: () =>
    get().currentUser.role === UserRole.BranchManager || get().currentUser.role === UserRole.Admin,

  canRespondToReview: () => {
    const role = get().currentUser.role;
    return role === UserRole.Admin || role === UserRole.BranchManager;
  },
}));
