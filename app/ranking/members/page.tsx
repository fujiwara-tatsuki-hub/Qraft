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
import type { Grade } from '@/types';

const GRADE_SCORE: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1 };
function gradeScore(grade?: Grade) { return grade ? GRADE_SCORE[grade] : 0; }

const roleStyle: Record<MemberRole, string> = {
  'リーダー':     'bg-indigo-100 text-indigo-700',
  'サブリーダー': 'bg-purple-100 text-purple-700',
  'メンバー':     'bg-gray-100 text-gray-600',
};

export default async function MembersRankingPage() {
  const teams = await getTeams();

  const membersByTeam = await Promise.all(
    teams.map(async (team) => {
      const members = await getMembersByTeamId(team.id);
      return members
        .filter((m) => m.role !== 'リーダー')
        .map((m) => ({ ...m, teamName: team.name }));
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
      const deadlineGrade   = calculateDeadlineGrade(deadlineRecords);
      const referralGrade   = calculateReferralGrade(referralRecords);
      const overallGrade    = calculateGrade(complianceGrade, deadlineGrade, referralGrade);
      return { ...member, overallGrade };
    })
  );

  const sorted = [...membersWithGrades].sort(
    (a, b) => gradeScore(b.overallGrade) - gradeScore(a.overallGrade),
  );

  // 同スコアは同順位（dense rank）
  let rank = 1;
  const ranked = sorted.map((member, i) => {
    if (i > 0 && gradeScore(sorted[i - 1].overallGrade) !== gradeScore(member.overallGrade)) {
      rank = i + 1;
    }
    return { ...member, rank };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Members Ranking</h1>
        <p className="text-base text-gray-400 mt-1">
          サブリーダー・メンバー {ranked.length}名の総合評価ランキング
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-4 w-14 text-center font-medium text-gray-500">順位</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">氏名</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">チーム</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">役職</th>
              <th className="py-3 px-4 text-center font-medium text-gray-500">総合評価</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((member) => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-center">
                  <span className="text-lg font-bold">
                    {member.rank === 1 ? '🥇' : member.rank === 2 ? '🥈' : member.rank === 3 ? '🥉' : (
                      <span className="text-gray-300 text-base">{member.rank}位</span>
                    )}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/member/${member.id}`}
                    className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    {member.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">{member.teamName}</td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleStyle[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4">
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
