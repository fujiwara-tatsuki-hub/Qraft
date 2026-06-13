'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function isNavActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/')         return pathname === '/' || pathname.startsWith('/team/');
  if (href === '/members')  return pathname === '/members' || pathname.startsWith('/member/');
  return pathname.startsWith(href);
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',        label: 'ダッシュボード',   icon: DashboardIcon },
  { href: '/',                 label: 'チーム一覧',       icon: UsersIcon     },
  { href: '/members',          label: 'メンバー一覧',     icon: UserIcon      },
  { href: '/ranking/teams',    label: 'チームランキング',  icon: TrophyIcon    },
  { href: '/ranking/members',  label: '個人ランキング',    icon: TrophyIcon    },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
      style={{ background: 'linear-gradient(180deg, #1e2456 0%, #0d1130 100%)' }}
    >
      {/* ブランディング */}
      <div className={`flex items-center gap-3 px-3 pt-5 pb-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'px-4'}`}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
          Q
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">Qraft</p>
            <p className="text-xs text-slate-400 leading-tight">コンプライアンス評価</p>
          </div>
        )}
      </div>

      {/* 折り畳みトグル */}
      <div className={`px-2 pt-2 pb-1 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors"
          aria-label={collapsed ? 'サイドバーを展開' : 'サイドバーを折り畳む'}
        >
          {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              style={active ? { background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)' } : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 今月のハイライト */}
      {!collapsed && (
        <div className="mx-2 mb-3 mt-2">
          <div
            className="rounded-xl p-3.5"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-yellow-400">今月のハイライト</span>
            </div>
            <p className="text-sm font-bold text-white leading-snug mb-3">
              全チームA評価を<br />目指しましょう！
            </p>
            <svg width="100%" height="28" viewBox="0 0 132 28" preserveAspectRatio="none">
              <rect x="0"   y="20" width="18" height="8"  rx="3" fill="rgba(129,140,248,0.4)" />
              <rect x="23"  y="14" width="18" height="14" rx="3" fill="rgba(129,140,248,0.55)" />
              <rect x="46"  y="9"  width="18" height="19" rx="3" fill="rgba(129,140,248,0.7)" />
              <rect x="69"  y="5"  width="18" height="23" rx="3" fill="rgba(129,140,248,0.82)" />
              <rect x="92"  y="2"  width="18" height="26" rx="3" fill="rgba(129,140,248,0.92)" />
              <rect x="115" y="0"  width="18" height="28" rx="3" fill="rgba(129,140,248,1.0)" />
            </svg>
          </div>
        </div>
      )}
    </aside>
  );
}
