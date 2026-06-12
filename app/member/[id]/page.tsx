import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberById } from '@/repositories/memberRepository';
import { getTeamById } from '@/repositories/teamRepository';
import { getEvaluationsByMemberId } from '@/repositories/evaluationRepository';
import { getDeadlineRecordsByMemberId } from '@/repositories/deadlineRepository';
import { getReferralRecordsByMemberId } from '@/repositories/referralRepository';
import { calculateComplianceGrade } from '@/utils/calculateComplianceGrade';
import { calculateDeadlineGrade } from '@/utils/calculateDeadlineGrade';
import { calculateReferralGrade } from '@/utils/calculateReferralGrade';
import { calculateGrade } from '@/utils/calculateGrade';
import EvaluationBadge from '@/components/EvaluationBadge';
import ComplianceForm from '@/components/ComplianceForm';
import DeadlineForm from '@/components/DeadlineForm';
import ReferralForm from '@/components/ReferralForm';
import type { MemberRole } from '@/types/member';

type Props = {
  params: Promise<{ id: string }>;
};

const roleStyle: Record<MemberRole, string> = {
  'リーダー':    'bg-indigo-100 text-indigo-700',
  'サブリーダー': 'bg-purple-100 text-purple-700',
  'メンバー':    'bg-gray-100 text-gray-600',
};

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;

  const member = await getMemberById(id);
  if (!member) notFound();

  const [team, evaluations, deadlineRecords, referralRecords] = await Promise.all([
    getTeamById(member.teamId),
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

      {/* メンバー基本情報 + 評価サマリー */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-gray-400">{team?.name}</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyle[member.role]}`}
              >
                {member.role}
              </span>
            </div>
          </div>
          <EvaluationBadge grade={overallGrade} label="総合評価" />
        </div>

        {/* 評価内訳 */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4">評価内訳</p>
          <div className="grid grid-cols-3 gap-4">
            <EvaluationBadge grade={complianceGrade} label="コンプライアンス" />
            <EvaluationBadge grade={deadlineGrade}   label="期限厳守" />
            <EvaluationBadge grade={referralGrade}   label="リファラル活動" />
          </div>
        </div>
      </div>

      {/* ① コンプライアンス評価入力 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">① コンプライアンス評価</h2>
        <p className="text-xs text-gray-400 mb-5">
          評価者ごとに勤怠・報連相・積極性を入力してください。再保存で上書きされます。
        </p>
        <ComplianceForm memberId={id} existingEvaluations={evaluations} />
      </section>

      {/* ② 期限厳守入力 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">② 期限厳守</h2>
        <p className="text-xs text-gray-400 mb-5">
          カテゴリを選択して OK / NG を記録します。記録は累積されます（{deadlineRecords.length}件）。
        </p>
        <DeadlineForm memberId={id} />
      </section>

      {/* ③ リファラル活動入力 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5">③ リファラル活動</h2>
        <p className="text-xs text-gray-400 mb-5">
          今回の活動実績を入力してください。記録は累積されます（{referralRecords.length}件）。
        </p>
        <ReferralForm memberId={id} />
      </section>
    </div>
  );
}
