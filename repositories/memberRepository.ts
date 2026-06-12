import { supabase } from '@/lib/supabase';
import type { Member, MemberRole } from '@/types/member';

// Supabase から返される生の行型（snake_case）
type MemberRow = {
  id: string;
  team_id: string;
  name: string;
  role: 'leader' | 'sub_leader' | 'member';
};

// DB の英語 role → 表示用の日本語 MemberRole
const roleMap: Record<MemberRow['role'], MemberRole> = {
  leader:     'リーダー',
  sub_leader: 'サブリーダー',
  member:     'メンバー',
};

function toMember(row: MemberRow): Member {
  return {
    id:     row.id,
    teamId: row.team_id,
    name:   row.name,
    role:   roleMap[row.role],
  };
}

export async function getMembersByTeamId(teamId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('id, team_id, name, role')
    .eq('team_id', teamId)
    .order('created_at');

  if (error) throw new Error(`getMembersByTeamId: ${error.message}`);
  return ((data as MemberRow[]) ?? []).map(toMember);
}

export async function getMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('id, team_id, name, role')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`getMemberById: ${error.message}`);
  if (!data) return null;
  return toMember(data as MemberRow);
}

export async function updateMemberName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ name })
    .eq('id', id);
  if (error) throw new Error(`updateMemberName: ${error.message}`);
}

// チーム内の全メンバーを一旦 member にリセットし、指定メンバーに leader/sub_leader を付与
// リーダー変更フォームから呼び出す
export async function resetAndSetMemberRoles(
  teamId: string,
  leaderId: string,
  subLeaderId: string,
): Promise<void> {
  const { error: resetError } = await supabase
    .from('members')
    .update({ role: 'member' })
    .eq('team_id', teamId);
  if (resetError) throw new Error(`resetAndSetMemberRoles (reset): ${resetError.message}`);

  const { error: leaderError } = await supabase
    .from('members')
    .update({ role: 'leader' })
    .eq('id', leaderId);
  if (leaderError) throw new Error(`resetAndSetMemberRoles (leader): ${leaderError.message}`);

  const { error: subError } = await supabase
    .from('members')
    .update({ role: 'sub_leader' })
    .eq('id', subLeaderId);
  if (subError) throw new Error(`resetAndSetMemberRoles (sub_leader): ${subError.message}`);
}
