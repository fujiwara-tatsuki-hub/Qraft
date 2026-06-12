export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberById } from '@/repositories/memberRepository';
import { getTeamById, getTeams } from '@/repositories/teamRepository';
import { getEvaluationsByMemberId } from '@/repositories/evaluationRepository';
import { getDeadlineRecordsByMemberId } from '@/repositories/deadlineRepository';
import { getReferralRecordsByMemberId } from '@/repositories/referralRepository';
import { calculateComplianceGrade } from '@/utils/calculateComplianceGrade';
import { calculateDeadlineGrade } from '@/utils/calculateDeadlineGrade';
import { calculateReferralGrade } from '@/utils/calculateReferralGrade';
import { calculateGrade } from '@/utils/calculateGrade';
import EvaluationBadge from '@/components/EvaluationBadge';
import MemberProfileCard from '@/components/MemberProfileCard';
import ComplianceForm from '@/components/ComplianceForm';
import DeadlineForm from '@/components/DeadlineForm';
import ReferralForm from '@/components/ReferralForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;

  const member = await getMemberById(id);
  if (!member) notFound();

  const [team, allTeams, evaluations, deadlineRecords, referralRecords] = await Promise.all([
    getTeamById(member.teamId),
    getTeams(),
    getEvaluationsByMemberId(id),
    getDeadlineRecordsByMemberId(id),
    getReferralRecordsByMemberId(id),
  ]);

  const complianceGrade = calculateComplianceGrade(evaluations);
  const deadlineGrade   = calculateDeadlineGrade(deadlineRecords);
  const referralGrade   = calculateReferralGrade(referralRecords);
  const overallGrade    = calculateGrade(complianceGrade, deadlineGrade, referralGrade);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* 戻るリンク */}
      <Link
        href={`/team/${member.teamId}`}
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← {team?.name ?? 'チーム詳細'}
      </Link>

      {/* プロフィールカード（編集機能付き） */}
      <MemberProfileCard
        member={member}
        team={team}
        allTeams={allTeams}
        overallGrade={overallGrade}
      />

      {/* 評価内訳 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
        <p className="text-xs text-gray-400 mb-4">評価内訳</p>
        <div className="grid grid-cols-3 gap-4">
          <EvaluationBadge grade={complianceGrade} label="コンプライアンス" />
          <EvaluationBadge grade={deadlineGrade}   label="期限厳守" />
          <EvaluationBadge grade={referralGrade}   label="リファラル活動" />
        </div>
      </div>

      {/* ① コンプライアンス評価入力 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">① コンプライアンス評価</h2>
        <p className="text-xs text-gray-400 mb-5">
          評価者ごとに勤怠・報連相・積極性を入力してください。再保存で上書きされます。
        </p>
        <ComplianceForm memberId={id} existingEvaluations={evaluations} />
      </section>

      {/* ② 期限厳守入力 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">② 期限厳守</h2>
        <p className="text-xs text-gray-400 mb-5">
          カテゴリを選択して OK / NG を記録します。記録は累積されます（{deadlineRecords.length}件）。
        </p>
        <DeadlineForm memberId={id} />
      </section>

      {/* ③ リファラル活動入力 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">③ リファラル活動</h2>
        <p className="text-xs text-gray-400 mb-5">
          今回の活動実績を入力してください。記録は累積されます（{referralRecords.length}件）。
        </p>
        <ReferralForm memberId={id} />
      </section>
    </div>
  );
}
