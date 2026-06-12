import type { Grade } from '@/types';

// 評価者の種別（DB の evaluator_type ENUM と対応）
export type EvaluatorType = 'leader' | 'sales' | 'branch_manager';

// evaluations テーブルの1行に対応する型
export type Evaluation = {
  id:              string;
  memberId:        string;
  evaluatorType:   EvaluatorType;
  attendanceGrade: Grade; // 勤怠
  reportingGrade:  Grade; // 報連相
  initiativeGrade: Grade; // 積極性
  createdAt:       string;
};

// 評価登録時の入力型（CRUD実装時に使用）
export type CreateEvaluationInput = {
  memberId:        string;
  evaluatorType:   EvaluatorType;
  attendanceGrade: Grade;
  reportingGrade:  Grade;
  initiativeGrade: Grade;
};
