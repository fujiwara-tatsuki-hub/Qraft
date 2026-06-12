import type { Grade } from '@/types';
import type { DeadlineRecord } from '@/types/deadlineRecord';

// 達成率（0〜100）をグレードに変換
// 仕様：95%以上=A, 85%以上=B, 70%以上=C, 70%未満=D
function achievementRateToGrade(rate: number): Grade {
  if (rate >= 95) return 'A';
  if (rate >= 85) return 'B';
  if (rate >= 70) return 'C';
  return 'D';
}

// メンバーの期限厳守レコードから達成率グレードを算出
// records が空の場合は未入力として undefined を返す
export function calculateDeadlineGrade(records: DeadlineRecord[]): Grade | undefined {
  if (records.length === 0) return undefined;

  const completedCount = records.filter((r) => r.isCompleted).length;
  const rate = (completedCount / records.length) * 100;

  return achievementRateToGrade(rate);
}
