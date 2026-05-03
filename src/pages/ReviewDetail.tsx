import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  MessageSquare,
  Building2,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';

import { useReviewStore } from '@/stores/reviewStore';
import { useBranchStore } from '@/stores/branchStore';
import { useAuthStore } from '@/stores/authStore';
import StarRating from '@/components/common/StarRating';
import Badge from '@/components/common/Badge';

import {
  formatDate,
  formatDateTime,
  sentimentColor,
  sentimentLabel,
  channelLabel,
  statusColor,
  statusLabel,
  roleLabel,
  generateId,
} from '@/lib/utils';

import { ReviewChannel, ReviewStatus, ReviewCategory } from '@/types';
import { users } from '@/data/users';
  const categoryLabel = {
  [ReviewCategory.Breakfast]: 'Ăn sáng',
  [ReviewCategory.Facility]: 'Cơ sở vật chất',
  [ReviewCategory.CleanlinessSmell]: 'Vệ sinh / Mùi',
  [ReviewCategory.Insect]: 'Côn trùng',
  [ReviewCategory.Operation]: 'Nghiệp vụ',
  [ReviewCategory.Attitude]: 'Thái độ',
  [ReviewCategory.Price]: 'Giá',
};
export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getReview, updateReview, getResponsesForReview, addResponse } =
    useReviewStore();
  const { getBranch } = useBranchStore();
  const { currentUser, canRespondToSpecificReview, canFinalizeReview } =
    useAuthStore();

  const review = getReview(id ?? '');
  const responses = getResponsesForReview(id ?? '');
  const branch = review ? getBranch(review.branch_id) : undefined;
  const collector = review
    ? users.find((user) => user.id === review.collected_by)
    : undefined;

  const [responseContent, setResponseContent] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!review) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={22} className="text-gray-400" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Không tìm thấy đánh giá
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Đánh giá này có thể đã bị xoá hoặc đường dẫn không hợp lệ.
          </p>

          <button
            onClick={() => navigate('/reviews')}
            className="mt-5 px-4 py-2 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const canReply = canRespondToSpecificReview(review.branch_id);
  const canFinalize = canFinalizeReview();

  const handleSubmitResponse = () => {
    if (!responseContent.trim() || !currentUser) return;

    const now = new Date().toISOString();

    addResponse({
      id: generateId('res'),
      review_id: review.id,
      responded_by: currentUser.id,
      content: responseContent.trim(),
      action_taken: actionTaken.trim() || null,
      response_date: now,
      created_at: now,
      updated_at: now,
    });

    if (review.status === ReviewStatus.Pending) {
      updateReview(review.id, { status: ReviewStatus.InProgress });
    }

    setResponseContent('');
    setActionTaken('');
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleStatusChange = (status: ReviewStatus) => {
    updateReview(review.id, { status });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/reviews')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 transition"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách đánh giá
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                    Chi tiết đánh giá
                  </p>

                  <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    {review.guest_name}
                  </h1>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Building2 size={15} />
                    <span>{branch?.name ?? review.branch_id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={sentimentColor(review.sentiment)}>
                    {sentimentLabel(review.sentiment)}
                  </Badge>

                  <Badge className={statusColor(review.status)}>
                    {statusLabel(review.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {review.rating ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Đánh giá:</span>

                  {review.channel === ReviewChannel.GoogleMaps && (
                    <StarRating rating={review.rating} size={22} />
                  )}

                  {review.channel === ReviewChannel.SocialMedia && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {review.rating}/10
                    </span>
                  )}
                </div>
              ) : null}

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>
              </div>

              {review.images && review.images.length > 0 && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <button
                    type="button"
                    onClick={() => setShowImages((prev) => !prev)}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Image ({review.images.length})
                  </button>

                  {showImages && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {review.images.map((img, index) => (
                        <img
                          key={`${img}-${index}`}
                          src={img}
                          alt={`Ảnh đính kèm ${index + 1}`}
                          className="rounded-lg border cursor-pointer hover:opacity-90 transition"
                          onClick={() => setSelectedImage(img)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {review.notes && (
                <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList size={15} className="text-yellow-700" />
                    <p className="text-sm font-semibold text-yellow-800">
                      Ghi chú nội bộ
                    </p>
                  </div>

                  <p className="text-sm text-yellow-800">{review.notes}</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Phản hồi quản lý
                </h2>

                <p className="text-sm text-gray-400">
                  {responses.length} phản hồi đã được ghi nhận
                </p>
              </div>
            </div>

            {responses.length > 0 ? (
              <div className="space-y-4 mb-6">
                {responses.map((response) => {
                  const responder = users.find(
                    (user) => user.id === response.responded_by,
                  );

                  return (
                    <div
                      key={response.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {responder?.name ?? response.responded_by}
                        </span>

                        {responder && (
                          <Badge className="bg-primary-100 text-primary-700">
                            {roleLabel(responder.role)}
                          </Badge>
                        )}

                        <span className="text-xs text-gray-400">
                          {formatDateTime(response.response_date)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {response.content}
                      </p>

                      {response.action_taken && (
                        <div className="mt-3 rounded-lg bg-white border border-gray-100 p-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Hành động đã thực hiện
                          </p>

                          <p className="text-sm text-gray-700">
                            {response.action_taken}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center mb-6">
                <p className="text-sm text-gray-500">
                  Chưa có phản hồi quản lý cho đánh giá này.
                </p>
              </div>
            )}

            {canReply && (
              <div className="border-t border-gray-100 pt-5 space-y-4">
                {showSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700">
                    <CheckCircle2 size={16} />
                    Phản hồi đã được gửi thành công.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung phản hồi *
                  </label>

                  <textarea
                    value={responseContent}
                    onChange={(event) =>
                      setResponseContent(event.target.value)
                    }
                    rows={4}
                    placeholder="Nhập nội dung phản hồi cho đánh giá này..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hành động đã thực hiện
                  </label>

                  <input
                    value={actionTaken}
                    onChange={(event) => setActionTaken(event.target.value)}
                    placeholder="Ví dụ: Đã kiểm tra phòng, nhắc nhở bộ phận liên quan..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!responseContent.trim() || !currentUser}
                    className="px-5 py-2.5 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Thông tin đánh giá
            </h3>

            <div className="space-y-4 text-sm">
              <InfoItem
                icon={<MessageSquare size={16} />}
                label="Kênh đánh giá"
                value={channelLabel(review.channel)}
              />
              <InfoItem
                icon={<ClipboardList size={16} />}
                label="Loại phản ánh"
                value={categoryLabel[review.category]}
              />
              <InfoItem
                icon={<Calendar size={16} />}
                label="Ngày đánh giá"
                value={formatDate(review.review_date)}
              />

              {review.stay_date && (
                <InfoItem
                  icon={<Calendar size={16} />}
                  label="Ngày check-in"
                  value={formatDate(review.stay_date)}
                />
              )}

              {review.check_out_date && (
                <InfoItem
                  icon={<Calendar size={16} />}
                  label="Ngày check-out"
                  value={formatDate(review.check_out_date)}
                />
              )}

              {review.guest_phone && (
                <InfoItem
                  icon={<Phone size={16} />}
                  label="Số điện thoại"
                  value={review.guest_phone}
                />
              )}

              {review.guest_email && (
                <InfoItem
                  icon={<Mail size={16} />}
                  label="Email"
                  value={review.guest_email}
                />
              )}

              <InfoItem
                icon={<User size={16} />}
                label="Người tổng hợp"
                value={collector?.name ?? 'Chưa xác định'}
              />
            </div>
          </section>

          {canFinalize && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Trạng thái xử lý
              </h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusChange(ReviewStatus.Reprocessing)}
                  disabled={review.status === ReviewStatus.Reprocessing}
                  className="w-full text-sm border border-yellow-300 text-yellow-700 rounded-xl px-3 py-2 hover:bg-yellow-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xử lý lại
                </button>

                <button
                  onClick={() => handleStatusChange(ReviewStatus.Resolved)}
                  disabled={review.status === ReviewStatus.Resolved}
                  className="w-full text-sm border border-green-300 text-green-700 rounded-xl px-3 py-2 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Đã xử lý
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Chỉ Admin được quyền chốt trạng thái cuối cùng.
              </p>
            </section>
          )}
        </aside>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Ảnh đính kèm"
            className="max-h-[90vh] max-w-full rounded-lg bg-white"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}