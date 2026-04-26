import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { useReviewStore } from '@/stores/reviewStore';
import { useBranchStore } from '@/stores/branchStore';
import StarRating from '@/components/common/StarRating';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';

import {
  formatDate,
  sentimentColor,
  sentimentLabel,
  channelLabel,
  statusColor,
  statusLabel,
} from '@/lib/utils';

import { ReviewChannel, Sentiment, ReviewStatus } from '@/types';
import type { Review } from '@/types';
import { caregivers } from '@/data/caregivers';

export default function Reviews() {
  const navigate = useNavigate();

  const {
    reviews,
    filters,
    setFilters,
    page,
    pageSize,
    setPage,
    updateReview,
  } = useReviewStore();

  const { branches } = useBranchStore();
  const [selectedCaregiverId, setSelectedCaregiverId] = useState('');

  const branchMap = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name.trim()])),
    [branches],
  );

  const filteredReviews = useMemo(() => {
    const q = filters.search?.trim().toLowerCase();

    return reviews
      .filter((review) => {
        if (filters.branch_id && review.branch_id !== filters.branch_id) return false;
        if (selectedCaregiverId && review.collected_by !== selectedCaregiverId) return false;
        if (filters.channel && review.channel !== filters.channel) return false;
        if (filters.rating && review.rating !== filters.rating) return false;
        if (filters.sentiment && review.sentiment !== filters.sentiment) return false;
        if (filters.status && review.status !== filters.status) return false;
        if (filters.date_from && review.review_date < filters.date_from) return false;
        if (filters.date_to && review.review_date > filters.date_to) return false;

        if (q) {
          const text = `${review.guest_name} ${review.content} ${review.notes ?? ''}`.toLowerCase();
          if (!text.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => b.review_date.localeCompare(a.review_date));
  }, [reviews, filters, selectedCaregiverId]);

  const totalFiltered = filteredReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const data = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, page, pageSize, totalPages]);

  const updateFilter = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: 'review_date',
        header: 'Ngày',
        cell: ({ getValue }) => (
          <span className="text-sm">{formatDate(String(getValue()))}</span>
        ),
        size: 100,
      },
      {
        accessorKey: 'branch_id',
        header: 'Chi nhánh',
        cell: ({ getValue }) => {
          const branchId = String(getValue());

          return (
            <span className="text-sm">
              {branchMap.get(branchId) ?? branchId}
            </span>
          );
        },
        size: 160,
      },
      {
        accessorKey: 'guest_name',
        header: 'Khách hàng',
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">{String(getValue())}</span>
        ),
        size: 140,
      },
      {
        accessorKey: 'channel',
        header: 'Kênh',
        cell: ({ getValue }) => (
          <span className="text-xs">
            {channelLabel(getValue() as ReviewChannel)}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: 'rating',
        header: 'Đánh giá',
        cell: ({ getValue }) => (
          <StarRating rating={getValue() as number} size={14} />
        ),
        size: 100,
      },
      {
        accessorKey: 'sentiment',
        header: 'Cảm xúc',
        cell: ({ getValue }) => (
          <Badge className={sentimentColor(getValue() as Sentiment)}>
            {sentimentLabel(getValue() as Sentiment)}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ getValue }) => (
          <Badge className={statusColor(getValue() as ReviewStatus)}>
            {statusLabel(getValue() as ReviewStatus)}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: 'collected_by',
        header: 'Người Chăm Sóc',
        cell: ({ row, getValue }) => {
          const caregiverId = String(getValue() ?? '');

          return (
            <select
              value={caregiverId}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();

                updateReview(row.original.id, {
                  collected_by: e.target.value,
                });
              }}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Chọn người chăm sóc</option>

              {caregivers.map((caregiver) => (
                <option key={caregiver.id} value={caregiver.id}>
                  {caregiver.name}
                </option>
              ))}
            </select>
          );
        },
        size: 170,
      },
    ],
    [branchMap, updateReview],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">Đánh giá</h1>
        <span className="text-sm text-gray-500">{totalFiltered} kết quả</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={filters.search ?? ''}
              onChange={(e) =>
                updateFilter('search', e.target.value || undefined)
              }
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
            />
          </div>

          <select
            value={filters.branch_id ?? ''}
            onChange={(e) =>
              updateFilter('branch_id', e.target.value || undefined)
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name.trim()}
              </option>
            ))}
          </select>

          <select
            value={selectedCaregiverId}
            onChange={(e) => {
              setSelectedCaregiverId(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">Tất cả người chăm sóc</option>
            {caregivers.map((caregiver) => (
              <option key={caregiver.id} value={caregiver.id}>
                {caregiver.name}
              </option>
            ))}
          </select>

          <select
            value={filters.channel ?? ''}
            onChange={(e) =>
              updateFilter(
                'channel',
                (e.target.value || undefined) as ReviewChannel | undefined,
              )
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">Tất cả kênh</option>
            {Object.values(ReviewChannel).map((channel) => (
              <option key={channel} value={channel}>
                {channelLabel(channel as ReviewChannel)}
              </option>
            ))}
          </select>

          <select
            value={filters.rating?.toString() ?? ''}
            onChange={(e) =>
              updateFilter(
                'rating',
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">Tất cả sao</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} sao
              </option>
            ))}
          </select>

          <select
            value={filters.sentiment ?? ''}
            onChange={(e) =>
              updateFilter(
                'sentiment',
                (e.target.value || undefined) as Sentiment | undefined,
              )
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">Tất cả cảm xúc</option>
            {Object.values(Sentiment).map((sentiment) => (
              <option key={sentiment} value={sentiment}>
                {sentimentLabel(sentiment as Sentiment)}
              </option>
            ))}
          </select>

          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              updateFilter(
                'status',
                (e.target.value || undefined) as ReviewStatus | undefined,
              )
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.values(ReviewStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabel(status as ReviewStatus)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.date_from ?? ''}
            onChange={(e) =>
              updateFilter('date_from', e.target.value || undefined)
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          />

          <input
            type="date"
            value={filters.date_to ?? ''}
            onChange={(e) =>
              updateFilter('date_to', e.target.value || undefined)
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {data.length === 0 ? (
          <EmptyState
            title="Không tìm thấy đánh giá"
            description="Thử thay đổi bộ lọc để xem kết quả khác."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/reviews/${row.original.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}