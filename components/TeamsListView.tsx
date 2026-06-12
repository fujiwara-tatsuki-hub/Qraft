'use client';

import { useState, useMemo } from 'react';
import type { Team } from '@/types/team';
import type { Grade } from '@/types';
import TeamCard from '@/components/TeamCard';

type SortKey = 'grade_desc' | 'grade_asc' | 'members_desc' | 'name_asc';
type ViewMode = 'grid' | 'list';

const GRADE_SCORE: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1 };

function sortTeams(teams: Team[], sort: SortKey): Team[] {
  return [...teams].sort((a, b) => {
    const sa = a.overallGrade ? GRADE_SCORE[a.overallGrade] : 0;
    const sb = b.overallGrade ? GRADE_SCORE[b.overallGrade] : 0;
    switch (sort) {
      case 'grade_desc':   return sb - sa;
      case 'grade_asc':    return sa - sb;
      case 'members_desc': return b.memberCount - a.memberCount;
      case 'name_asc':     return a.name.localeCompare(b.name, 'ja');
    }
  });
}

const SORT_LABELS: Record<SortKey, string> = {
  grade_desc:   '総合評価の高い順',
  grade_asc:    '総合評価の低い順',
  members_desc: 'メンバー数の多い順',
  name_asc:     'チーム名順',
};

function GridViewIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export default function TeamsListView({ teams }: { teams: Team[] }) {
  const [sort, setSort] = useState<SortKey>('grade_desc');
  const [view, setView] = useState<ViewMode>('grid');

  const sorted = useMemo(() => sortTeams(teams, sort), [teams, sort]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <option key={key} value={key}>{SORT_LABELS[key]}</option>
          ))}
        </select>

        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-md transition-colors ${
              view === 'grid'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="グリッド表示"
          >
            <GridViewIcon />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-colors ${
              view === 'list'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="リスト表示"
          >
            <ListViewIcon />
          </button>
        </div>
      </div>

      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'flex flex-col gap-3'
        }
      >
        {sorted.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
