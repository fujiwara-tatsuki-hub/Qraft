import type { Grade } from '@/types';
import type { DeadlineRecord } from '@/types/deadlineRecord';

// NG件数 + 期間でグレードを算出
//
// NG記録なし（memberCreatedAt なし）        → C
// NG記録なし、1ヶ月未満                     → C
// NG記録なし、1ヶ月以上                     → B
// NG記録なし、2ヶ月以上                     → A
//
// NG記録あり（レート = NG件数 ÷ 経過月数）:
//   レート ≤ 0.5件/月  → A
//   レート ≤ 1.0件/月  → B
//   レート ≤ 1.5件/月  → C
//   レート  > 1.5件/月 → D
export function calculateDeadlineGrade(
  records: DeadlineRecord[],
  memberCreatedAt?: string,
): Grade {
  const ngRecords = records.filter((r) => !r.isCompleted);

  if (ngRecords.length === 0) {
    if (!memberCreatedAt) return 'C';
    const months = (Date.now() - new Date(memberCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (months >= 2) return 'A';
    if (months >= 1) return 'B';
    return 'C';
  }

  const earliestMs = Math.min(...ngRecords.map((r) => new Date(r.createdAt).getTime()));
  const months = Math.max(1, (Date.now() - earliestMs) / (1000 * 60 * 60 * 24 * 30));
  const rate = ngRecords.length / months;

  if (rate <= 0.5) return 'A';
  if (rate <= 1.0) return 'B';
  if (rate <= 1.5) return 'C';
  return 'D';
}
