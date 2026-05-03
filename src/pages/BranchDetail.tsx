import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useBranchStore } from '@/stores/branchStore';
import { useReviewStore } from '@/stores/reviewStore';
import StarRating from '@/components/common/StarRating';
import Badge from '@/components/common/Badge';
import { formatDate, sentimentColor, sentimentLabel, statusColor, statusLabel } from '@/lib/utils';

export default function BranchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBranch } = useBranchStore();
  const { setFilters, filters } = useReviewStore();

  const branch = getBranch(id ?? '');

  useEffect(() => {
    if (id) setFilters({ ...filters, branch_id: id });
    return () => setFilters({ ...filters, branch_id: undefined });
  }, [id]);

  if (!branch) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy chi nhánh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/branches')} className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <MapPin size={14} />
              <span className="text-sm">{branch.address}, {branch.city}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Mã: {branch.code}</p>
          </div>
          <Badge className={branch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
            {branch.status === 'active' ? 'Hoạt động' : 'Ngưng'}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Xem danh sách đánh giá của chi nhánh này tại{' '}
        <button onClick={() => { setFilters({ branch_id: id }); navigate('/reviews'); }} className="text-primary-600 hover:underline">
          trang đánh giá
        </button>.
      </p>

      {/* Quick review list */}
      <ReviewsForBranch branchId={id ?? ''} />
    </div>
  );
}

function ReviewsForBranch({ branchId }: { branchId: string }) {
  const { reviews } = useReviewStore();
  const navigate = useNavigate();
  const branchReviews = reviews
    .filter(r => r.branch_id === branchId)
    .sort((a, b) => b.review_date.localeCompare(a.review_date))
    .slice(0, 20);

  if (branchReviews.length === 0) {
    return <p className="text-sm text-gray-400">Chưa có đánh giá nào cho chi nhánh này.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Đánh giá gần đây ({branchReviews.length})</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {branchReviews.map(r => (
          <div
            key={r.id}
            onClick={() => navigate(`/reviews/${r.id}`)}
            className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{r.guest_name}</span>
                <StarRating rating={r.rating ?? 0} size={12} />
                <Badge className={sentimentColor(r.sentiment)}>{sentimentLabel(r.sentiment)}</Badge>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{r.content}</p>
            </div>
            <div className="ml-4 shrink-0 text-right">
              <Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
              <p className="text-xs text-gray-400 mt-1">{formatDate(r.review_date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
