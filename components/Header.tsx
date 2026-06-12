import DateLabel from '@/components/DateLabel';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white h-14 flex items-center px-6 shrink-0 shadow-md">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xl font-bold tracking-wide">Qraft</span>
        <span className="hidden sm:block text-slate-400 text-sm">九州支店チーム評価</span>
      </div>
      <div className="flex items-center gap-5">
        <DateLabel />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
            管
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">管理者</p>
            <p className="text-xs text-slate-400 leading-tight">支店長</p>
          </div>
        </div>
      </div>
    </header>
  );
}
