import type { Grade } from '@/types';
import type { Evaluation } from '@/types/evaluation';

// Grade → 点数（deadline・referral 算出でも共用できるよう export）
export function gradeToScore(grade: Grade): number {
  const map: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1 };
  return map[grade];
}

// 平均点 → Grade
// 閾値は仕様書の 3.5 / 2.5 / 1.5 に準拠
export function scoreToGrade(score: number): Grade {
  if (score >= 3.5) return 'A';
  if (score >= 2.5) return 'B';
  if (score >= 1.5) return 'C';
  return 'D';
}

// メンバーの評価リストからコンプライアンスグレードを算出
// 3評価者 × 3項目 = 最大9スコアの単純平均
// evaluations が空の場合は未評価として undefined を返す
export function calculateComplianceGrade(evaluations: Evaluation[]): Grade | undefined {
  if (evaluations.length === 0) return undefined;

  const scores: number[] = [];

  for (const ev of evaluations) {
    scores.push(gradeToScore(ev.attendanceGrade));
    scores.push(gradeToScore(ev.reportingGrade));
    scores.push(gradeToScore(ev.initiativeGrade));
  }

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return scoreToGrade(average);
}
