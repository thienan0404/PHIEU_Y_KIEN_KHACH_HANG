import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MessageSquare, Star, Clock, CheckCircle } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

import { useReviewStore } from '@/stores/reviewStore';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';

import StatCard from '@/components/dashboard/StatCard';
import StarRating from '@/components/common/StarRating';
import Badge from '@/components/common/Badge';

import {
  formatDate,
  sentimentColor,
  sentimentLabel,
  channelLabel,
  statusColor,
  statusLabel,
} from '@/lib/utils';

import { ReviewStatus, ReviewChannel, UserRole, ReviewCategory } from '@/types';

const categoryLabel = {
  [ReviewCategory.Breakfast]: 'Ăn sáng',
  [ReviewCategory.Facility]: 'Cơ sở vật chất',
  [ReviewCategory.CleanlinessSmell]: 'Vệ sinh / Mùi',
  [ReviewCategory.Insect]: 'Côn trùng',
  [ReviewCategory.Operation]: 'Nghiệp vụ',
  [ReviewCategory.Attitude]: 'Thái độ',
  [ReviewCategory.Price]: 'Giá',
};

const pieColors = [
  '#1e3a5f',
  '#d4a843',
  '#16a34a',
  '#dc2626',
  '#9333ea',
  '#ea580c',
  '#0891b2',
];

type PieDataItem = {
  name: string;
  value: number;
};

function PieLegend({
  data,
  hoveredIndex,
  onHover,
}: {
  data: PieDataItem[];
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      {data.map((item, index) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={item.name}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-default transition-colors ${
              isHovered ? 'bg-gray-50' : ''
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: pieColors[index % pieColors.length] }}
            />

            <span className="text-xs text-gray-700 flex-1 truncate">
              {item.name}
            </span>

            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${percent}%`,
                  backgroundColor: pieColors[index % pieColors.length],
                }}
              />
            </div>

            <span className="text-xs font-medium text-gray-700 w-8 text-right flex-shrink-0">
              {percent}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

type CustomPieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

function renderCustomLabel(props: CustomPieLabelProps) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  } = props;

  if (percent < 0.06) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { reviews, responses } = useReviewStore();
  const { selectedBranchId, getBranch } = useBranchStore();
  const { currentUser } = useAuthStore();

  const userRole = currentUser?.role;
  const userBranchId = currentUser?.branch_id;

  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);

  const filteredReviews = useMemo(() => {
    let result = reviews;

    if (selectedBranchId) {
      result = result.filter((review) => review.branch_id === selectedBranchId);
    }

    if (userBranchId && userRole !== UserRole.Admin) {
      result = result.filter((review) => review.branch_id === userBranchId);
    }

    return result;
  }, [reviews, selectedBranchId, userRole, userBranchId]);

  const stats = useMemo(() => {
    const total = filteredReviews.length;

    const avgRating = total
      ? (
          filteredReviews.reduce(
            (sum, review) => sum + (review.rating ?? 0),
            0,
          ) / total
        ).toFixed(1)
      : '0';

    const pending = filteredReviews.filter(
      (review) => review.status === ReviewStatus.Pending,
    ).length;

    const respondedIds = new Set(
      responses.map((response) => response.review_id),
    );

    const responseRate = total
      ? Math.round(
          (filteredReviews.filter((review) => respondedIds.has(review.id))
            .length /
            total) *
            100,
        )
      : 0;

    return { total, avgRating, pending, responseRate };
  }, [filteredReviews, responses]);

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};

    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date('2026-04-10'), i), 'yyyy-MM-dd');
      days[date] = 0;
    }

    filteredReviews.forEach((review) => {
      if (days[review.review_date] !== undefined) {
        days[review.review_date] += 1;
      }
    });

    return Object.entries(days).map(([date, count]) => ({
      date: format(parseISO(date), 'dd/MM'),
      count,
    }));
  }, [filteredReviews]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};

    Object.values(ReviewChannel).forEach((channel) => {
      counts[channel] = 0;
    });

    filteredReviews.forEach((review) => {
      counts[review.channel] += 1;
    });

    return Object.entries(counts).map(([channel, count]) => ({
      channel: channelLabel(channel as ReviewChannel),
      count,
    }));
  }, [filteredReviews]);

  const categoryMonthlyData = useMemo(() => {
    const latestMonths = ['2026-02', '2026-03', '2026-04'];

    return latestMonths.map((month) => {
      const counts: Record<string, number> = {};

      Object.values(ReviewCategory).forEach((category) => {
        counts[category] = 0;
      });

      filteredReviews
        .filter((review) => review.review_date.startsWith(month))
        .forEach((review) => {
          counts[review.category] += 1;
        });

      const data = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([category, count]) => ({
          name: categoryLabel[category as ReviewCategory],
          value: count,
        }));

      return { month, data };
    });
  }, [filteredReviews]);

  const topBranches = useMemo(() => {
    const branchStats: Record<string, { total: number; sumRating: number }> = {};

    filteredReviews.forEach((review) => {
      if (!branchStats[review.branch_id]) {
        branchStats[review.branch_id] = { total: 0, sumRating: 0 };
      }

      branchStats[review.branch_id].total += 1;
      branchStats[review.branch_id].sumRating += review.rating ?? 0;
    });

    return Object.entries(branchStats)
      .map(([id, stat]) => ({
        id,
        name: getBranch(id)?.name.trim() ?? id,
        avgRating: stat.sumRating / stat.total,
        total: stat.total,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [filteredReviews, getBranch]);

  const recentReviews = useMemo(
    () =>
      [...filteredReviews]
        .sort((a, b) => b.review_date.localeCompare(a.review_date))
        .slice(0, 10),
    [filteredReviews],
  );

  const activeMonthData = categoryMonthlyData[activeMonthIndex];
  const activeTotal =
    activeMonthData?.data.reduce((sum, item) => sum + item.value, 0) ?? 0;

  const monthLabels = categoryMonthlyData.map((item) => {
    const [year, month] = item.month.split('-');
    return `Tháng ${month}/${year}`;
  });

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng đánh giá"
          value={stats.total}
          icon={MessageSquare}
          color="bg-primary-600"
        />
        <StatCard
          title="Đánh giá TB"
          value={stats.avgRating}
          icon={Star}
          color="bg-accent-500"
          subtitle="trên 5 sao"
        />
        <StatCard
          title="Chờ xử lý"
          value={stats.pending}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Tỷ lệ phản hồi"
          value={`${stats.responseRate}%`}
          icon={CheckCircle}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Đánh giá 30 ngày gần nhất
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1e3a5f"
                strokeWidth={2}
                dot={false}
                name="Số đánh giá"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Đánh giá theo kênh
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#d4a843"
                radius={[4, 4, 0, 0]}
                name="Số đánh giá"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Tỷ lệ nhóm phản ánh 3 tháng gần nhất
        </h2>

        <div className="flex gap-2 mb-6 flex-wrap">
          {monthLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActiveMonthIndex(index);
                setHoveredSliceIndex(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeMonthIndex === index
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeMonthData && activeMonthData.data.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative flex-shrink-0">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={activeMonthData.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderCustomLabel}
                    onMouseEnter={(_, index) => setHoveredSliceIndex(index)}
                    onMouseLeave={() => setHoveredSliceIndex(null)}
                  >
                    {activeMonthData.data.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                        opacity={
                          hoveredSliceIndex === null ||
                          hoveredSliceIndex === index
                            ? 1
                            : 0.4
                        }
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>

                  
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-semibold text-gray-800">
                  {hoveredSliceIndex !== null
                    ? `${Math.round(
                        ((activeMonthData.data[hoveredSliceIndex]?.value ?? 0) /
                          activeTotal) *
                          100,
                      )}%`
                    : activeTotal}
                </span>

                <span className="text-xs text-gray-400 text-center max-w-[64px] leading-tight">
                  {hoveredSliceIndex !== null
                    ? activeMonthData.data[hoveredSliceIndex]?.name
                    : 'phản ánh'}
                </span>
              </div>
            </div>

            <PieLegend
              data={activeMonthData.data}
              hoveredIndex={hoveredSliceIndex}
              onHover={setHoveredSliceIndex}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">
            Không có dữ liệu cho tháng này.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Top 5 chi nhánh
          </h2>

          <div className="space-y-3">
            {topBranches.map((branch, index) => (
              <div key={branch.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-600 w-5">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{branch.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(branch.avgRating)} size={12} />
                  <span className="text-xs text-gray-500">
                    {branch.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Đánh giá gần đây
          </h2>

          <div className="space-y-3">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                onClick={() => navigate(`/reviews/${review.id}`)}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {review.guest_name}
                    </span>

                    <StarRating rating={review.rating ?? 0} size={12} />

                    <Badge className={sentimentColor(review.sentiment)}>
                      {sentimentLabel(review.sentiment)}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {review.content}
                  </p>
                </div>

                <div className="text-right ml-4 shrink-0">
                  <Badge className={statusColor(review.status)}>
                    {statusLabel(review.status)}
                  </Badge>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(review.review_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}