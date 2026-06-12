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
import TeamsListView from '@/components/TeamsListView';
import type { Team } from '@/types/team';

async function buildTeamWithGrades(team: Team): Promise<Team> {
  const [members, evaluations, deadlineRecords, referralRecords] = await Promise.all([
    getMembersByTeamId(team.id),
    getEvaluationsByTeamId(team.id),
    getDeadlineRecordsByTeamId(team.id),
    getReferralRecordsByTeamId(team.id),
  ]);

  const nonLeaders = members.filter((m) => m.role !== 'リーダー');
  const perMember = nonLeaders.map((m) => {
    const compliance = calculateComplianceGrade(evaluations.filter((e) => e.memberId === m.id));
    const deadline   = calculateDeadlineGrade(deadlineRecords.filter((d) => d.memberId === m.id), m.createdAt);
    const referral   = calculateReferralGrade(referralRecords.filter((r) => r.memberId === m.id), m.createdAt);
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

export default async function TeamsPage() {
  const teams = await getTeams();
  const teamsWithGrades = await Promise.all(teams.map(buildTeamWithGrades));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">チーム一覧</h1>
        <p className="text-sm text-gray-400 mt-1">
          九州支店 全{teamsWithGrades.length}チームの評価状況
        </p>
      </div>
      <TeamsListView teams={teamsWithGrades} />
    </div>
  );
}
