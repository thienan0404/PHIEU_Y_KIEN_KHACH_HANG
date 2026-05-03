import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useReviewStore } from '@/stores/reviewStore';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';

import StarRating from '@/components/common/StarRating';

import { detectSentiment, generateId, channelLabel } from '@/lib/utils';

import { ReviewChannel, ReviewStatus, ReviewCategory } from '@/types';

const reviewChannelValues = Object.values(ReviewChannel) as [
  ReviewChannel,
  ...ReviewChannel[],
];

const reviewCategoryValues = Object.values(ReviewCategory) as [
  ReviewCategory,
  ...ReviewCategory[],
];

const categoryLabel = {
  [ReviewCategory.Breakfast]: 'Ăn sáng',
  [ReviewCategory.Facility]: 'Cơ sở vật chất',
  [ReviewCategory.CleanlinessSmell]: 'Vệ sinh / Mùi',
  [ReviewCategory.Insect]: 'Côn trùng',
  [ReviewCategory.Operation]: 'Nghiệp vụ',
  [ReviewCategory.Attitude]: 'Thái độ',
  [ReviewCategory.Price]: 'Giá',
};

const schema = z
  .object({
    branch_id: z.string().min(1, 'Vui lòng chọn chi nhánh'),
    guest_name: z.string().min(1, 'Vui lòng nhập tên khách'),
    guest_phone: z.string().optional(),
    guest_email: z
      .string()
      .email('Email không hợp lệ')
      .optional()
      .or(z.literal('')),

    channel: z.enum(reviewChannelValues, {
      message: 'Vui lòng chọn kênh',
    }),

    category: z.enum(reviewCategoryValues, {
      message: 'Vui lòng chọn loại phản ánh',
    }),

    content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
    notes: z.string().optional(),

    check_in_date: z.string().optional(),
    check_out_date: z.string().optional(),

    response_content: z.string().optional(),
    action_taken: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.check_in_date || !data.check_out_date) return true;
      return data.check_out_date >= data.check_in_date;
    },
    {
      message: 'Ngày check-out phải sau hoặc bằng ngày check-in',
      path: ['check_out_date'],
    },
  );

type FormData = z.infer<typeof schema>;

export default function NewReview() {
  const [rating, setRating] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const { addReview, addResponse } = useReviewStore();
  const { branches } = useBranchStore();
  const { currentUser, canRespondToReview } = useAuthStore();

  const isManager = canRespondToReview();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedChannel = useWatch({
    control,
    name: 'channel',
  });

  const isGoogleMaps = selectedChannel === ReviewChannel.GoogleMaps;
  const isSocialMedia = selectedChannel === ReviewChannel.SocialMedia;
  const shouldShowRating = isGoogleMaps || isSocialMedia;

  const addImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setImages((prev) => [...prev, result]);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(addImageFile);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const files: File[] = [];

    Array.from(event.clipboardData.items).forEach((item) => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    });

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const onSubmit = (data: FormData) => {
    if (!currentUser) return;

    if (shouldShowRating && !rating) {
      setError('channel', {
        type: 'manual',
        message: isGoogleMaps
          ? 'Vui lòng chọn số sao Google Maps'
          : 'Vui lòng chọn điểm mạng xã hội',
      });

      return;
    }

    clearErrors('channel');

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
      rating: shouldShowRating ? rating : null,
      content: data.content,
      sentiment: detectSentiment(data.content),
      category: data.category,
      collected_by: currentUser.id,
      notes: data.notes || null,
      stay_date: data.check_in_date || null,
      check_out_date: data.check_out_date || null,
      review_date: now.split('T')[0],
      status: hasResponse ? ReviewStatus.Resolved : ReviewStatus.Pending,
      images,
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
            <select
              {...register('channel', {
                onChange: (e) => {
                  setValue('channel', e.target.value as ReviewChannel);
                  setRating(null);
                  clearErrors('channel');
                },
              })}
              className={inputCls}
            >
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
          <label className={labelCls}>Loại phản ánh *</label>
          <select {...register('category')} className={inputCls}>
            <option value="">Chọn loại phản ánh</option>
            {Object.values(ReviewCategory).map((category) => (
              <option key={category} value={category}>
                {categoryLabel[category]}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className={errorCls}>{errors.category.message}</p>
          )}
        </div>

        {isGoogleMaps && (
          <div>
            <label className={labelCls}>Đánh giá sao Google Maps *</label>
            <StarRating
              rating={rating ?? 0}
              size={28}
              interactive
              onChange={setRating}
            />
          </div>
        )}

        {isSocialMedia && (
          <div>
            <label className={labelCls}>Điểm đánh giá mạng xã hội *</label>
            <select
              value={rating ?? ''}
              onChange={(e) =>
                setRating(e.target.value ? Number(e.target.value) : null)
              }
              className={inputCls}
            >
              <option value="">Chọn điểm</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map(
                (score) => (
                  <option key={score} value={score}>
                    {score}/10
                  </option>
                ),
              )}
            </select>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Số điện thoại</label>
            <input
              {...register('guest_phone')}
              className={inputCls}
              placeholder="0901234567"
            />
          </div>

          <div>
            <label className={labelCls}>Email khách</label>
            <input
              {...register('guest_email')}
              className={inputCls}
              placeholder="email@gmail.com"
            />
            {errors.guest_email && (
              <p className={errorCls}>{errors.guest_email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Ngày check-in</label>
            <input
              type="date"
              {...register('check_in_date')}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Ngày check-out</label>
            <input
              type="date"
              {...register('check_out_date')}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Nội dung đánh giá *</label>
          <textarea
            {...register('content')}
            rows={4}
            className={inputCls}
            placeholder="Nhập nội dung đánh giá của khách..."
          />
          {errors.content && (
            <p className={errorCls}>{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Ảnh đính kèm</label>

          <div
            tabIndex={0}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`rounded-lg border-2 border-dashed p-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              isDragging
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 bg-gray-50 text-gray-500'
            }`}
          >
            <p className="font-medium text-gray-700">
              Kéo thả ảnh vào đây hoặc bấm vào khung rồi Ctrl + V
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Ảnh sẽ được xem trước trước khi tạo đánh giá.
            </p>
          </div>

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <img
                    src={image}
                    alt={`Ảnh đính kèm ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Ghi chú nội bộ</label>
          <input
            {...register('notes')}
            className={inputCls}
            placeholder="Ghi chú cho nhân viên..."
          />
        </div>

        {isManager && (
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-primary-900">
              Phản hồi quản lý tùy chọn
            </h3>

            <div>
              <label className={labelCls}>Nội dung phản hồi</label>
              <textarea
                {...register('response_content')}
                rows={3}
                className={inputCls}
                placeholder="Nhập phản hồi cho đánh giá này..."
              />
            </div>

            <div>
              <label className={labelCls}>Hành động đã thực hiện</label>
              <input
                {...register('action_taken')}
                className={inputCls}
                placeholder="Mô tả hành động đã thực hiện..."
              />
            </div>
          </div>
        )}

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