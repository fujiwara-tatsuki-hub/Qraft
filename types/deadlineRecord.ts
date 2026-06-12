// deadline_records テーブルの category ENUM と対応
export type DeadlineCategory =
  | 'document'               // 提出物
  | 'training'               // 研修受講
  | 'transportation_expense' // 交通費経費精算
  | 'shift'                  // シフト提出
  | 'other';                 // その他依頼事項

// deadline_records テーブルの1行に対応する型
export type DeadlineRecord = {
  id:          string;
  memberId:    string;
  category:    DeadlineCategory;
  isCompleted: boolean;
  createdAt:   string;
};

// 期限厳守レコード登録時の入力型（CRUD実装時に使用）
export type CreateDeadlineRecordInput = {
  memberId:    string;
  category:    DeadlineCategory;
  isCompleted: boolean;
};
