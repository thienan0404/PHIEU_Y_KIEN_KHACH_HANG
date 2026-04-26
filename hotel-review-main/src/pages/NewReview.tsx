import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useReviewStore } from '@/stores/reviewStore';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';

import StarRating from '@/components/common/StarRating';

import {
  detectSentiment,
  generateId,
  channelLabel,
} from '@/lib/utils';

import { ReviewChannel, ReviewStatus } from '@/types';

// ✅ FIX ZOD V4
const reviewChannelValues = Object.values(ReviewChannel) as [
  ReviewChannel,
  ...ReviewChannel[],
];

const schema = z.object({
  branch_id: z.string().min(1, 'Vui lòng chọn chi nhánh'),
  guest_name: z.string().min(1, 'Vui lòng nhập tên khách'),
  guest_phone: z.string().optional(),
  guest_email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  channel: z.enum(reviewChannelValues, {
    message: 'Vui lòng chọn kênh',
  }),
  content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
  notes: z.string().optional(),
  stay_date: z.string().optional(),
  response_content: z.string().optional(),
  action_taken: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewReview() {
  const [rating, setRating] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const { addReview, addResponse } = useReviewStore();
  const { branches } = useBranchStore();
  const { currentUser, canRespondToReview } = useAuthStore();

  const isManager = canRespondToReview();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    if (!currentUser) return;

    const now = new Date().toISOString();
    const hasResponse = isManager && Boolean(data.response_content?.trim());
    const reviewId = generateId('rev');

    addReview({
      id: reviewId,
      branch_id: data.branch_id,
      guest_name: data.guest_name,
      guest_phone: data.guest_phone || null,
      guest_email: data.guest_email || null,
      channel: data.channel,
      rating,
      content: data.content,
      sentiment: detectSentiment(data.content),

      // ⭐ QUAN TRỌNG: người tổng hợp = user đang login
      collected_by: currentUser.id,

      notes: data.notes || null,
      stay_date: data.stay_date || null,
      review_date: now.split('T')[0],
      status: hasResponse ? ReviewStatus.Reviewed : ReviewStatus.Pending,
      created_at: now,
      updated_at: now,
    });

    if (hasResponse) {
      addResponse({
        id: generateId('res'),
        review_id: reviewId,
        responded_by: currentUser.id,
        content: data.response_content!.trim(),
        action_taken: data.action_taken?.trim() || null,
        response_date: now,
        created_at: now,
        updated_at: now,
      });
    }

    setShowSuccess(true);
    setTimeout(() => navigate('/reviews'), 1500);
  };

  const inputCls =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500';

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const errorCls = 'text-xs text-red-500 mt-1';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">
        Tạo đánh giá mới
      </h1>

      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Tạo đánh giá thành công! Đang chuyển hướng...
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Chi nhánh *</label>
            <select {...register('branch_id')} className={inputCls}>
              <option value="">Chọn chi nhánh</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name.trim()}
                </option>
              ))}
            </select>
            {errors.branch_id && (
              <p className={errorCls}>{errors.branch_id.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Kênh thu thập *</label>
            <select {...register('channel')} className={inputCls}>
              <option value="">Chọn kênh</option>
              {Object.values(ReviewChannel).map((channel) => (
                <option key={channel} value={channel}>
                  {channelLabel(channel as ReviewChannel)}
                </option>
              ))}
            </select>
            {errors.channel && (
              <p className={errorCls}>{errors.channel.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className={labelCls}>Tên khách hàng *</label>
          <input
            {...register('guest_name')}
            className={inputCls}
            placeholder="Nguyễn Văn A"
          />
          {errors.guest_name && (
            <p className={errorCls}>{errors.guest_name.message}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Đánh giá sao *</label>
          <StarRating
            rating={rating}
            size={28}
            interactive
            onChange={setRating}
          />
        </div>

        <div>
          <label className={labelCls}>Nội dung đánh giá *</label>
          <textarea
            {...register('content')}
            rows={4}
            className={inputCls}
          />
          {errors.content && (
            <p className={errorCls}>{errors.content.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800"
          >
            Tạo đánh giá
          </button>

          <button
            type="button"
            onClick={() => navigate('/reviews')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}