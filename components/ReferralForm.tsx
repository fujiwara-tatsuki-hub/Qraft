'use client';

import { useActionState } from 'react';
import { submitReferral } from '@/app/member/[id]/actions';
import type { ActionState } from '@/app/member/[id]/actions';

type Props = {
  memberId: string;
};

const INITIAL_STATE: ActionState = { error: null, success: false };

const FIELDS = [
  { name: 'consultationCount', label: '相談数' },
  { name: 'interviewCount',    label: '面談数' },
  { name: 'offerCount',        label: '内定数' },
] as const;

export default function ReferralForm({ memberId }: Props) {
  const [state, formAction, isPending] = useActionState(submitReferral, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="memberId" value={memberId} />

      <div className="space-y-4">
        {FIELDS.map(({ name, label }) => (
          <div key={name} className="flex items-center gap-4">
            <label htmlFor={name} className="w-14 text-sm text-gray-700 shrink-0">
              {label}
            </label>
            <input
              id={name}
              type="number"
              name={name}
              min="0"
              defaultValue={0}
              required
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <span className="text-sm text-gray-400">件</span>
          </div>
        ))}
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
        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '記録中...' : '記録する'}
      </button>
    </form>
  );
}
