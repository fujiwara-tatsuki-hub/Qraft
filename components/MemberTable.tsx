import Link from 'next/link';
import type { Member, MemberRole } from '@/types/member';
import EvaluationBadge from '@/components/EvaluationBadge';
import DeleteMemberButton from '@/components/DeleteMemberButton';

const roleStyle: Record<MemberRole, string> = {
  'リーダー':    'bg-indigo-100 text-indigo-700',
  'サブリーダー': 'bg-purple-100 text-purple-700',
  'メンバー':    'bg-gray-100 text-gray-600',
};

type Props = {
  members: Member[];
};

export default function MemberTable({ members }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">氏名</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">役職</th>
            <th className="text-center py-3 px-4 font-medium text-gray-500">総合評価</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <Link
                  href={`/member/${member.id}`}
                  className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                >
                  {member.name}
                </Link>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyle[member.role]}`}
                >
                  {member.role}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <EvaluationBadge grade={member.overallGrade} />
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <DeleteMemberButton memberId={member.id} memberName={member.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
