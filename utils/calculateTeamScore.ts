import type { Grade } from '@/types';
import { gradeToScore, scoreToGrade } from '@/utils/calculateComplianceGrade';

// 各メンバーの個人総合評価からチーム総合評価を算出
// - undefined は平均対象から除外する
// - 全員 undefined の場合のみ undefined を返す
// - チーム一覧・チーム詳細・ランキングから共通で呼び出せる
export function calculateTeamScore(
  memberGrades: (Grade | undefined)[],
): Grade | undefined {
  const scores = memberGrades
    .filter((g): g is Grade => g !== undefined)
    .map(gradeToScore);

  if (scores.length === 0) return undefined;

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return scoreToGrade(average);
}
