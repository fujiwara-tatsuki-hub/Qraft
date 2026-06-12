import { supabase } from '@/lib/supabase';
import type { Member, MemberRole, CreateMemberInput } from '@/types/member';

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

export async function createMember(input: CreateMemberInput): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert({ team_id: input.teamId, name: input.name, role: input.role })
    .select()
    .single();

  if (error) throw new Error(`createMember: ${error.message}`);
  return toMember(data as MemberRow);
}

export async function deleteMemberById(id: string): Promise<void> {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteMemberById: ${error.message}`);
}

// チーム内で指定ロールを持つメンバーを全員 'member' に降格
// メンバー追加時・チーム移動時にリーダー重複を防ぐために使用
export async function clearRoleInTeam(
  teamId: string,
  role: 'leader' | 'sub_leader',
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ role: 'member' })
    .eq('team_id', teamId)
    .eq('role', role);

  if (error) throw new Error(`clearRoleInTeam: ${error.message}`);
}

export async function updateMemberName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ name })
    .eq('id', id);
  if (error) throw new Error(`updateMemberName: ${error.message}`);
}

// チームを移動する（役職はメンバーにリセット）
export async function updateMemberTeam(memberId: string, newTeamId: string): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ team_id: newTeamId, role: 'member' })
    .eq('id', memberId);

  if (error) throw new Error(`updateMemberTeam: ${error.message}`);
}

// チーム内の全メンバーを一旦 member にリセットし、指定メンバーに leader/sub_leader を付与
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
