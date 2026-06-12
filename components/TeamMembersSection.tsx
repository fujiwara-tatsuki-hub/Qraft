'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Member, MemberRole } from '@/types/member';
import type { Team } from '@/types/team';
import EvaluationBadge from '@/components/EvaluationBadge';
import TeamNameForm from '@/components/TeamNameForm';
import AddMemberForm from '@/components/AddMemberForm';
import LeaderSelectForm from '@/components/LeaderSelectForm';
import { submitDeleteMember, submitMemberOrder } from '@/app/team/[id]/teamActions';

type Props = {
  team: Team;
  members: Member[];
};

const roleStyle: Record<MemberRole, string> = {
  'リーダー':     'bg-indigo-100 text-indigo-700',
  'サブリーダー': 'bg-purple-100 text-purple-700',
  'メンバー':     'bg-gray-100 text-gray-600',
};

function PencilIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export default function TeamMembersSection({ team, members }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [orderedMembers, setOrderedMembers] = useState(members);
  const [orderChanged, setOrderChanged] = useState(false);

  // サーバーからの最新データが来たら（削除後など）、編集中でなければ同期
  useEffect(() => {
    if (!isEditing) setOrderedMembers(members);
  }, [members, isEditing]);

  const enterEdit = () => {
    setOrderedMembers(members);
    setOrderChanged(false);
    setIsEditing(true);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setOrderedMembers((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
    setOrderChanged(true);
  };

  const moveDown = (index: number) => {
    if (index === orderedMembers.length - 1) return;
    setOrderedMembers((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    setOrderChanged(true);
  };

  const handleDelete = (memberId: string, memberName: string) => {
    if (!confirm(`${memberName} を削除しますか？\n\n評価データも全て削除されます。`)) return;
    startTransition(async () => {
      await submitDeleteMember(memberId);
      setOrderedMembers((prev) => prev.filter((m) => m.id !== memberId));
      router.refresh();
    });
  };

  const handleDone = () => {
    startTransition(async () => {
      if (orderChanged) {
        await submitMemberOrder(team.id, orderedMembers.map((m) => m.id));
        setOrderChanged(false);
      }
      setIsEditing(false);
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">メンバー一覧</h2>
          <p className="text-base text-gray-400 mt-0.5">{orderedMembers.length}名</p>
        </div>
        {isEditing ? (
          <button
            onClick={handleDone}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <CheckIcon />
            完了
          </button>
        ) : (
          <button
            onClick={enterEdit}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="編集"
          >
            <PencilIcon />
          </button>
        )}
      </div>

      {/* メンバーテーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {isEditing && <th className="py-3 px-3 w-14" />}
              <th className="text-left py-3 px-4 font-medium text-gray-500">氏名</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">役職</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">個人評価</th>
              {isEditing && <th className="py-3 px-4 w-16" />}
            </tr>
          </thead>
          <tbody>
            {orderedMembers.map((member, index) => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {isEditing && (
                  <td className="py-2 px-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || isPending}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                        aria-label="上へ"
                      >
                        <ChevronUpIcon />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === orderedMembers.length - 1 || isPending}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                        aria-label="下へ"
                      >
                        <ChevronDownIcon />
                      </button>
                    </div>
                  </td>
                )}
                <td className="py-3 px-4">
                  <Link
                    href={`/member/${member.id}`}
                    className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    {member.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyle[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    {member.role !== 'リーダー' && (
                      <EvaluationBadge grade={member.overallGrade} size="sm" />
                    )}
                  </div>
                </td>
                {isEditing && (
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      disabled={isPending}
                      className="px-2.5 py-1 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
                    >
                      削除
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編集フォーム（編集モード時のみ表示） */}
      {isEditing && (
        <div className="px-6 py-5 border-t border-gray-100 space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">チーム名</p>
            <TeamNameForm teamId={team.id} currentName={team.name} />
          </div>

          <div className="pt-5 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">メンバー追加</p>
            <AddMemberForm teamId={team.id} />
          </div>

          <div className="pt-5 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4">リーダー・サブリーダー変更</p>
            <LeaderSelectForm
              teamId={team.id}
              members={orderedMembers}
              currentLeaderId={orderedMembers.find((m) => m.role === 'リーダー')?.id}
              currentSubLeaderId={orderedMembers.find((m) => m.role === 'サブリーダー')?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
