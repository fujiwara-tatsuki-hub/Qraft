export const dynamic = 'force-dynamic';

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
import TeamCard from '@/components/TeamCard';
import type { Team } from '@/types/team';

// チームの全メンバー評価を取得し、各グレードを算出して Team に付与する
// ランキング機能でも同じ処理が必要になるため、独立した関数として定義
async function buildTeamWithGrades(team: Team): Promise<Team> {
  const [members, evaluations, deadlineRecords, referralRecords] = await Promise.all([
    getMembersByTeamId(team.id),
    getEvaluationsByTeamId(team.id),
    getDeadlineRecordsByTeamId(team.id),
    getReferralRecordsByTeamId(team.id),
  ]);

  // メンバーごとに3評価 → 個人総合評価を算出
  const perMember = members.map((m) => {
    const compliance = calculateComplianceGrade(evaluations.filter((e) => e.memberId === m.id));
    const deadline   = calculateDeadlineGrade(deadlineRecords.filter((d) => d.memberId === m.id));
    const referral   = calculateReferralGrade(referralRecords.filter((r) => r.memberId === m.id));
    const overall    = calculateGrade(compliance, deadline, referral);
    return { compliance, deadline, referral, overall };
  });

  // 全メンバーの各評価を集計してチームグレードを算出
  return {
    ...team,
    overallGrade:    calculateTeamScore(perMember.map((g) => g.overall)),
    complianceGrade: calculateTeamScore(perMember.map((g) => g.compliance)),
    deadlineGrade:   calculateTeamScore(perMember.map((g) => g.deadline)),
    referralGrade:   calculateTeamScore(perMember.map((g) => g.referral)),
  };
}

export default async function TeamsPage() {
  const teams = await getTeams();

  // 全チームを並列でグレード算出
  const teamsWithGrades = await Promise.all(teams.map(buildTeamWithGrades));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">チーム一覧</h1>
        <p className="text-sm text-gray-500 mt-1">九州支店 全{teamsWithGrades.length}チーム</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamsWithGrades.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
