import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Star, Clock, CheckCircle } from 'lucide-react';
import { useReviewStore } from '@/stores/reviewStore';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';
import StatCard from '@/components/dashboard/StatCard';
import StarRating from '@/components/common/StarRating';
import Badge from '@/components/common/Badge';
import { formatDate, sentimentColor, sentimentLabel, channelLabel, statusColor, statusLabel } from '@/lib/utils';
import { ReviewStatus, ReviewChannel } from '@/types';
import { format, subDays, parseISO } from 'date-fns';

export default function Dashboard() {
  const { reviews, responses } = useReviewStore();
  const { branches, selectedBranchId, getBranch } = useBranchStore();
  const { currentUser } = useAuthStore();

  const filteredReviews = useMemo(() => {
    let r = reviews;
    if (selectedBranchId) r = r.filter(rv => rv.branch_id === selectedBranchId);
    if (currentUser.branch_id && currentUser.role !== 'admin') {
      r = r.filter(rv => rv.branch_id === currentUser.branch_id);
    }
    return r;
  }, [reviews, selectedBranchId, currentUser]);

  const stats = useMemo(() => {
    const total = filteredReviews.length;
    const avgRating = total ? (filteredReviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '0';
    const pending = filteredReviews.filter(r => r.status === ReviewStatus.Pending).length;
    const respondedIds = new Set(responses.map(r => r.review_id));
    const responseRate = total ? Math.round((filteredReviews.filter(r => respondedIds.has(r.id)).length / total) * 100) : 0;
    return { total, avgRating, pending, responseRate };
  }, [filteredReviews, responses]);

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date('2026-04-10'), i), 'yyyy-MM-dd');
      days[d] = 0;
    }
    filteredReviews.forEach(r => {
      if (days[r.review_date] !== undefined) days[r.review_date]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: format(parseISO(date), 'dd/MM'),
      count,
    }));
  }, [filteredReviews]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(ReviewChannel).forEach(c => { counts[c] = 0; });
    filteredReviews.forEach(r => { counts[r.channel]++; });
    return Object.entries(counts).map(([channel, count]) => ({
      channel: channelLabel(channel as ReviewChannel),
      count,
    }));
  }, [filteredReviews]);

  const topBranches = useMemo(() => {
    const branchStats: Record<string, { total: number; sumRating: number }> = {};
    filteredReviews.forEach(r => {
      if (!branchStats[r.branch_id]) branchStats[r.branch_id] = { total: 0, sumRating: 0 };
      branchStats[r.branch_id].total++;
      branchStats[r.branch_id].sumRating += r.rating;
    });
    return Object.entries(branchStats)
      .map(([id, s]) => ({ id, name: getBranch(id)?.name ?? id, avgRating: s.sumRating / s.total, total: s.total }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [filteredReviews, getBranch]);

  const recentReviews = useMemo(() =>
    [...filteredReviews].sort((a, b) => b.review_date.localeCompare(a.review_date)).slice(0, 10),
    [filteredReviews]
  );

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tổng đánh giá" value={stats.total} icon={MessageSquare} color="bg-primary-600" />
        <StatCard title="Đánh giá TB" value={stats.avgRating} icon={Star} color="bg-accent-500" subtitle="trên 5 sao" />
        <StatCard title="Chờ xử lý" value={stats.pending} icon={Clock} color="bg-orange-500" />
        <StatCard title="Tỷ lệ phản hồi" value={`${stats.responseRate}%`} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Đánh giá 30 ngày gần nhất</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1e3a5f" strokeWidth={2} dot={false} name="Số đánh giá" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Đánh giá theo kênh</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#d4a843" radius={[4, 4, 0, 0]} name="Số đánh giá" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 chi nhánh</h2>
          <div className="space-y-3">
            {topBranches.map((b, i) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-600 w-5">#{i + 1}</span>
                  <span className="text-sm text-gray-700">{b.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(b.avgRating)} size={12} />
                  <span className="text-xs text-gray-500">{b.avgRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Đánh giá gần đây</h2>
          <div className="space-y-3">
            {recentReviews.map(r => (
              <div
                key={r.id}
                onClick={() => navigate(`/reviews/${r.id}`)}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">{r.guest_name}</span>
                    <StarRating rating={r.rating} size={12} />
                    <Badge className={sentimentColor(r.sentiment)}>{sentimentLabel(r.sentiment)}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{r.content}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.review_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
