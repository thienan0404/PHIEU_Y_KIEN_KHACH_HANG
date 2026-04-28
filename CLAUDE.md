# CLAUDE.md — Hotel Review Management System

## Project Overview

**Project Name:** StarStay Review Hub
**Type:** Internal SaaS tool for managing hotel guest reviews across a multi-branch hotel chain
**Brand:** StarStay Hotels (50 branches)
**Team Size:** ~20 users (managers, staff, customer service, review collectors)
**Stage:** MVP / Demo

## Problem Statement

StarStay Hotels operates 50 branches. Guest reviews are collected from multiple channels (social media, phone-based customer service, Google Maps) and currently tracked manually. There is no centralized system to:
- Aggregate reviews across branches and channels
- Track who collected each review
- Enable manager responses/follow-ups
- Analyze sentiment and trends per branch

## Core Entities

### Branch
- `id` (UUID)
- `name` (string) — e.g. "StarStay District 1"
- `code` (string) — short code, e.g. "SS-D1"
- `address` (string)
- `city` (string)
- `status` (enum: active | inactive)
- `created_at`, `updated_at`

### User
- `id` (UUID)
- `name` (string)
- `email` (string, unique)
- `role` (enum: admin | branch_manager | staff | collector)
- `branch_id` (UUID, nullable — admin can access all branches)
- `avatar_url` (string, nullable)
- `status` (enum: active | inactive)
- `created_at`, `updated_at`

### Review
- `id` (UUID)
- `branch_id` (UUID, FK → Branch)
- `guest_name` (string)
- `guest_phone` (string, nullable)
- `guest_email` (string, nullable)
- `channel` (enum: social_media | phone | google_maps | walk_in | other)
- `rating` (integer, 1–5)
- `content` (text) — the actual review text
- `sentiment` (enum: positive | neutral | negative) — can be auto-detected or manual
- `collected_by` (UUID, FK → User) — who collected this review
- `notes` (text, nullable) — internal notes by collector
- `stay_date` (date, nullable) — when the guest stayed
- `review_date` (date) — when the review was recorded
- `status` (enum: pending | reviewed | resolved | archived)
- `created_at`, `updated_at`

### ManagerResponse
- `id` (UUID)
- `review_id` (UUID, FK → Review)
- `responded_by` (UUID, FK → User) — must be branch_manager or admin
- `content` (text)
- `action_taken` (text, nullable) — what action was taken
- `response_date` (datetime)
- `created_at`, `updated_at`

## User Roles & Permissions

| Action                  | Admin | Branch Manager | Staff | Collector |
|-------------------------|-------|----------------|-------|-----------|
| View all branches       | ✅    | ❌ (own only)   | ❌    | ❌        |
| Manage users            | ✅    | ❌              | ❌    | ❌        |
| Create review           | ✅    | ✅              | ✅    | ✅        |
| Edit own review         | ✅    | ✅              | ✅    | ✅        |
| Edit any review         | ✅    | ✅ (own branch) | ❌    | ❌        |
| Respond to review       | ✅    | ✅ (own branch) | ❌    | ❌        |
| View dashboard/reports  | ✅    | ✅ (own branch) | ❌    | ❌        |
| Export data             | ✅    | ✅ (own branch) | ❌    | ❌        |

## Tech Stack

### Frontend (this repo)
- **Framework:** React 18+ with Vite
- **Language:** TypeScript (strict mode)
- **Routing:** React Router v6
- **State Management:** Zustand (lightweight, sufficient for MVP)
- **UI Library:** Tailwind CSS + shadcn/ui components
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios (with interceptors for auth)
- **Date Handling:** date-fns
- **Tables:** TanStack Table v8

### Backend (future — not in MVP)
- NestJS + Fastify
- PostgreSQL
- Session-based auth

### MVP Approach
- Frontend-only with mock data / JSON files
- localStorage for demo persistence
- No real authentication — role switcher in UI for demo

## Project Structure

```
src/
├── assets/                  # Static assets (images, fonts)
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── layout/              # Shell, Sidebar, Header, Footer
│   ├── reviews/             # ReviewCard, ReviewForm, ReviewDetail
│   ├── branches/            # BranchCard, BranchSelector
│   ├── dashboard/           # StatCard, Charts, TopBranches
│   └── common/              # Shared (Avatar, Badge, EmptyState)
├── pages/
│   ├── Dashboard.tsx        # Overview with KPIs and charts
│   ├── Reviews.tsx          # List + filter + search reviews
│   ├── ReviewDetail.tsx     # Single review + manager response
│   ├── NewReview.tsx        # Form to create a review
│   ├── Branches.tsx         # Branch list (admin only)
│   ├── BranchDetail.tsx     # Branch-specific review summary
│   └── Settings.tsx         # User/role management (admin)
├── hooks/                   # Custom hooks (useReviews, useBranches, etc.)
├── stores/                  # Zustand stores
│   ├── authStore.ts         # Current user + role
│   ├── reviewStore.ts       # Reviews CRUD
│   └── branchStore.ts       # Branches data
├── data/                    # Mock data (branches.json, reviews.json, users.json)
├── types/                   # TypeScript interfaces & enums
│   └── index.ts
├── lib/                     # Utilities (formatDate, sentimentColor, etc.)
├── routes/                  # Route config + guards
├── App.tsx
├── main.tsx
└── index.css                # Tailwind directives + custom CSS vars
```

## Key Features (MVP Scope)

### 1. Dashboard (Home)
- Total reviews count, avg rating, sentiment breakdown
- Reviews over time chart (line chart, last 30 days)
- Top 5 branches by rating
- Recent reviews list (latest 10)
- Filter by date range and branch

### 2. Review Management
- List all reviews with filters: branch, channel, rating, sentiment, status, date range
- Search by guest name or review content
- Sort by date, rating
- Pagination (20 per page)
- Click to view detail

### 3. Review Creation
- Form: select branch, guest info, channel, rating (star picker), content, notes
- Auto-assign `collected_by` to current user
- Auto-detect sentiment from content (simple keyword-based for MVP)

### 4. Review Detail + Manager Response
- Full review info display
- Manager response section (only for admin/branch_manager)
- Response form: content + action taken
- Status update (pending → reviewed → resolved)

### 5. Branch Overview
- List all branches with review stats (total, avg rating, pending count)
- Click into branch for filtered review list

### 6. Role Switcher (Demo Only)
- Dropdown in header to switch between demo users with different roles
- Instantly changes what's visible and accessible

## Coding Standards

- All components are functional with hooks
- Use TypeScript strict — no `any` types
- Components under 150 lines; extract sub-components if larger
- Custom hooks for any data fetching or complex logic
- Zod schemas mirror entity types for form validation
- Tailwind only — no inline styles, no CSS modules
- Use path aliases: `@/components`, `@/hooks`, `@/stores`, etc.
- File naming: PascalCase for components, camelCase for hooks/utils
- English only in code, comments, and commit messages

## Mock Data Requirements

- 50 branches with realistic Vietnamese city/district names
- 10 users across all 4 roles
- 200+ reviews spread across branches, channels, and ratings
- 50+ manager responses
- Data should include edge cases: 1-star reviews, empty notes, missing guest info

## Design Guidelines

- Clean, professional, minimal — hotel/hospitality feel
- Primary color: Deep blue (#1e3a5f)
- Accent: Warm gold (#d4a843)
- Background: Light gray (#f8f9fa)
- Cards with subtle shadows, rounded corners (8px)
- Responsive: desktop-first, but usable on tablet
- Vietnamese locale for dates and numbers where displayed
- Star ratings use filled/empty star icons (gold)

## Non-Goals (MVP)

- No real backend or database
- No real authentication/authorization
- No file uploads (photos of reviews)
- No email/SMS notifications
- No real-time updates
- No multi-language support
- No API integration with Google Maps or social media
