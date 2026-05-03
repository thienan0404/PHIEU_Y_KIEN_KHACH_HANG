import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Sentiment, ReviewChannel, ReviewStatus, UserRole } from '@/types';

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: vi });
}

export function formatDateTime(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: vi });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function sentimentColor(sentiment: Sentiment): string {
  switch (sentiment) {
    case Sentiment.Positive: return 'bg-green-100 text-green-800';
    case Sentiment.Neutral: return 'bg-yellow-100 text-yellow-800';
    case Sentiment.Negative: return 'bg-red-100 text-red-800';
  }
}

export function sentimentLabel(sentiment: Sentiment): string {
  switch (sentiment) {
    case Sentiment.Positive: return 'Tích cực';
    case Sentiment.Neutral: return 'Trung lập';
    case Sentiment.Negative: return 'Tiêu cực';
  }
}

export function channelLabel(channel: ReviewChannel): string {
  switch (channel) {
    case ReviewChannel.SocialMedia: return 'Mạng xã hội';
    case ReviewChannel.Phone: return 'Điện thoại';
    case ReviewChannel.GoogleMaps: return 'Google Maps';
    case ReviewChannel.WalkIn: return 'Trực tiếp';
    case ReviewChannel.Other: return 'Khác';
  }
}

export function statusLabel(status: ReviewStatus): string {
  switch (status) {
   case ReviewStatus.Pending:
  return 'Chờ xử lý';
  case ReviewStatus.InProgress:
  return 'Đang xử lý';
  case ReviewStatus.Reprocessing:
  return 'Xử lý lại';
  case ReviewStatus.Resolved:
  return 'Đã xử lý';
  case ReviewStatus.Archived:
  return 'Lưu trữ';
  }
}

export function statusColor(status: ReviewStatus): string {
  switch (status) {
    case ReviewStatus.Pending:
      return 'bg-orange-100 text-orange-800';

    case ReviewStatus.InProgress:
      return 'bg-blue-100 text-blue-800';

    case ReviewStatus.Reprocessing:
      return 'bg-yellow-100 text-yellow-800';

    case ReviewStatus.Resolved:
      return 'bg-green-100 text-green-800';

    case ReviewStatus.Archived:
      return 'bg-gray-100 text-gray-800';
  }
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case UserRole.Admin:
      return 'Quản trị viên';

    case UserRole.Inspector:
      return 'Phòng Thanh Tra';

    case UserRole.Trainer:
      return 'Phòng Đào Tạo';

    case UserRole.ReceptionLeader:
      return 'Tổ Trưởng Lễ Tân';

    case UserRole.BranchDirector:
      return 'Ban Giám Đốc Chi Nhánh';

    case UserRole.BusinessDirector:
      return 'Giám Đốc Kinh Doanh';

    case UserRole.CustomerService:
      return 'Phòng Khách Hàng & Dữ Liệu';

    default:
      return 'Không xác định';
  }
}

export function detectSentiment(content: string): Sentiment {
  const lower = content.toLowerCase();
  const positiveWords = ['tốt', 'tuyệt', 'xuất sắc', 'hài lòng', 'đẹp', 'sạch', 'thân thiện', 'ngon', 'thoải mái', 'chuyên nghiệp', 'great', 'excellent', 'good', 'amazing'];
  const negativeWords = ['tệ', 'bẩn', 'kém', 'thất vọng', 'hỏng', 'ồn', 'hôi', 'chậm', 'tồi', 'bad', 'dirty', 'terrible', 'worst'];

  const hasPositive = positiveWords.some(w => lower.includes(w));
  const hasNegative = negativeWords.some(w => lower.includes(w));

  if (hasNegative && !hasPositive) return Sentiment.Negative;
  if (hasPositive && !hasNegative) return Sentiment.Positive;
  return Sentiment.Neutral;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
