import { supabase } from '@/lib/supabase';
import type { Team } from '@/types/team';

// Supabase から返される生の行型（snake_case）
type TeamRow = {
  id: string;
  name: string;
  leader_name: string;
  sub_leader_name: string;
  members: { id: string }[];
};

function toTeam(row: TeamRow): Team {
  return {
    id:            row.id,
    name:          row.name,
    leaderName:    row.leader_name,
    subLeaderName: row.sub_leader_name,
    memberCount:   row.members.length,
  };
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, leader_name, sub_leader_name, members(id)')
    .order('name');

  if (error) throw new Error(`getTeams: ${error.message}`);
  return ((data as TeamRow[]) ?? []).map(toTeam);
}

export async function getTeamById(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, leader_name, sub_leader_name, members(id)')
    .eq('id', id)
    .single();

  if (error) return null;
  return toTeam(data as TeamRow);
}

export async function updateTeamName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .update({ name })
    .eq('id', id);
  if (error) throw new Error(`updateTeamName: ${error.message}`);
}

// リーダー変更時に leader_name / sub_leader_name を同時更新
export async function updateTeamLeaderInfo(
  id: string,
  leaderName: string,
  subLeaderName: string,
): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .update({ leader_name: leaderName, sub_leader_name: subLeaderName })
    .eq('id', id);
  if (error) throw new Error(`updateTeamLeaderInfo: ${error.message}`);
}

// メンバー名変更時にリーダー名のみ更新
export async function updateTeamLeaderName(id: string, leaderName: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .update({ leader_name: leaderName })
    .eq('id', id);
  if (error) throw new Error(`updateTeamLeaderName: ${error.message}`);
}

// メンバー名変更時にサブリーダー名のみ更新
export async function updateTeamSubLeaderName(id: string, subLeaderName: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .update({ sub_leader_name: subLeaderName })
    .eq('id', id);
  if (error) throw new Error(`updateTeamSubLeaderName: ${error.message}`);
}
