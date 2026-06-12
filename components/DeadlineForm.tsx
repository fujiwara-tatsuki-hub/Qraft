'use client';

import { useState, useActionState } from 'react';
import { submitDeadline } from '@/app/member/[id]/actions';
import type { ActionState } from '@/app/member/[id]/actions';
import type { DeadlineCategory } from '@/types/deadlineRecord';

const CATEGORY_LABELS: Record<DeadlineCategory, string> = {
  document:               '提出物',
  training:               '研修受講',
  transportation_expense: '交通費経費精算',
  shift:                  'シフト提出',
  other:                  'その他',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as DeadlineCategory[];

type Props = {
  memberId: string;
};

const INITIAL_STATE: ActionState = { error: null, success: false };

export default function DeadlineForm({ memberId }: Props) {
  const [category, setCategory] = useState<DeadlineCategory>('document');
  const [state, formAction, isPending] = useActionState(submitDeadline, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="memberId" value={memberId} />

      {/* カテゴリ選択 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">カテゴリ</p>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DeadlineCategory)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* フィードバック */}
      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          記録しました
        </p>
      )}
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        {isPending ? '記録中...' : 'NGを記録する'}
      </button>
    </form>
  );
}
