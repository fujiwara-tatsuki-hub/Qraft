import { supabase } from '@/lib/supabase';
import type {
  ReferralRecord,
  CreateReferralRecordInput,
  UpdateReferralRecordInput,
} from '@/types/referralRecord';

// Supabase から返される生の行型（snake_case）
type ReferralRecordRow = {
  id:                 string;
  member_id:          string;
  consultation_count: number;
  interview_count:    number;
  offer_count:        number;
  created_at:         string;
};

function toReferralRecord(row: ReferralRecordRow): ReferralRecord {
  return {
    id:                row.id,
    memberId:          row.member_id,
    consultationCount: row.consultation_count,
    interviewCount:    row.interview_count,
    offerCount:        row.offer_count,
    createdAt:         row.created_at,
  };
}

// メンバー1人のリファラルレコードを全件取得
export async function getReferralRecordsByMemberId(memberId: string): Promise<ReferralRecord[]> {
  const { data, error } = await supabase
    .from('referral_records')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at');

  if (error) throw new Error(`getReferralRecordsByMemberId: ${error.message}`);
  return ((data as ReferralRecordRow[]) ?? []).map(toReferralRecord);
}

// チーム全員のリファラルレコードを一括取得
// → チーム一覧・ランキングでの評価算出に使用
export async function getReferralRecordsByTeamId(teamId: string): Promise<ReferralRecord[]> {
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id')
    .eq('team_id', teamId);

  if (memberError) throw new Error(`getReferralRecordsByTeamId (members): ${memberError.message}`);

  const memberIds = (memberData ?? []).map((m: { id: string }) => m.id);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabase
    .from('referral_records')
    .select('*')
    .in('member_id', memberIds)
    .order('created_at');

  if (error) throw new Error(`getReferralRecordsByTeamId (referral_records): ${error.message}`);
  return ((data as ReferralRecordRow[]) ?? []).map(toReferralRecord);
}

// CRUD ─────────────────────────────────────────

export async function createReferralRecord(
  input: CreateReferralRecordInput,
): Promise<ReferralRecord> {
  const { data, error } = await supabase
    .from('referral_records')
    .insert({
      member_id:          input.memberId,
      consultation_count: input.consultationCount,
      interview_count:    input.interviewCount,
      offer_count:        input.offerCount,
    })
    .select()
    .single();

  if (error) throw new Error(`createReferralRecord: ${error.message}`);
  return toReferralRecord(data as ReferralRecordRow);
}

export async function updateReferralRecord(
  id: string,
  input: UpdateReferralRecordInput,
): Promise<ReferralRecord> {
  const { data, error } = await supabase
    .from('referral_records')
    .update({
      ...(input.consultationCount !== undefined && { consultation_count: input.consultationCount }),
      ...(input.interviewCount    !== undefined && { interview_count:    input.interviewCount    }),
      ...(input.offerCount        !== undefined && { offer_count:        input.offerCount        }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateReferralRecord: ${error.message}`);
  return toReferralRecord(data as ReferralRecordRow);
}

export async function deleteReferralRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('referral_records')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteReferralRecord: ${error.message}`);
}
