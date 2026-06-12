import Link from 'next/link';
import type { Team } from '@/types/team';
import type { Grade } from '@/types';
import EvaluationBadge from '@/components/EvaluationBadge';

const accentGradient: Record<Grade | 'none', string> = {
  A:    'from-violet-500 to-purple-600',
  B:    'from-blue-500 to-indigo-500',
  C:    'from-teal-400 to-teal-600',
  D:    'from-orange-400 to-red-500',
  none: 'from-gray-200 to-gray-300',
};

type Props = {
  team: Team;
};

export default function TeamCard({ team }: Props) {
  const accentKey = team.overallGrade ?? 'none';

  return (
    <Link href={`/team/${team.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Gradient top accent bar */}
        <div className={`h-1.5 bg-gradient-to-r ${accentGradient[accentKey]}`} />

        <div className="p-5">
          {/* Team name + overall grade */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors leading-tight">
                {team.name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{team.memberCount}名</p>
            </div>
            <EvaluationBadge grade={team.overallGrade} label="総合評価" size="lg" />
          </div>

          {/* Leader / Sub-leader */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20 shrink-0">リーダー</span>
              <span className="text-sm text-gray-700 font-medium truncate">
                {team.leaderName || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20 shrink-0">サブリーダー</span>
              <span className="text-sm text-gray-700 truncate">
                {team.subLeaderName || '—'}
              </span>
            </div>
          </div>

          {/* Sub-grade badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
            <EvaluationBadge grade={team.deadlineGrade}   label="期限厳守" />
            <EvaluationBadge grade={team.referralGrade}   label="リファラル活動" />
            <EvaluationBadge grade={team.complianceGrade} label="コンプライアンス" />
          </div>
        </div>
      </div>
    </Link>
  );
}
