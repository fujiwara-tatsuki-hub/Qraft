'use client';

import { useState, useActionState } from 'react';
import { submitCompliance } from '@/app/member/[id]/actions';
import type { ActionState } from '@/app/member/[id]/actions';
import type { Evaluation, EvaluatorType } from '@/types/evaluation';
import type { Grade } from '@/types';

const EVALUATOR_LABELS: Record<EvaluatorType, string> = {
  leader:         'リーダー',
  sales:          '営業担当',
  branch_manager: '支店長',
};

const EVALUATOR_TYPES = Object.keys(EVALUATOR_LABELS) as EvaluatorType[];

const GRADES: Grade[] = ['A', 'B', 'C', 'D'];

const ACTIVE_GRADE_STYLE: Record<Grade, string> = {
  A: 'bg-emerald-500 text-white border-emerald-500',
  B: 'bg-blue-500 text-white border-blue-500',
  C: 'bg-amber-500 text-white border-amber-500',
  D: 'bg-red-500 text-white border-red-500',
};

const INACTIVE_GRADE_STYLE =
  'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50';

type GradeSelectorProps = {
  name: string;
  label: string;
  value: Grade;
  onChange: (g: Grade) => void;
};

function GradeSelector({ name, label, value, onChange }: GradeSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-sm text-gray-600 shrink-0">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1.5">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`w-10 h-10 rounded-lg border text-sm font-bold transition-colors ${
              value === g ? ACTIVE_GRADE_STYLE[g] : INACTIVE_GRADE_STYLE
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  memberId: string;
  existingEvaluations: Evaluation[];
};

const INITIAL_STATE: ActionState = { error: null, success: false };

export default function ComplianceForm({ memberId, existingEvaluations }: Props) {
  const [evaluatorType, setEvaluatorType] = useState<EvaluatorType>('leader');

  const getInitialGrades = (type: EvaluatorType) => {
    const e = existingEvaluations.find((ev) => ev.evaluatorType === type);
    return {
      attendance: e?.attendanceGrade ?? 'B',
      reporting:  e?.reportingGrade  ?? 'B',
      initiative: e?.initiativeGrade ?? 'B',
    } as { attendance: Grade; reporting: Grade; initiative: Grade };
  };

  const [grades, setGrades] = useState(getInitialGrades('leader'));
  const [state, formAction, isPending] = useActionState(submitCompliance, INITIAL_STATE);

  const handleEvaluatorChange = (type: EvaluatorType) => {
    setEvaluatorType(type);
    setGrades(getInitialGrades(type));
  };

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="memberId" value={memberId} />
      <input type="hidden" name="evaluatorType" value={evaluatorType} />

      {/* 評価者選択 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">評価者</p>
        <div className="flex flex-wrap gap-2">
          {EVALUATOR_TYPES.map((type) => {
            const hasData = existingEvaluations.some((e) => e.evaluatorType === type);
            const isActive = evaluatorType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleEvaluatorChange(type)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {EVALUATOR_LABELS[type]}
                {hasData && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          ● 緑ドットは入力済みを示します
        </p>
      </div>

      {/* グレード入力 */}
      <div className="space-y-4 pt-1">
        <GradeSelector
          name="attendanceGrade"
          label="勤怠"
          value={grades.attendance}
          onChange={(g) => setGrades((prev) => ({ ...prev, attendance: g }))}
        />
        <GradeSelector
          name="reportingGrade"
          label="報連相"
          value={grades.reporting}
          onChange={(g) => setGrades((prev) => ({ ...prev, reporting: g }))}
        />
        <GradeSelector
          name="initiativeGrade"
          label="積極性"
          value={grades.initiative}
          onChange={(g) => setGrades((prev) => ({ ...prev, initiative: g }))}
        />
      </div>

      {/* フィードバック */}
      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          保存しました
        </p>
      )}
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '保存中...' : '保存する'}
      </button>
    </form>
  );
}
