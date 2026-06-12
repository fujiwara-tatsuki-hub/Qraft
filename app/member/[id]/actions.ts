'use server';

import { revalidatePath } from 'next/cache';
import { upsertEvaluation } from '@/repositories/evaluationRepository';
import { createDeadlineRecord } from '@/repositories/deadlineRepository';
import { createReferralRecord } from '@/repositories/referralRepository';
import { updateMemberName, getMemberById } from '@/repositories/memberRepository';
import { updateTeamLeaderName, updateTeamSubLeaderName } from '@/repositories/teamRepository';
import type { Grade } from '@/types';
import type { EvaluatorType } from '@/types/evaluation';
import type { DeadlineCategory } from '@/types/deadlineRecord';

export type ActionState = {
  error: string | null;
  success: boolean;
};

const VALID_GRADES = new Set<string>(['A', 'B', 'C', 'D']);
const VALID_EVALUATOR_TYPES = new Set<string>(['leader', 'sales', 'branch_manager']);
const VALID_CATEGORIES = new Set<string>([
  'document', 'training', 'transportation_expense', 'shift', 'other',
]);

function isGrade(value: string): value is Grade {
  return VALID_GRADES.has(value);
}

export async function submitCompliance(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId        = (formData.get('memberId') ?? '').toString();
  const evaluatorType   = (formData.get('evaluatorType') ?? '').toString();
  const attendanceGrade = (formData.get('attendanceGrade') ?? '').toString();
  const reportingGrade  = (formData.get('reportingGrade') ?? '').toString();
  const initiativeGrade = (formData.get('initiativeGrade') ?? '').toString();

  if (!memberId) return { error: 'メンバーIDが不正です', success: false };
  if (!VALID_EVALUATOR_TYPES.has(evaluatorType))
    return { error: '評価者を選択してください', success: false };
  if (!isGrade(attendanceGrade) || !isGrade(reportingGrade) || !isGrade(initiativeGrade))
    return { error: 'グレードの値が不正です', success: false };

  try {
    await upsertEvaluation({
      memberId,
      evaluatorType: evaluatorType as EvaluatorType,
      attendanceGrade,
      reportingGrade,
      initiativeGrade,
    });
    revalidatePath(`/member/${memberId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '保存に失敗しました', success: false };
  }
}

export async function submitDeadline(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId   = (formData.get('memberId') ?? '').toString();
  const category   = (formData.get('category') ?? '').toString();
  const isCompleted = formData.get('isCompleted') === 'true';

  if (!memberId) return { error: 'メンバーIDが不正です', success: false };
  if (!VALID_CATEGORIES.has(category))
    return { error: 'カテゴリを選択してください', success: false };

  try {
    await createDeadlineRecord({
      memberId,
      category: category as DeadlineCategory,
      isCompleted,
    });
    revalidatePath(`/member/${memberId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '記録に失敗しました', success: false };
  }
}

export async function submitReferral(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId          = (formData.get('memberId') ?? '').toString();
  const consultationCount = Number(formData.get('consultationCount'));
  const interviewCount    = Number(formData.get('interviewCount'));
  const offerCount        = Number(formData.get('offerCount'));

  if (!memberId) return { error: 'メンバーIDが不正です', success: false };
  if (
    !Number.isFinite(consultationCount) ||
    !Number.isFinite(interviewCount)    ||
    !Number.isFinite(offerCount)        ||
    consultationCount < 0 || interviewCount < 0 || offerCount < 0
  ) {
    return { error: '0以上の数値を入力してください', success: false };
  }

  try {
    await createReferralRecord({ memberId, consultationCount, interviewCount, offerCount });
    revalidatePath(`/member/${memberId}`);
    revalidatePath('/');
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '記録に失敗しました', success: false };
  }
}

export async function submitMemberName(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const memberId = (formData.get('memberId') ?? '').toString();
  const name     = (formData.get('name') ?? '').toString().trim();

  if (!memberId) return { error: 'メンバーIDが不正です', success: false };
  if (!name)     return { error: '氏名を入力してください', success: false };

  try {
    await updateMemberName(memberId, name);

    // リーダー/サブリーダーの場合はチームの表示名も同期
    const member = await getMemberById(memberId);
    if (member?.role === 'リーダー') {
      await updateTeamLeaderName(member.teamId, name);
      revalidatePath(`/team/${member.teamId}`);
      revalidatePath('/');
    } else if (member?.role === 'サブリーダー') {
      await updateTeamSubLeaderName(member.teamId, name);
      revalidatePath(`/team/${member.teamId}`);
      revalidatePath('/');
    }

    revalidatePath(`/member/${memberId}`);
    return { error: null, success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : '保存に失敗しました', success: false };
  }
}
