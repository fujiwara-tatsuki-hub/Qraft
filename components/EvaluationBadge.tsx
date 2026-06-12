import type { Grade } from '@/types';

const gradeStyle: Record<Grade, string> = {
  A: 'bg-green-100 text-green-700 border border-green-200',
  B: 'bg-blue-100 text-blue-700 border border-blue-200',
  C: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  D: 'bg-red-100 text-red-700 border border-red-200',
};

// 評価未設定時のスタイル
const pendingStyle = 'bg-gray-100 text-gray-400 border border-gray-200';

type Props = {
  grade?: Grade;
  label?: string;
};

export default function EvaluationBadge({ grade, label }: Props) {
  const badge = (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${grade ? gradeStyle[grade] : pendingStyle}`}
    >
      {grade ?? '-'}
    </span>
  );

  if (!label) return badge;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
      {badge}
    </div>
  );
}
