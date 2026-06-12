export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white h-14 flex items-center px-6 shrink-0 shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-wide">Qraft</span>
        <span className="hidden sm:block text-slate-400 text-sm">九州支店チーム評価</span>
      </div>
    </header>
  );
}
