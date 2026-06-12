export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTeams } from '@/repositories/teamRepository';
import { getMembersByTeamId } from '@/repositories/memberRepository';
import { getEvaluationsByMemberId } from '@/repositories/evaluationRepository';
import { getDeadlineRecordsByMemberId } from '@/repositories/deadlineRepository';
import { getReferralRecordsByMemberId } from '@/repositories/referralRepository';
import { calculateComplianceGrade } from '@/utils/calculateComplianceGrade';
import { calculateDeadlineGrade } from '@/utils/calculateDeadlineGrade';
import { calculateReferralGrade } from '@/utils/calculateReferralGrade';
import { calculateGrade } from '@/utils/calculateGrade';
import EvaluationBadge from '@/components/EvaluationBadge';
import type { MemberRole } from '@/types/member';

// リーダー → サブリーダー → メンバー の順
const ROLE_ORDER: Record<MemberRole, number> = {
  'リーダー':     0,
  'サブリーダー': 1,
  'メンバー':     2,
};

const roleStyle: Record<MemberRole, string> = {
  'リーダー':     'bg-indigo-100 text-indigo-700',
  'サブリーダー': 'bg-purple-100 text-purple-700',
  'メンバー':     'bg-gray-100 text-gray-600',
};

export default async function MembersPage() {
  const teams = await getTeams();

  const membersByTeam = await Promise.all(
    teams.map(async (team) => {
      const members = await getMembersByTeamId(team.id);
      return members.map((m) => ({ ...m, teamName: team.name }));
    })
  );

  const allMembers = membersByTeam.flat();

  const membersWithGrades = await Promise.all(
    allMembers.map(async (member) => {
      const [evaluations, deadlineRecords, referralRecords] = await Promise.all([
        getEvaluationsByMemberId(member.id),
        getDeadlineRecordsByMemberId(member.id),
        getReferralRecordsByMemberId(member.id),
      ]);
      const complianceGrade = calculateComplianceGrade(evaluations);
      const deadlineGrade   = calculateDeadlineGrade(deadlineRecords, member.createdAt);
      const referralGrade   = calculateReferralGrade(referralRecords, member.createdAt);
      const overallGrade    = calculateGrade(complianceGrade, deadlineGrade, referralGrade);
      return { ...member, overallGrade };
    })
  );

  // リーダー → サブリーダー → メンバー の順、同一役職内は名前順
  const sorted = [...membersWithGrades].sort((a, b) => {
    const roleA = ROLE_ORDER[a.role];
    const roleB = ROLE_ORDER[b.role];
    if (roleA !== roleB) return roleA - roleB;
    return a.name.localeCompare(b.name, 'ja');
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Members List</h1>
        <p className="text-base text-gray-400 mt-1">九州支店 全{sorted.length}名のメンバー</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left py-3 px-5 font-medium text-gray-500">氏名</th>
              <th className="text-left py-3 px-5 font-medium text-gray-500">チーム</th>
              <th className="text-left py-3 px-5 font-medium text-gray-500">役職</th>
              <th className="text-center py-3 px-5 font-medium text-gray-500">総合評価</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((member) => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-5">
                  <Link
                    href={`/member/${member.id}`}
                    className="font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    {member.name}
                  </Link>
                </td>
                <td className="py-3.5 px-5 text-gray-500">{member.teamName}</td>
                <td className="py-3.5 px-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${roleStyle[member.role]}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  <div className="flex justify-center">
                    <EvaluationBadge grade={member.overallGrade} size="sm" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
