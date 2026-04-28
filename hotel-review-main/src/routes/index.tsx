import { createBrowserRouter } from 'react-router-dom';

import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Reviews from '@/pages/Reviews';
import NewReview from '@/pages/NewReview';
import ReviewDetail from '@/pages/ReviewDetail';
import Branches from '@/pages/Branches';
import BranchDetail from '@/pages/BranchDetail';
import SettingsPage from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  // 🔓 route public
  {
    path: '/login',
    element: <Login />,
  },

  // 🔒 route cần đăng nhập
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'reviews/new', element: <NewReview /> },
      { path: 'reviews/:id', element: <ReviewDetail /> },
      { path: 'branches', element: <Branches /> },
      { path: 'branches/:id', element: <BranchDetail /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);