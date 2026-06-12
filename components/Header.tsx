export default function Header() {
  return (
    <header className="bg-indigo-700 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-wide">Qraft</span>
          <span className="text-indigo-200 text-sm hidden sm:block">
            九州支店チーム評価
          </span>
        </div>
      </div>
    </header>
  );
}
