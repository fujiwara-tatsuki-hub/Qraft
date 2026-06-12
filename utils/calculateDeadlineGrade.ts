import type { Grade } from '@/types';
import type { DeadlineRecord } from '@/types/deadlineRecord';

// NG件数 ÷ 経過月数（最低1ヶ月）でレートを算出してグレードに変換
// 0件（記録なし）→ C（デフォルト）
// レート ≤ 0.5件/月 → B（2ヶ月に1件以内）
// レート ≤ 1.0件/月 → C（月1件程度）
// レート  > 1.0件/月 → D（月1件超）
export function calculateDeadlineGrade(records: DeadlineRecord[]): Grade {
  const ngRecords = records.filter((r) => !r.isCompleted);

  if (ngRecords.length === 0) return 'C';

  const earliestMs = Math.min(...ngRecords.map((r) => new Date(r.createdAt).getTime()));
  const months = Math.max(1, (Date.now() - earliestMs) / (1000 * 60 * 60 * 24 * 30));
  const rate = ngRecords.length / months;

  if (rate <= 0.5) return 'B';
  if (rate <= 1.0) return 'C';
  return 'D';
}
