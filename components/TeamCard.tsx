import Link from 'next/link';
import type { Team } from '@/types/team';
import EvaluationBadge from '@/components/EvaluationBadge';

type Props = {
  team: Team;
};

export default function TeamCard({ team }: Props) {
  return (
    <Link href={`/team/${team.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 group-hover:shadow-md transition-shadow duration-200">
        {/* チーム名・総合評価 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
              {team.name}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{team.memberCount}名</p>
          </div>
          <EvaluationBadge grade={team.overallGrade} label="総合評価" />
        </div>

        {/* リーダー・サブリーダー */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 w-24 shrink-0">リーダー</span>
            <span className="text-gray-700 font-medium">{team.leaderName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 w-24 shrink-0">サブリーダー</span>
            <span className="text-gray-700 font-medium">{team.subLeaderName}</span>
          </div>
        </div>

        {/* 評価内訳 */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <EvaluationBadge grade={team.deadlineGrade} label="期限厳守" />
          <EvaluationBadge grade={team.referralGrade} label="リファラル活動" />
          <EvaluationBadge grade={team.complianceGrade} label="コンプライアンス" />
        </div>
      </div>
    </Link>
  );
}
