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
    id:             row.id,
    name:           row.name,
    leaderName:     row.leader_name,
    subLeaderName:  row.sub_leader_name,
    memberCount:    row.members.length,
    // 評価グレードは ⑨ 自動評価ロジック実装後に追加
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
