'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitDeleteMember } from '@/app/team/[id]/teamActions';

type Props = {
  memberId: string;
  memberName: string;
};

export default function DeleteMemberButton({ memberId, memberName }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!confirm(`${memberName} を削除しますか？\n\n評価データも全て削除されます。`)) return;
    startTransition(async () => {
      await submitDeleteMember(memberId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
    >
      {isPending ? '...' : '削除'}
    </button>
  );
}
