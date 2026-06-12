'use server';

import { revalidatePath } from 'next/cache';
import { updateTeamName, updateTeamLeaderInfo } from '@/repositories/teamRepository';
import { getMemberById, resetAndSetMemberRoles } from '@/repositories/memberRepository';

export type ActionState = { error: string | null; success: boolean };

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
