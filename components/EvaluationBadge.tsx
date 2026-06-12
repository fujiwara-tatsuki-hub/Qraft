import type { Grade } from '@/types';

export type BadgeSize = 'sm' | 'md' | 'lg';

type Props = {
  grade?: Grade;
  label?: string;
  size?: BadgeSize;
};

const gradeGradient: Record<Grade, string> = {
  A: 'from-violet-500 to-purple-600',
  B: 'from-blue-500 to-blue-700',
  C: 'from-teal-400 to-teal-600',
  D: 'from-orange-400 to-red-500',
};

const gradeShadow: Record<Grade, string> = {
  A: 'shadow-violet-200',
  B: 'shadow-blue-200',
  C: 'shadow-teal-200',
  D: 'shadow-orange-200',
};

const sizeClasses: Record<BadgeSize, { circle: string; font: string; shadow: string }> = {
  sm: { circle: 'w-8 h-8',   font: 'text-sm font-bold',   shadow: '' },
  md: { circle: 'w-10 h-10', font: 'text-base font-bold', shadow: 'shadow-sm' },
  lg: { circle: 'w-14 h-14', font: 'text-xl font-bold',   shadow: 'shadow-md' },
};

export default function EvaluationBadge({ grade, label, size = 'md' }: Props) {
  const { circle, font, shadow } = sizeClasses[size];

  const circleEl = grade ? (
    <div
      className={`${circle} rounded-full bg-gradient-to-br ${gradeGradient[grade]} ${shadow} ${gradeShadow[grade]} flex items-center justify-center text-white ${font}`}
    >
      {grade}
    </div>
  ) : (
    <div
      className={`${circle} rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 ${font}`}
    >
      -
    </div>
  );

  if (!label) return circleEl;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
      {circleEl}
    </div>
  );
}
