import { supabase } from '@/lib/supabase';
import type { Member, MemberRole, CreateMemberInput } from '@/types/member';

// Supabase から返される生の行型（snake_case）
type MemberRow = {
  id: string;
  team_id: string;
  name: string;
  role: 'leader' | 'sub_leader' | 'member';
};

// getMemberById 用の拡張行型（プロフィールフィールドを含む）
type FullMemberRow = MemberRow & {
  phone:        string | null;
  email:        string | null;
  address:      string | null;
  client:       string | null;
  contact_name: string | null;
  store_name:   string | null;
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

function toFullMember(row: FullMemberRow): Member {
  return {
    ...toMember(row),
    phone:       row.phone        ?? undefined,
    email:       row.email        ?? undefined,
    address:     row.address      ?? undefined,
    client:      row.client       ?? undefined,
    contactName: row.contact_name ?? undefined,
    storeName:   row.store_name   ?? undefined,
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
    .select('id, team_id, name, role, phone, email, address, client, contact_name, store_name')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`getMemberById: ${error.message}`);
  if (!data) return null;
  return toFullMember(data as FullMemberRow);
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

// プロフィール情報を一括更新
export async function updateMemberProfile(
  id: string,
  data: {
    name:        string;
    phone:       string;
    email:       string;
    address:     string;
    client:      string;
    contactName: string;
    storeName:   string;
  },
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({
      name:         data.name,
      phone:        data.phone        || null,
      email:        data.email        || null,
      address:      data.address      || null,
      client:       data.client       || null,
      contact_name: data.contactName  || null,
      store_name:   data.storeName    || null,
    })
    .eq('id', id);
  if (error) throw new Error(`updateMemberProfile: ${error.message}`);
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
