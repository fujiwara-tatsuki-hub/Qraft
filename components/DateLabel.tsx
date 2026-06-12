'use client';

export default function DateLabel() {
  const d = new Date();
  return (
    <span className="text-sm text-slate-300">
      {d.getFullYear()}年{d.getMonth() + 1}月
    </span>
  );
}
