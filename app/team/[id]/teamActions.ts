'use server';

import { revalidatePath } from 'next/cache';
import {
  updateTeamName,
  updateTeamLeaderInfo,
  updateTeamLeaderName,
  updateTeamSubLeaderName,
} from '@/repositories/teamRepository';
import {
  getMemberById,
  createMember,
  deleteMemberById,
  clearRoleInTeam,
  resetAndSetMemberRoles,
  updateMemberOrderIndex,
} from '@/repositories/memberRepository';
import type { DbMemberRole } from '@/types/member';

export type ActionState = { error: string | null; success: boolean };

const VALID_ROLES = new Set<string>(['leader', 'sub_leader', 'member']);

export async function submitTeamName(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teamId = (formData.get('teamId') ?? '').toString();
  const name   = (formData.get('name') ?? '').toString().trim();

  if (!teamId) return { error: 'チームIDが不正です', success: false };
  if (!name)   return { error: 'チーム名を入力してください', success: false };

  try {
    await updateTeamName(teamId, name);
    revalidatePath(`/team/${teamId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '保存に失敗しました', success: false };
  }
}

export async function submitLeaderChange(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teamId      = (formData.get('teamId') ?? '').toString();
  const leaderId    = (formData.get('leaderId') ?? '').toString();
  const subLeaderId = (formData.get('subLeaderId') ?? '').toString();

  if (!teamId || !leaderId || !subLeaderId)
    return { error: '全ての項目を選択してください', success: false };
  if (leaderId === subLeaderId)
    return { error: 'リーダーとサブリーダーは異なるメンバーを選択してください', success: false };

  try {
    const [leader, subLeader] = await Promise.all([
      getMemberById(leaderId),
      getMemberById(subLeaderId),
    ]);
    if (!leader || !subLeader)
      return { error: 'メンバーが見つかりません', success: false };

    await resetAndSetMemberRoles(teamId, leaderId, subLeaderId);
    await updateTeamLeaderInfo(teamId, leader.name, subLeader.name);

    revalidatePath(`/team/${teamId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '変更に失敗しました', success: false };
  }
}

export async function submitAddMember(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teamId = (formData.get('teamId') ?? '').toString();
  const name   = (formData.get('name') ?? '').toString().trim();
  const role   = (formData.get('role') ?? '').toString();

  if (!teamId) return { error: 'チームIDが不正です', success: false };
  if (!name)   return { error: '氏名を入力してください', success: false };
  if (!VALID_ROLES.has(role)) return { error: '役職を選択してください', success: false };

  try {
    // リーダー/サブリーダーとして追加する場合は既存の同役職を降格
    if (role === 'leader')     await clearRoleInTeam(teamId, 'leader');
    if (role === 'sub_leader') await clearRoleInTeam(teamId, 'sub_leader');

    const newMember = await createMember({ teamId, name, role: role as DbMemberRole });

    // チームのリーダー表示名を更新
    if (role === 'leader')     await updateTeamLeaderName(teamId, newMember.name);
    if (role === 'sub_leader') await updateTeamSubLeaderName(teamId, newMember.name);

    revalidatePath(`/team/${teamId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '追加に失敗しました', success: false };
  }
}

// メンバーの表示順を一括保存（client から orderedIds[] を直接渡す）
export async function submitMemberOrder(
  teamId: string,
  orderedIds: string[],
): Promise<void> {
  await Promise.all(orderedIds.map((id, index) => updateMemberOrderIndex(id, index)));
  revalidatePath(`/team/${teamId}`);
  revalidatePath('/');
}

// フォームを使わず直接呼び出せるシンプルな削除関数
// DeleteMemberButton から startTransition 経由で呼ぶ
export async function submitDeleteMember(memberId: string): Promise<ActionState> {
  try {
    const member = await getMemberById(memberId);
    if (!member) return { error: 'メンバーが見つかりません', success: false };

    await deleteMemberById(memberId);

    // 削除されたメンバーがリーダー/サブリーダーだった場合はチームの表示名を空欄に
    if (member.role === 'リーダー') {
      await updateTeamLeaderName(member.teamId, '');
    } else if (member.role === 'サブリーダー') {
      await updateTeamSubLeaderName(member.teamId, '');
    }

    revalidatePath(`/team/${member.teamId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '削除に失敗しました', success: false };
  }
}
