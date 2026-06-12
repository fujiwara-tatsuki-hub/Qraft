import type { Grade } from '@/types';

export type MemberRole = 'リーダー' | 'サブリーダー' | 'メンバー';

// DB に保存する英語 role 値
export type DbMemberRole = 'leader' | 'sub_leader' | 'member';

export type Member = {
  id: string;
  teamId: string;
  name: string;
  role: MemberRole;
  createdAt?: string;
  overallGrade?: Grade;
};

export type CreateMemberInput = {
  teamId: string;
  name: string;
  role: DbMemberRole;
};
