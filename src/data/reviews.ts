import type { Review } from '@/types';
import { ReviewChannel, Sentiment, ReviewStatus, ReviewCategory } from '@/types';
import { branches } from '@/data/branches';
import { caregivers } from '@/data/caregivers';

const branchIds = branches.map((branch) => branch.id);
const caregiverIds = caregivers.map((c) => c.id);

const positiveContents = [
  'Phòng sạch sẽ, nhân viên thân thiện và hỗ trợ nhiệt tình.',
  'Vị trí khách sạn thuận tiện, dễ di chuyển.',
  'Nhân viên lễ tân hỗ trợ gọi taxi nhanh, thái độ vui vẻ.',
  'Phòng đầy đủ tiện nghi, giường êm, trải nghiệm tốt.',
  'Khách sạn sạch sẽ, phù hợp với nhu cầu công tác.',
];

const neutralContents = [
  'Phòng ổn, không có gì đặc biệt.',
  'Phòng hơi nhỏ nhưng đầy đủ tiện nghi.',
  'Bữa sáng tạm được, nên có thêm lựa chọn.',
  'Check-in hơi lâu nhưng nhân viên vẫn hỗ trợ tốt.',
  'Wifi đôi lúc chưa ổn định, còn lại khá hài lòng.',
];

const negativeContents = [
  'Điều hòa chưa đủ mát, cần kiểm tra lại.',
  'Cách âm chưa tốt, ban đêm hơi ồn.',
  'Phòng có mùi ẩm, cần xử lý kỹ hơn.',
  'Nhà vệ sinh thoát nước chậm, gây bất tiện.',
  'Khăn tắm hơi cũ, nên được thay mới.',
];

const guestNames = [
  'Nguyễn Thị Hương',
  'Trần Văn Minh',
  'Lê Thị Thu',
  'Phạm Đức Long',
  'Hoàng Văn Hải',
  'Võ Thị Ngọc',
  'Đặng Quốc Việt',
  'Bùi Thị Linh',
  'David Lee',
  'Anna Smith',
  'Kim Minji',
  'Tanaka Hiroshi',
];

const channels = [
  ReviewChannel.GoogleMaps,
  ReviewChannel.SocialMedia,
  ReviewChannel.Phone,
  ReviewChannel.WalkIn,
  ReviewChannel.Other,
];

const statuses = [
  ReviewStatus.Pending,
  ReviewStatus.InProgress,
  ReviewStatus.Reprocessing,
  ReviewStatus.Resolved,
  ReviewStatus.Archived,
];

const categories = [
  ReviewCategory.Breakfast,
  ReviewCategory.Facility,
  ReviewCategory.CleanlinessSmell,
  ReviewCategory.Insect,
  ReviewCategory.Operation,
  ReviewCategory.Attitude,
  ReviewCategory.Price,
];

function pad(num: number) {
  return String(num).padStart(3, '0');
}

function getRandomItem<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function getRatingByChannel(channel: ReviewChannel, index: number) {
  if (channel === ReviewChannel.GoogleMaps) {
    return (index % 5) + 1;
  }

  if (channel === ReviewChannel.SocialMedia) {
    return (index % 10) + 1;
  }

  return null;
}

function getSentimentByChannelRating(
  channel: ReviewChannel,
  rating: number | null,
  index: number,
) {
  if (channel === ReviewChannel.GoogleMaps && rating !== null) {
    if (rating >= 4) return Sentiment.Positive;
    if (rating === 3) return Sentiment.Neutral;
    return Sentiment.Negative;
  }

  if (channel === ReviewChannel.SocialMedia && rating !== null) {
    if (rating >= 8) return Sentiment.Positive;
    if (rating >= 5) return Sentiment.Neutral;
    return Sentiment.Negative;
  }

  const sentiments = [Sentiment.Positive, Sentiment.Neutral, Sentiment.Negative];
  return getRandomItem(sentiments, index);
}

function getContentBySentiment(sentiment: Sentiment) {
  if (sentiment === Sentiment.Positive) return positiveContents;
  if (sentiment === Sentiment.Neutral) return neutralContents;
  return negativeContents;
}

function createReview(index: number): Review {
  const channel = getRandomItem(channels, index);
  const rating = getRatingByChannel(channel, index);
  const sentiment = getSentimentByChannelRating(channel, rating, index);
  const contentPool = getContentBySentiment(sentiment);

  const day = ((index % 28) + 1).toString().padStart(2, '0');
  const month = ((index % 4) + 1).toString().padStart(2, '0');
  const reviewDate = `2026-${month}-${day}`;

  return {
    id: `rev-${pad(index + 1)}`,
    branch_id: getRandomItem(branchIds, index),
    guest_name: getRandomItem(guestNames, index),
    guest_phone: index % 3 === 0 ? `09${String(index).padStart(8, '0')}` : null,
    guest_email: index % 4 === 0 ? `guest${index + 1}@gmail.com` : null,
    channel,
    rating,
    content: getRandomItem(contentPool, index),
    sentiment,
    category: getRandomItem(categories, index),
    collected_by: getRandomItem(caregiverIds, index),
    notes: index % 5 === 0 ? 'Cần theo dõi và phản hồi lại khách.' : null,
    stay_date: `2026-${month}-${String(Math.max(1, Number(day) - 1)).padStart(2, '0')}`,
    check_out_date: reviewDate,
    review_date: reviewDate,
    status: getRandomItem(statuses, index),
    images: [],
    created_at: `${reviewDate}T08:00:00.000Z`,
    updated_at: `${reviewDate}T08:00:00.000Z`,
  };
}

export const reviews: Review[] = Array.from({ length: 200 }, (_, index) =>
  createReview(index),
);