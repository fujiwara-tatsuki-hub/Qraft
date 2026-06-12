import type { Grade } from '@/types';

export type MemberRole = 'リーダー' | 'サブリーダー' | 'メンバー';

// DB に保存する英語 role 値
export type DbMemberRole = 'leader' | 'sub_leader' | 'member';

export type Member = {
  id: string;
  teamId: string;
  name: string;
  role: MemberRole;
  // 追加プロフィール情報
  phone?: string;
  email?: string;
  address?: string;
  client?: string;
  contactName?: string;
  storeName?: string;
  overallGrade?: Grade;
};

export type CreateMemberInput = {
  teamId: string;
  name: string;
  role: DbMemberRole;
};
