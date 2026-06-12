'use client';

import { useActionState } from 'react';
import { submitLeaderChange } from '@/app/team/[id]/teamActions';
import type { ActionState } from '@/app/team/[id]/teamActions';
import type { Member } from '@/types/member';

type Props = {
  teamId: string;
  members: Member[];
  currentLeaderId?: string;
  currentSubLeaderId?: string;
};

const INITIAL: ActionState = { error: null, success: false };

export default function LeaderSelectForm({
  teamId,
  members,
  currentLeaderId,
  currentSubLeaderId,
}: Props) {
  const [state, formAction, isPending] = useActionState(submitLeaderChange, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamId" value={teamId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            リーダー
          </label>
          <select
            name="leaderId"
            defaultValue={currentLeaderId}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            サブリーダー
          </label>
          <select
            name="subLeaderId"
            defaultValue={currentSubLeaderId}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          変更しました
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
        {isPending ? '変更中...' : '変更する'}
      </button>
    </form>
  );
}
