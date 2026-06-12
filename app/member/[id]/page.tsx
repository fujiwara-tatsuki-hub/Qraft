export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberById, getMembersByTeamId } from '@/repositories/memberRepository';
import { getTeamById, getTeams } from '@/repositories/teamRepository';
import { getEvaluationsByMemberId, getEvaluationsByTeamId } from '@/repositories/evaluationRepository';
import { getDeadlineRecordsByMemberId, getDeadlineRecordsByTeamId } from '@/repositories/deadlineRepository';
import { getReferralRecordsByMemberId, getReferralRecordsByTeamId } from '@/repositories/referralRepository';
import { calculateComplianceGrade } from '@/utils/calculateComplianceGrade';
import { calculateDeadlineGrade } from '@/utils/calculateDeadlineGrade';
import { calculateReferralGrade } from '@/utils/calculateReferralGrade';
import { calculateGrade } from '@/utils/calculateGrade';
import { calculateTeamScore } from '@/utils/calculateTeamScore';
import EvaluationBadge from '@/components/EvaluationBadge';
import MemberProfileCard from '@/components/MemberProfileCard';
import ComplianceForm from '@/components/ComplianceForm';
import DeadlineForm from '@/components/DeadlineForm';
import ReferralForm from '@/components/ReferralForm';
import type { Grade } from '@/types';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;

  const member = await getMemberById(id);
  if (!member) notFound();

  const isLeader = member.role === 'リーダー';

  const [team, allTeams, evaluations, deadlineRecords, referralRecords] = await Promise.all([
    getTeamById(member.teamId),
    getTeams(),
    isLeader ? Promise.resolve([]) : getEvaluationsByMemberId(id),
    isLeader ? Promise.resolve([]) : getDeadlineRecordsByMemberId(id),
    isLeader ? Promise.resolve([]) : getReferralRecordsByMemberId(id),
  ]);

  const complianceGrade = isLeader ? undefined : calculateComplianceGrade(evaluations);
  const deadlineGrade   = isLeader ? undefined : calculateDeadlineGrade(deadlineRecords, member.createdAt);
  const referralGrade   = isLeader ? undefined : calculateReferralGrade(referralRecords, member.createdAt);
  const overallGrade    = isLeader ? undefined : calculateGrade(complianceGrade, deadlineGrade, referralGrade);

  // リーダーはチーム全体の評価を表示
  let displayGrade: Grade | undefined = overallGrade;
  const gradeLabel = isLeader ? 'チーム評価' : '個人評価';

  if (isLeader) {
    const [teamMembers, teamEvals, teamDeadlines, teamReferrals] = await Promise.all([
      getMembersByTeamId(member.teamId),
      getEvaluationsByTeamId(member.teamId),
      getDeadlineRecordsByTeamId(member.teamId),
      getReferralRecordsByTeamId(member.teamId),
    ]);
    const nonLeaders = teamMembers.filter((m) => m.role !== 'リーダー');
    const memberGrades = nonLeaders.map((m) => {
      const cg = calculateComplianceGrade(teamEvals.filter((e) => e.memberId === m.id));
      const dg = calculateDeadlineGrade(teamDeadlines.filter((dl) => dl.memberId === m.id), m.createdAt);
      const rg = calculateReferralGrade(teamReferrals.filter((rf) => rf.memberId === m.id), m.createdAt);
      return calculateGrade(cg, dg, rg);
    });
    displayGrade = calculateTeamScore(memberGrades);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href={`/team/${member.teamId}`}
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← {team?.name ?? 'チーム詳細'}
      </Link>

      <MemberProfileCard
        member={member}
        team={team}
        allTeams={allTeams}
        overallGrade={displayGrade}
        gradeLabel={gradeLabel}
      />

      {!isLeader && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
            <p className="text-sm text-gray-400 mb-4">評価内訳</p>
            <div className="grid grid-cols-3 gap-4">
              <EvaluationBadge grade={complianceGrade} label="コンプライアンス" />
              <EvaluationBadge grade={deadlineGrade}   label="期限厳守" />
              <EvaluationBadge grade={referralGrade}   label="リファラル活動" />
            </div>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-0.5">① コンプライアンス評価</h2>
            <p className="text-sm text-gray-400 mb-5">
              評価者ごとに勤怠・報連相・積極性・勤務態度を入力してください。再保存で上書きされます。
            </p>
            <ComplianceForm memberId={id} existingEvaluations={evaluations} />
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-0.5">② 期限厳守</h2>
            <p className="text-sm text-gray-400 mb-5">
              期限未達だったカテゴリを記録してください。記録は累積されます（{deadlineRecords.length}件）。
            </p>
            <DeadlineForm memberId={id} />
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-0.5">③ リファラル活動</h2>
            <p className="text-sm text-gray-400 mb-4">
              今回の活動実績を入力してください。記録は累積されます（{referralRecords.length}件）。
            </p>

            {referralRecords.length > 0 && (
              <div className="mb-6">
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left py-2.5 px-4 font-medium text-gray-500">日付</th>
                        <th className="text-center py-2.5 px-4 font-medium text-gray-500">相談</th>
                        <th className="text-center py-2.5 px-4 font-medium text-gray-500">面談</th>
                        <th className="text-center py-2.5 px-4 font-medium text-gray-500">内定</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralRecords.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="py-2.5 px-4 text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-4 text-center text-gray-700">{r.consultationCount}</td>
                          <td className="py-2.5 px-4 text-center text-gray-700">{r.interviewCount}</td>
                          <td className="py-2.5 px-4 text-center text-gray-700">{r.offerCount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50 border-t border-indigo-100">
                        <td className="py-2.5 px-4 text-sm font-semibold text-indigo-700">合計</td>
                        <td className="py-2.5 px-4 text-center text-sm font-semibold text-indigo-700">
                          {referralRecords.reduce((s, r) => s + r.consultationCount, 0)}
                        </td>
                        <td className="py-2.5 px-4 text-center text-sm font-semibold text-indigo-700">
                          {referralRecords.reduce((s, r) => s + r.interviewCount, 0)}
                        </td>
                        <td className="py-2.5 px-4 text-center text-sm font-semibold text-indigo-700">
                          {referralRecords.reduce((s, r) => s + r.offerCount, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            <ReferralForm memberId={id} />
          </section>
        </>
      )}
    </div>
  );
}
