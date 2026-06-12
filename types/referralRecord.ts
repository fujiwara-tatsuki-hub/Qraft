// referral_records テーブルの1行に対応する型
export type ReferralRecord = {
  id:                string;
  memberId:          string;
  consultationCount: number;
  interviewCount:    number;
  offerCount:        number;
  createdAt:         string;
};

// リファラルレコード登録時の入力型
export type CreateReferralRecordInput = {
  memberId:          string;
  consultationCount: number;
  interviewCount:    number;
  offerCount:        number;
};

// リファラルレコード更新時の入力型（各項目は個別に更新可能）
export type UpdateReferralRecordInput = {
  consultationCount?: number;
  interviewCount?:    number;
  offerCount?:        number;
};
