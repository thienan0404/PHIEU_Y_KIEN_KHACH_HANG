import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare, Clock } from 'lucide-react';

import { useBranchStore } from '@/stores/branchStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useAuthStore } from '@/stores/authStore';

import StarRating from '@/components/common/StarRating';
import Badge from '@/components/common/Badge';

import { ReviewStatus, UserRole } from '@/types';

export default function Branches() {
  const navigate = useNavigate();

  const { branches } = useBranchStore();
  const { reviews } = useReviewStore();
  const { currentUser } = useAuthStore();

  const visibleBranches = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === UserRole.Admin) {
      return branches;
    }

    if (currentUser.branch_id) {
      return branches.filter((branch) => branch.id === currentUser.branch_id);
    }

    return branches;
  }, [branches, currentUser]);

  const branchStats = useMemo(() => {
    const stats: Record<
      string,
      {
        total: number;
        sumRating: number;
        pending: number;
      }
    > = {};

    reviews.forEach((review) => {
      if (!stats[review.branch_id]) {
        stats[review.branch_id] = {
          total: 0,
          sumRating: 0,
          pending: 0,
        };
      }

      stats[review.branch_id].total += 1;
      stats[review.branch_id].sumRating += review.rating ?? 0;

      if (review.status === ReviewStatus.Pending) {
        stats[review.branch_id].pending += 1;
      }
    });

    return stats;
  }, [reviews]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Chi nhánh</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleBranches.map((branch) => {
          const stat = branchStats[branch.id] ?? {
            total: 0,
            sumRating: 0,
            pending: 0,
          };

          const avgRating = stat.total ? stat.sumRating / stat.total : 0;
          const isActive = branch.isActive !== false;

          return (
            <div
              key={branch.id}
              onClick={() => navigate(`/branches/${branch.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {branch.name.trim()}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} />
                    <span>{branch.city || '—'}</span>
                  </div>
                </div>

                <Badge
                  className={
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }
                >
                  {isActive ? 'Hoạt động' : 'Ngưng'}
                </Badge>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <StarRating rating={Math.round(avgRating)} size={14} />

                <span className="text-sm text-gray-600 ml-1">
                  {avgRating ? avgRating.toFixed(1) : '-'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{stat.total} đánh giá</span>
                </div>

                {stat.pending > 0 && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Clock size={14} />
                    <span>{stat.pending} chờ xử lý</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {branch.code || '—'} — {branch.address || '—'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}