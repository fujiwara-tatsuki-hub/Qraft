import type { Grade } from '@/types';
import { gradeToScore, scoreToGrade } from '@/utils/calculateComplianceGrade';

// コンプライアンス・期限厳守・リファラルの3評価を統合して個人総合評価を算出
// - undefined は平均対象から除外する
// - 3評価すべて undefined の場合のみ undefined を返す
// - calculateTeamScore.ts からは各メンバーの戻り値を gradeToScore で集計して再利用できる
export function calculateGrade(
  complianceGrade?: Grade,
  deadlineGrade?: Grade,
  referralGrade?: Grade,
): Grade | undefined {
  const scores = ([complianceGrade, deadlineGrade, referralGrade] as const)
    .filter((g): g is Grade => g !== undefined)
    .map(gradeToScore);

  if (scores.length === 0) return undefined;

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return scoreToGrade(average);
}
