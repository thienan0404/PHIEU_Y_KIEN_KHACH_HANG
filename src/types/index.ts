export const BranchStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type BranchStatus =
  (typeof BranchStatus)[keyof typeof BranchStatus];

export const UserRole = {
  Admin: 'admin',
  Inspector: 'inspector',
  Trainer: 'trainer',
  ReceptionLeader: 'reception_leader',
  BranchDirector: 'branch_director',
  BusinessDirector: 'business_director',
  CustomerService: 'customer_service',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ReviewChannel = {
  SocialMedia: 'social_media',
  Phone: 'phone',
  GoogleMaps: 'google_maps',
  WalkIn: 'walk_in',
  Other: 'other',
} as const;

export type ReviewChannel =
  (typeof ReviewChannel)[keyof typeof ReviewChannel];

export const Sentiment = {
  Positive: 'positive',
  Neutral: 'neutral',
  Negative: 'negative',
} as const;

export type Sentiment = (typeof Sentiment)[keyof typeof Sentiment];

export const ReviewStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Reprocessing: 'reprocessing',
  Resolved: 'resolved',
  Archived: 'archived',
} as const;

export type ReviewStatus =
  (typeof ReviewStatus)[keyof typeof ReviewStatus];

export interface Branch {
  id: string;
  name: string;
  address: string;

  code?: string;
  city?: string;
  status?: BranchStatus;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  branch_id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  channel: ReviewChannel;
  rating: number  | null ;
  content: string;
  sentiment: Sentiment;
  collected_by: string;
  notes: string | null;
  stay_date: string | null;
  review_date: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  check_out_date?: string | null;
}

export interface ManagerResponse {
  id: string;
  review_id: string;
  responded_by: string;
  content: string;
  action_taken: string | null;
  response_date: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewFilters {
  branch_id?: string;
  channel?: ReviewChannel;
  rating?: number;
  sentiment?: Sentiment;
  status?: ReviewStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
}