import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeamById } from '@/repositories/teamRepository';
import { getMembersByTeamId } from '@/repositories/memberRepository';
import { getEvaluationsByMemberId } from '@/repositories/evaluationRepository';
import { getDeadlineRecordsByMemberId } from '@/repositories/deadlineRepository';
import { getReferralRecordsByMemberId } from '@/repositories/referralRepository';
import { calculateComplianceGrade } from '@/utils/calculateComplianceGrade';
import { calculateDeadlineGrade } from '@/utils/calculateDeadlineGrade';
import { calculateReferralGrade } from '@/utils/calculateReferralGrade';
import { calculateGrade } from '@/utils/calculateGrade';
import { calculateTeamScore } from '@/utils/calculateTeamScore';
import EvaluationBadge from '@/components/EvaluationBadge';
import MemberTable from '@/components/MemberTable';
import type { Member } from '@/types/member';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeamDetailPage({ params }: Props) {
  const { id } = await params;

  // チーム情報とメンバー一覧を並列取得
  const [team, teamMembers] = await Promise.all([
    getTeamById(id),
    getMembersByTeamId(id),
  ]);

  if (!team) notFound();

  // 全メンバーの評価レコードを並列取得し、各グレードを算出
  const memberGradeResults = await Promise.all(
    teamMembers.map(async (member) => {
      const [evaluations, deadlineRecords, referralRecords] = await Promise.all([
        getEvaluationsByMemberId(member.id),
        getDeadlineRecordsByMemberId(member.id),
        getReferralRecordsByMemberId(member.id),
      ]);

      const complianceGrade = calculateComplianceGrade(evaluations);
      const deadlineGrade   = calculateDeadlineGrade(deadlineRecords);
      const referralGrade   = calculateReferralGrade(referralRecords);
      const overallGrade    = calculateGrade(complianceGrade, deadlineGrade, referralGrade);

      return { complianceGrade, deadlineGrade, referralGrade, overallGrade };
    })
  );

  // メンバーテーブル用：個人総合評価を付与
  const membersWithGrades: Member[] = teamMembers.map((m, i) => ({
    ...m,
    overallGrade: memberGradeResults[i].overallGrade,
  }));

  // チームグレード：全メンバーの各評価を集計
  const teamWithGrades = {
    ...team,
    overallGrade:    calculateTeamScore(memberGradeResults.map((g) => g.overallGrade)),
    complianceGrade: calculateTeamScore(memberGradeResults.map((g) => g.complianceGrade)),
    deadlineGrade:   calculateTeamScore(memberGradeResults.map((g) => g.deadlineGrade)),
    referralGrade:   calculateTeamScore(memberGradeResults.map((g) => g.referralGrade)),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← チーム一覧
      </Link>

      {/* チーム名・基本情報 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{teamWithGrades.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{teamWithGrades.memberCount}名</p>
          </div>
          <EvaluationBadge grade={teamWithGrades.overallGrade} label="総合評価" />
        </div>

        {/* リーダー・サブリーダー */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-400 w-24 shrink-0">リーダー</span>
            <span className="text-sm text-gray-800 font-semibold">{teamWithGrades.leaderName}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-400 w-24 shrink-0">サブリーダー</span>
            <span className="text-sm text-gray-800 font-semibold">{teamWithGrades.subLeaderName}</span>
          </div>
        </div>

        {/* 評価内訳 */}
        <div className="pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4">評価内訳</p>
          <div className="grid grid-cols-3 gap-4">
            <EvaluationBadge grade={teamWithGrades.deadlineGrade}    label="期限厳守" />
            <EvaluationBadge grade={teamWithGrades.referralGrade}    label="リファラル活動" />
            <EvaluationBadge grade={teamWithGrades.complianceGrade}  label="コンプライアンス" />
          </div>
        </div>
      </div>

      {/* メンバー一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">メンバー一覧</h2>
          <p className="text-sm text-gray-400 mt-0.5">{membersWithGrades.length}名</p>
        </div>
        <MemberTable members={membersWithGrades} />
      </div>
    </div>
  );
}
