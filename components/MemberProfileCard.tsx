'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Member, MemberRole } from '@/types/member';
import type { Team } from '@/types/team';
import type { Grade } from '@/types';
import { submitMemberProfile } from '@/app/member/[id]/actions';
import type { ActionState } from '@/app/member/[id]/actions';
import TeamTransferForm from '@/components/TeamTransferForm';
import EvaluationBadge from '@/components/EvaluationBadge';

type Props = {
  member: Member;
  team: Team | null;
  allTeams: Team[];
  overallGrade?: Grade;
};

const INITIAL: ActionState = { error: null, success: false };

const roleStyle: Record<MemberRole, string> = {
  'リーダー':     'bg-indigo-100 text-indigo-700',
  'サブリーダー': 'bg-purple-100 text-purple-700',
  'メンバー':     'bg-gray-100 text-gray-600',
};

const INPUT = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

type InfoRowProps = { label: string; value: string };
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 text-sm py-1.5">
      <span className="text-gray-400 w-28 shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

export default function MemberProfileCard({ member, team, allTeams, overallGrade }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(submitMemberProfile, INITIAL);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
      router.refresh();
    }
  }, [state.success, router]);

  const hasInfo =
    member.phone || member.email || member.address ||
    member.client || member.contactName || member.storeName;

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">プロフィール編集</h2>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            キャンセル
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="memberId" value={member.id} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">氏名 *</label>
              <input type="text" name="name" defaultValue={member.name} required className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">電話番号</label>
              <input type="tel" name="phone" defaultValue={member.phone ?? ''} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">メールアドレス</label>
              <input type="email" name="email" defaultValue={member.email ?? ''} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">クライアント</label>
              <input type="text" name="client" defaultValue={member.client ?? ''} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">担当者名</label>
              <input type="text" name="contactName" defaultValue={member.contactName ?? ''} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">店舗名</label>
              <input type="text" name="storeName" defaultValue={member.storeName ?? ''} className={INPUT} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">住所</label>
            <input type="text" name="address" defaultValue={member.address ?? ''} className={INPUT} />
          </div>

          {state.error && (
            <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-3">チーム移動</p>
          <TeamTransferForm
            memberId={member.id}
            currentTeamId={member.teamId}
            teams={allTeams}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm text-gray-400">{team?.name}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyle[member.role]}`}
            >
              {member.role}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <EvaluationBadge grade={overallGrade} label="総合評価" size="lg" />
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors self-start"
            aria-label="編集"
          >
            <PencilIcon />
          </button>
        </div>
      </div>

      {hasInfo ? (
        <div className="pt-4 border-t border-gray-100 divide-y divide-gray-50">
          {member.phone       && <InfoRow label="電話番号"       value={member.phone} />}
          {member.email       && <InfoRow label="メールアドレス" value={member.email} />}
          {member.address     && <InfoRow label="住所"           value={member.address} />}
          {member.client      && <InfoRow label="クライアント"   value={member.client} />}
          {member.contactName && <InfoRow label="担当者名"       value={member.contactName} />}
          {member.storeName   && <InfoRow label="店舗名"         value={member.storeName} />}
        </div>
      ) : (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            情報未登録 — 右上の鉛筆アイコンから入力できます。
          </p>
        </div>
      )}
    </div>
  );
}
