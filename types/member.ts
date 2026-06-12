import type { Grade } from '@/types';

export type MemberRole = 'リーダー' | 'サブリーダー' | 'メンバー';

export type Member = {
  id: string;
  teamId: string;
  name: string;
  role: MemberRole;
  // 評価グレードは ⑨ 自動評価ロジック実装後に値が入る
  overallGrade?: Grade;
};
