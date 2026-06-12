import type { Grade } from '@/types';
import type { DeadlineRecord } from '@/types/deadlineRecord';

// NGの件数が少ないほど評価が高い
// 0件=A, 1-2件=B, 3-5件=C, 6件以上=D
// records が空の場合は未入力として undefined を返す
export function calculateDeadlineGrade(records: DeadlineRecord[]): Grade | undefined {
  if (records.length === 0) return undefined;

  const ngCount = records.filter((r) => !r.isCompleted).length;
  if (ngCount === 0) return 'A';
  if (ngCount <= 2)  return 'B';
  if (ngCount <= 5)  return 'C';
  return 'D';
}
