import type { Grade } from '@/types';
import type { ReferralRecord } from '@/types/referralRecord';

// 加重スコア定数
const WEIGHTS = {
  consultation: 0.5,
  interview:    2,
  offer:        5,
} as const;

// 月あたりレートしきい値（内定1件を基準に設計）
// 内定1件 ÷ 2ヶ月 = 2.5 → A
// 内定1件 ÷ 4ヶ月 = 1.25 → B
// 内定1件 ÷ 6ヶ月 ≈ 0.833 → C
const RATE_THRESHOLDS = {
  A: 5 / 2,  // 2.5
  B: 5 / 4,  // 1.25
  C: 5 / 6,  // ≈ 0.833
} as const;

export function calculateReferralGrade(
  records: ReferralRecord[],
  memberCreatedAt?: string,
): Grade | undefined {
  const totalScore = records.reduce(
    (sum, r) =>
      sum +
      r.consultationCount * WEIGHTS.consultation +
      r.interviewCount    * WEIGHTS.interview +
      r.offerCount        * WEIGHTS.offer,
    0,
  );

  if (totalScore === 0) {
    if (!memberCreatedAt) return undefined;
    const months =
      (Date.now() - new Date(memberCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return months < 1 ? 'C' : 'D';
  }

  const months = memberCreatedAt
    ? Math.max(1, (Date.now() - new Date(memberCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 1;
  const rate = totalScore / months;

  if (rate >= RATE_THRESHOLDS.A) return 'A';
  if (rate >= RATE_THRESHOLDS.B) return 'B';
  if (rate >= RATE_THRESHOLDS.C) return 'C';
  return 'D';
}
