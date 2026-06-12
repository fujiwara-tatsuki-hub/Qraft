import type { Grade } from '@/types';
import type { ReferralRecord } from '@/types/referralRecord';
import { scoreToGrade } from '@/utils/calculateComplianceGrade';

// 評価基準（変更時はここだけ修正する）
const OFFER_THRESHOLDS = {
  A: 3, // offer_count >= 3 → A
  B: 2, // offer_count >= 2 → B
  C: 1, // offer_count >= 1 → C
         // offer_count  = 0 → D
} as const;

// 累計内定数を 4点スケールのスコアに変換し、scoreToGrade に委譲
function offerCountToScore(count: number): number {
  if (count >= OFFER_THRESHOLDS.A) return 4;
  if (count >= OFFER_THRESHOLDS.B) return 3;
  if (count >= OFFER_THRESHOLDS.C) return 2;
  return 1;
}

// メンバーのリファラルレコードから評価グレードを算出
// 累計 offer_count をもとに判定する
// records が空の場合は未入力として undefined を返す
export function calculateReferralGrade(records: ReferralRecord[]): Grade | undefined {
  if (records.length === 0) return undefined;

  const totalOffers = records.reduce((sum, r) => sum + r.offerCount, 0);
  return scoreToGrade(offerCountToScore(totalOffers));
}
