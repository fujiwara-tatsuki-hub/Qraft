export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTeams } from '@/repositories/teamRepository';
import { getMembersByTeamId } from '@/repositories/memberRepository';
import { getEvaluationsByTeamId } from '@/repositories/evaluationRepository';
import { getDeadlineRecordsByTeamId } from '@/repositories/deadlineRepository';
import { getReferralRecordsByTeamId } from '@/repositories/referralRepository';
import { calculateComplianceGrade } from '@/utils/calculateComplianceGrade';
import { calculateDeadlineGrade } from '@/utils/calculateDeadlineGrade';
import { calculateReferralGrade } from '@/utils/calculateReferralGrade';
import { calculateGrade } from '@/utils/calculateGrade';
import { calculateTeamScore } from '@/utils/calculateTeamScore';
import EvaluationBadge from '@/components/EvaluationBadge';
import type { Team } from '@/types/team';
import type { Grade } from '@/types';

const GRADE_SCORE: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1 };
function gradeScore(grade?: Grade) { return grade ? GRADE_SCORE[grade] : 0; }

async function buildTeamWithGrades(team: Team): Promise<Team> {
  const [members, evaluations, deadlineRecords, referralRecords] = await Promise.all([
    getMembersByTeamId(team.id),
    getEvaluationsByTeamId(team.id),
    getDeadlineRecordsByTeamId(team.id),
    getReferralRecordsByTeamId(team.id),
  ]);

  const perMember = members.map((m) => {
    const compliance = calculateComplianceGrade(evaluations.filter((e) => e.memberId === m.id));
    const deadline   = calculateDeadlineGrade(deadlineRecords.filter((d) => d.memberId === m.id));
    const referral   = calculateReferralGrade(referralRecords.filter((r) => r.memberId === m.id));
    const overall    = calculateGrade(compliance, deadline, referral);
    return { compliance, deadline, referral, overall };
  });

  return {
    ...team,
    overallGrade:    calculateTeamScore(perMember.map((g) => g.overall)),
    complianceGrade: calculateTeamScore(perMember.map((g) => g.compliance)),
    deadlineGrade:   calculateTeamScore(perMember.map((g) => g.deadline)),
    referralGrade:   calculateTeamScore(perMember.map((g) => g.referral)),
  };
}

const RANK_MEDAL: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-slate-400',
  3: 'text-amber-600',
};

export default async function TeamsRankingPage() {
  const teams = await getTeams();
  const teamsWithGrades = await Promise.all(teams.map(buildTeamWithGrades));

  const sorted = [...teamsWithGrades].sort(
    (a, b) => gradeScore(b.overallGrade) - gradeScore(a.overallGrade),
  );

  // 同スコアは同順位（dense rank）
  let rank = 1;
  const ranked = sorted.map((team, i) => {
    if (i > 0 && gradeScore(sorted[i - 1].overallGrade) !== gradeScore(team.overallGrade)) {
      rank = i + 1;
    }
    return { ...team, rank };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams Ranking</h1>
        <p className="text-sm text-gray-400 mt-1">全{ranked.length}チームの総合評価ランキング</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-4 w-14 text-center font-medium text-gray-500">順位</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">チーム名</th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 hidden sm:table-cell">人数</th>
              <th className="py-3 px-4 text-center font-medium text-gray-500">総合評価</th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 hidden md:table-cell">期限厳守</th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 hidden md:table-cell">リファラル</th>
              <th className="py-3 px-4 text-center font-medium text-gray-500 hidden md:table-cell">コンプライアンス</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((team) => (
              <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-center">
                  <span className={`text-lg font-bold ${RANK_MEDAL[team.rank] ?? 'text-gray-300'}`}>
                    {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : `${team.rank}位`}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/team/${team.id}`}
                    className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    {team.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-center text-gray-400 hidden sm:table-cell">
                  {team.memberCount}名
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    <EvaluationBadge grade={team.overallGrade} size="sm" />
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex justify-center">
                    <EvaluationBadge grade={team.deadlineGrade} size="sm" />
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex justify-center">
                    <EvaluationBadge grade={team.referralGrade} size="sm" />
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex justify-center">
                    <EvaluationBadge grade={team.complianceGrade} size="sm" />
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
