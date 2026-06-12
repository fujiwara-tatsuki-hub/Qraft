import { supabase } from '@/lib/supabase';
import type { Evaluation, CreateEvaluationInput } from '@/types/evaluation';

// Supabase から返される生の行型（snake_case）
type EvaluationRow = {
  id:                  string;
  member_id:           string;
  evaluator_type:      'leader' | 'sales' | 'branch_manager';
  attendance_grade:    'A' | 'B' | 'C' | 'D';
  reporting_grade:     'A' | 'B' | 'C' | 'D';
  initiative_grade:    'A' | 'B' | 'C' | 'D';
  work_attitude_grade: 'A' | 'B' | 'C' | 'D';
  created_at:          string;
};

function toEvaluation(row: EvaluationRow): Evaluation {
  return {
    id:                row.id,
    memberId:          row.member_id,
    evaluatorType:     row.evaluator_type,
    attendanceGrade:   row.attendance_grade,
    reportingGrade:    row.reporting_grade,
    initiativeGrade:   row.initiative_grade,
    workAttitudeGrade: row.work_attitude_grade,
    createdAt:         row.created_at,
  };
}

// メンバー1人の評価を全評価者分取得
// → 個人コンプライアンス評価の算出に使用
export async function getEvaluationsByMemberId(memberId: string): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at');

  if (error) throw new Error(`getEvaluationsByMemberId: ${error.message}`);
  return ((data as EvaluationRow[]) ?? []).map(toEvaluation);
}

// チーム全員の評価をまとめて取得
// → チームコンプライアンス評価の算出に使用
// ① チームに属するメンバーIDを取得
// ② そのIDを元に評価を一括取得（2ステップで確実に結合）
export async function getEvaluationsByTeamId(teamId: string): Promise<Evaluation[]> {
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id')
    .eq('team_id', teamId);

  if (memberError) throw new Error(`getEvaluationsByTeamId (members): ${memberError.message}`);

  const memberIds = (memberData ?? []).map((m: { id: string }) => m.id);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .in('member_id', memberIds)
    .order('created_at');

  if (error) throw new Error(`getEvaluationsByTeamId (evaluations): ${error.message}`);
  return ((data as EvaluationRow[]) ?? []).map(toEvaluation);
}

export async function createEvaluation(input: CreateEvaluationInput): Promise<Evaluation> {
  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      member_id:           input.memberId,
      evaluator_type:      input.evaluatorType,
      attendance_grade:    input.attendanceGrade,
      reporting_grade:     input.reportingGrade,
      initiative_grade:    input.initiativeGrade,
      work_attitude_grade: input.workAttitudeGrade,
    })
    .select()
    .single();

  if (error) throw new Error(`createEvaluation: ${error.message}`);
  return toEvaluation(data as EvaluationRow);
}

// 同一メンバー × 評価者の組み合わせが既存ならば更新、なければ新規作成
// コンプライアンス評価フォームの保存に使用（評価者1人につき1行を維持）
export async function upsertEvaluation(input: CreateEvaluationInput): Promise<Evaluation> {
  const { data: existing, error: findError } = await supabase
    .from('evaluations')
    .select('id')
    .eq('member_id', input.memberId)
    .eq('evaluator_type', input.evaluatorType)
    .maybeSingle();

  if (findError) throw new Error(`upsertEvaluation (find): ${findError.message}`);

  if (existing) {
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        attendance_grade:    input.attendanceGrade,
        reporting_grade:     input.reportingGrade,
        initiative_grade:    input.initiativeGrade,
        work_attitude_grade: input.workAttitudeGrade,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(`upsertEvaluation (update): ${error.message}`);
    return toEvaluation(data as EvaluationRow);
  }

  return createEvaluation(input);
}
