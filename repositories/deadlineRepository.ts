import { supabase } from '@/lib/supabase';
import type { DeadlineRecord, CreateDeadlineRecordInput } from '@/types/deadlineRecord';

// Supabase から返される生の行型（snake_case）
type DeadlineRecordRow = {
  id:           string;
  member_id:    string;
  category:     'document' | 'training' | 'transportation_expense' | 'shift' | 'other';
  is_completed: boolean;
  created_at:   string;
};

function toDeadlineRecord(row: DeadlineRecordRow): DeadlineRecord {
  return {
    id:          row.id,
    memberId:    row.member_id,
    category:    row.category,
    isCompleted: row.is_completed,
    createdAt:   row.created_at,
  };
}

// メンバー1人の期限厳守レコードを全件取得
export async function getDeadlineRecordsByMemberId(memberId: string): Promise<DeadlineRecord[]> {
  const { data, error } = await supabase
    .from('deadline_records')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at');

  if (error) throw new Error(`getDeadlineRecordsByMemberId: ${error.message}`);
  return ((data as DeadlineRecordRow[]) ?? []).map(toDeadlineRecord);
}

// チーム全員の期限厳守レコードを一括取得
// → チーム一覧・ランキングでの評価算出に使用
export async function getDeadlineRecordsByTeamId(teamId: string): Promise<DeadlineRecord[]> {
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id')
    .eq('team_id', teamId);

  if (memberError) throw new Error(`getDeadlineRecordsByTeamId (members): ${memberError.message}`);

  const memberIds = (memberData ?? []).map((m: { id: string }) => m.id);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabase
    .from('deadline_records')
    .select('*')
    .in('member_id', memberIds)
    .order('created_at');

  if (error) throw new Error(`getDeadlineRecordsByTeamId (deadline_records): ${error.message}`);
  return ((data as DeadlineRecordRow[]) ?? []).map(toDeadlineRecord);
}

export async function createDeadlineRecord(
  input: CreateDeadlineRecordInput,
): Promise<DeadlineRecord> {
  const { data, error } = await supabase
    .from('deadline_records')
    .insert({
      member_id:    input.memberId,
      category:     input.category,
      is_completed: input.isCompleted,
    })
    .select()
    .single();

  if (error) throw new Error(`createDeadlineRecord: ${error.message}`);
  return toDeadlineRecord(data as DeadlineRecordRow);
}

export async function updateDeadlineRecord(
  id: string,
  isCompleted: boolean,
): Promise<DeadlineRecord> {
  const { data, error } = await supabase
    .from('deadline_records')
    .update({ is_completed: isCompleted })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateDeadlineRecord: ${error.message}`);
  return toDeadlineRecord(data as DeadlineRecordRow);
}
