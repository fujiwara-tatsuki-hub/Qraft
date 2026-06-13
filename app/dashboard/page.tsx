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
import type { Grade } from '@/types';

const GRADE_SCORE: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1 };
function gradeScore(g?: Grade) { return g ? GRADE_SCORE[g] : 0; }

// ────────────────────────────────────────────
// SVG ドーナツチャート
// ────────────────────────────────────────────
type DonutSegment = { count: number; color: string };

function DonutChart({ segments, total }: { segments: DonutSegment[]; total: number }) {
  const r = 52, cx = 70, cy = 70;
  const C = 2 * Math.PI * r;
  let cumAngle = -90;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="20" />
      {total > 0 && segments.filter(s => s.count > 0).map((seg, i) => {
        const len = (seg.count / total) * C;
        const rotation = cumAngle;
        cumAngle += (seg.count / total) * 360;
        return (
          <circle
            key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth="20"
            strokeDasharray={`${len} ${C + 10}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="system-ui">
        総メンバー
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e293b" fontFamily="system-ui">
        {total}名
      </text>
    </svg>
  );
}

// ────────────────────────────────────────────
// KPI カード
// ────────────────────────────────────────────
type KpiCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  unit: string;
};

function KpiCard({ icon, iconBg, label, value, unit }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <span className="text-xs text-gray-400 leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

// ────────────────────────────────────────────
// グレードバー（チーム別）
// ────────────────────────────────────────────
const GRADE_BAR: Record<Grade, { width: string; color: string }> = {
  A: { width: 'w-full',  color: 'bg-violet-500' },
  B: { width: 'w-3/4',   color: 'bg-blue-500'   },
  C: { width: 'w-1/2',   color: 'bg-teal-500'   },
  D: { width: 'w-1/4',   color: 'bg-orange-500' },
};

export default async function DashboardPage() {
  const teams = await getTeams();

  const teamData = await Promise.all(
    teams.map(async (team) => {
      const members = await getMembersByTeamId(team.id);
      const nonLeaders = members.filter((m) => m.role !== 'リーダー');

      const [evals, deadlines, referrals] = await Promise.all([
        getEvaluationsByTeamId(team.id),
        getDeadlineRecordsByTeamId(team.id),
        getReferralRecordsByTeamId(team.id),
      ]);

      const memberGrades = nonLeaders.map((m) => {
        const cg = calculateComplianceGrade(evals.filter((e) => e.memberId === m.id));
        const dg = calculateDeadlineGrade(deadlines.filter((d) => d.memberId === m.id), m.createdAt);
        const rg = calculateReferralGrade(referrals.filter((r) => r.memberId === m.id), m.createdAt);
        const overall = calculateGrade(cg, dg, rg);
        return { ...m, overallGrade: overall, teamName: team.name };
      });

      const teamOverall = calculateTeamScore(memberGrades.map((m) => m.overallGrade));

      const totalNGs = deadlines.filter(
        (d) => !d.isCompleted && nonLeaders.some((m) => m.id === d.memberId),
      ).length;

      const totalOffers = referrals
        .filter((r) => nonLeaders.some((m) => m.id === r.memberId))
        .reduce((s, r) => s + r.offerCount, 0);

      return {
        team: { ...team, overallGrade: teamOverall },
        members: memberGrades,
        totalNGs,
        totalOffers,
      };
    }),
  );

  // 集計
  const allMembers = teamData.flatMap((t) => t.members);
  const totalMembers = allMembers.length;
  const totalTeams   = teams.length;

  const gradeA        = allMembers.filter((m) => m.overallGrade === 'A').length;
  const gradeB        = allMembers.filter((m) => m.overallGrade === 'B').length;
  const gradeC        = allMembers.filter((m) => m.overallGrade === 'C').length;
  const gradeD        = allMembers.filter((m) => m.overallGrade === 'D').length;
  const gradeUngraded = allMembers.filter((m) => m.overallGrade === undefined).length;

  const abRate     = totalMembers > 0 ? Math.round(((gradeA + gradeB) / totalMembers) * 100) : 0;
  const totalNGs   = teamData.reduce((s, t) => s + t.totalNGs, 0);
  const totalOffers = teamData.reduce((s, t) => s + t.totalOffers, 0);

  const teamsSorted = [...teamData].sort((a, b) => gradeScore(b.team.overallGrade) - gradeScore(a.team.overallGrade));

  const topMembers = allMembers
    .filter((m) => m.overallGrade !== undefined)
    .sort((a, b) => gradeScore(b.overallGrade) - gradeScore(a.overallGrade))
    .slice(0, 5);

  const donutSegments: DonutSegment[] = [
    { count: gradeA,        color: '#7c3aed' },
    { count: gradeB,        color: '#3b82f6' },
    { count: gradeC,        color: '#14b8a6' },
    { count: gradeD,        color: '#f97316' },
    { count: gradeUngraded, color: '#cbd5e1' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-400 mt-0.5">九州支店チーム評価の概要</p>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          icon={<svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
          iconBg="bg-indigo-50" label="総メンバー数" value={totalMembers} unit="名"
        />
        <KpiCard
          icon={<svg className="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>}
          iconBg="bg-violet-50" label="チーム数" value={totalTeams} unit="チーム"
        />
        <KpiCard
          icon={<svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
          iconBg="bg-blue-50" label="A/B評価率" value={abRate} unit="%"
        />
        <KpiCard
          icon={<svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>}
          iconBg="bg-emerald-50" label="リファラル内定数" value={totalOffers} unit="件"
        />
        <KpiCard
          icon={<svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
          iconBg="bg-orange-50" label="期限NG合計" value={totalNGs} unit="件"
        />
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* グレード分布 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">評価グレード分布</h2>
          <div className="flex items-center gap-4">
            <DonutChart segments={donutSegments} total={totalMembers} />
            <div className="space-y-2.5 flex-1">
              {[
                { grade: 'A',   count: gradeA,        dot: 'bg-violet-500' },
                { grade: 'B',   count: gradeB,        dot: 'bg-blue-500'   },
                { grade: 'C',   count: gradeC,        dot: 'bg-teal-500'   },
                { grade: 'D',   count: gradeD,        dot: 'bg-orange-500' },
                { grade: '未',  count: gradeUngraded, dot: 'bg-slate-300'  },
              ].map(({ grade, count, dot }) => (
                <div key={grade} className="flex items-center gap-2 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                  <span className="text-gray-500 w-5">{grade}</span>
                  <span className="text-gray-800 font-semibold w-8">{count}名</span>
                  {totalMembers > 0 && (
                    <span className="text-gray-400 text-xs">
                      ({Math.round((count / totalMembers) * 100)}%)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* チーム別評価 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">チーム別評価</h2>
            <Link href="/" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
              すべてを見る →
            </Link>
          </div>
          <div className="space-y-3">
            {teamsSorted.slice(0, 7).map(({ team }) => {
              const bar = team.overallGrade ? GRADE_BAR[team.overallGrade] : null;
              return (
                <div key={team.id} className="flex items-center gap-3">
                  <Link
                    href={`/team/${team.id}`}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-700 transition-colors truncate flex-1 min-w-0"
                  >
                    {team.name}
                  </Link>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                    {bar && (
                      <div className={`h-full rounded-full ${bar.width} ${bar.color}`} />
                    )}
                  </div>
                  <div className="w-7 shrink-0">
                    <EvaluationBadge grade={team.overallGrade} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 上位メンバー */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">上位メンバー</h2>
            <Link href="/ranking/members" className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
              全ランキング →
            </Link>
          </div>
          <div className="space-y-3">
            {topMembers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">まだ評価データがありません</p>
            ) : topMembers.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-slate-100 text-slate-600' :
                  i === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                  {m.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/member/${m.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-indigo-700 transition-colors block truncate"
                  >
                    {m.name}
                  </Link>
                  <p className="text-xs text-gray-400 truncate">{m.teamName}</p>
                </div>
                <EvaluationBadge grade={m.overallGrade} size="sm" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
