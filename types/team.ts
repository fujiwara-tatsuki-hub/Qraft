import type { Grade } from '@/types';

export type Team = {
  id: string;
  name: string;
  leaderName: string;
  subLeaderName: string;
  memberCount: number;
  // 評価グレードは ⑨ 自動評価ロジック実装後に値が入る
  overallGrade?: Grade;
  deadlineGrade?: Grade;
  referralGrade?: Grade;
  complianceGrade?: Grade;
};
