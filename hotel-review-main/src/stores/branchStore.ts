import { create } from 'zustand';
import type { Branch } from '@/types';
import { branches } from '@/data/branches';

interface BranchState {
  branches: Branch[];
  selectedBranchId: string | null;
  setSelectedBranch: (id: string | null) => void;
  getBranch: (id: string) => Branch | undefined;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches,
  selectedBranchId: null,

  setSelectedBranch: (id) => set({ selectedBranchId: id }),

  getBranch: (id) => get().branches.find(b => b.id === id),
}));
