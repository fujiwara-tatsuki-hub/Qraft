'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { submitTeamTransfer } from '@/app/member/[id]/actions';
import type { ActionState } from '@/app/member/[id]/actions';
import type { Team } from '@/types/team';

type Props = {
  memberId: string;
  currentTeamId: string;
  teams: Team[];
};

const INITIAL: ActionState = { error: null, success: false };

export default function TeamTransferForm({ memberId, currentTeamId, teams }: Props) {
  const [state, formAction, isPending] = useActionState(submitTeamTransfer, INITIAL);
  const router = useRouter();

  // 移動成功後にチーム詳細へ遷移
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  const otherTeams = teams.filter((t) => t.id !== currentTeamId);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="memberId" value={memberId} />

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          name="newTeamId"
          required
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">移動先チームを選択</option>
          {otherTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {isPending ? '移動中...' : '移動する'}
        </button>
      </div>

      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          チームを移動しました（役職はメンバーにリセットされます）
        </p>
      )}
      {state.error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
    </form>
  );
}
