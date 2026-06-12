'use client';

import { useActionState } from 'react';
import { submitAddMember } from '@/app/team/[id]/teamActions';
import type { ActionState } from '@/app/team/[id]/teamActions';

type Props = { teamId: string };

const INITIAL: ActionState = { error: null, success: false };

const ROLE_OPTIONS = [
  { value: 'member',     label: 'メンバー' },
  { value: 'leader',     label: 'リーダー' },
  { value: 'sub_leader', label: 'サブリーダー' },
] as const;

export default function AddMemberForm({ teamId }: Props) {
  const [state, formAction, isPending] = useActionState(submitAddMember, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamId" value={teamId} />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="name"
          required
          placeholder="氏名を入力"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          name="role"
          defaultValue="member"
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {isPending ? '追加中...' : '追加'}
        </button>
      </div>

      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          追加しました
        </p>
      )}
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
    </form>
  );
}
