'use client';

import { useActionState } from 'react';
import { submitMemberName } from '@/app/member/[id]/actions';
import type { ActionState } from '@/app/member/[id]/actions';

type Props = { memberId: string; currentName: string };

const INITIAL: ActionState = { error: null, success: false };

export default function MemberNameForm({ memberId, currentName }: Props) {
  const [state, formAction, isPending] = useActionState(submitMemberName, INITIAL);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <input
        type="text"
        name="name"
        defaultValue={currentName}
        required
        placeholder="氏名"
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
      >
        {isPending ? '保存中...' : '保存'}
      </button>
      {state.success && (
        <span className="self-center text-sm text-emerald-600">保存しました</span>
      )}
      {state.error && (
        <span className="self-center text-sm text-red-600">{state.error}</span>
      )}
    </form>
  );
}
