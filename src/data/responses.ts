import type { ManagerResponse } from '@/types';

const responseContents = [
  'Cảm ơn quý khách đã phản hồi. Chúng tôi sẽ cải thiện dịch vụ.',
  'Xin lỗi quý khách về sự bất tiện. Chúng tôi đã ghi nhận và sẽ khắc phục.',
  'Cảm ơn quý khách đã chia sẻ trải nghiệm tích cực. Rất vui được phục vụ!',
  'Chúng tôi rất tiếc về trải nghiệm không tốt. Đã chuyển phản hồi cho bộ phận liên quan.',
  'Cảm ơn quý khách! Hy vọng được đón tiếp quý khách lần sau.',
  'Xin lỗi về sự cố này. Chúng tôi đã sửa chữa và nâng cấp phòng.',
  'Cảm ơn đánh giá của quý khách. Chúng tôi luôn nỗ lực cải thiện.',
  'Rất vui khi quý khách hài lòng. Hẹn gặp lại quý khách!',
  'Chúng tôi đã chuyển phản hồi cho quản lý chi nhánh để xử lý.',
  'Xin chân thành cảm ơn. Phản hồi của quý khách rất quý giá.',
];

const actionsTaken = [
  'Đã nhắc nhở nhân viên về thái độ phục vụ.',
  'Đã sửa chữa thiết bị trong phòng.',
  'Đã nâng cấp hệ thống wifi toàn chi nhánh.',
  'Đã thay mới khăn tắm và ga giường.',
  'Đã kiểm tra và sửa chữa hệ thống nước nóng.',
  'Đã tặng voucher giảm giá cho lần lưu trú tiếp theo.',
  'Đã đào tạo lại nhân viên lễ tân.',
  'Đã cải thiện thực đơn bữa sáng.',
  null,
  null,
];

const responders = ['usr-001', 'usr-002', 'usr-003'];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function pad(n: number): string {
  return n.toString().padStart(3, '0');
}

function generateResponses(): ManagerResponse[] {
  const rand = seededRandom(99);
  const result: ManagerResponse[] = [];
  const usedReviewIds = new Set<string>();

  for (let i = 1; i <= 55; i++) {
    // Pick a review ID that hasn't been used yet, weighted toward lower IDs
    let reviewIdx: number;
    do {
      reviewIdx = Math.floor(rand() * 150) + 1;
    } while (usedReviewIds.has(`rev-${pad(reviewIdx)}`));
    usedReviewIds.add(`rev-${pad(reviewIdx)}`);

    const respondedBy = responders[Math.floor(rand() * responders.length)];
    const content = responseContents[Math.floor(rand() * responseContents.length)];
    const actionTaken = actionsTaken[Math.floor(rand() * actionsTaken.length)];

    const startMs = new Date('2025-07-01').getTime();
    const endMs = new Date('2026-04-10').getTime();
    const responseDate = new Date(startMs + rand() * (endMs - startMs));

    result.push({
      id: `res-${pad(i)}`,
      review_id: `rev-${pad(reviewIdx)}`,
      responded_by: respondedBy,
      content,
      action_taken: actionTaken,
      response_date: responseDate.toISOString(),
      created_at: responseDate.toISOString(),
      updated_at: responseDate.toISOString(),
    });
  }

  return result;
}

export const responses: ManagerResponse[] = generateResponses();
