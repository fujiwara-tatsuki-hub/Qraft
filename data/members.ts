import type { Member } from '@/types/member';

// ダミーデータ。Supabase 導入後はこのファイルをサーバーサイドの fetch 関数に置き換える。
// Member 型のフィールドは members テーブルのカラムと対応させている。
export const members: Member[] = [
  // --- 日高チーム (id: '1') ---
  { id: 'm1',  teamId: '1', name: '日高 誠',     role: 'リーダー',    overallGrade: 'A' },
  { id: 'm2',  teamId: '1', name: '上田 みか',   role: 'サブリーダー', overallGrade: 'B' },
  { id: 'm3',  teamId: '1', name: '川田 健一',   role: 'メンバー',    overallGrade: 'A' },
  { id: 'm4',  teamId: '1', name: '坂本 由美',   role: 'メンバー',    overallGrade: 'B' },
  { id: 'm5',  teamId: '1', name: '橋本 浩',     role: 'メンバー',    overallGrade: 'A' },

  // --- 松川チーム (id: '2') ---
  { id: 'm6',  teamId: '2', name: '松川 健',     role: 'リーダー',    overallGrade: 'B' },
  { id: 'm7',  teamId: '2', name: '林 直子',     role: 'サブリーダー', overallGrade: 'A' },
  { id: 'm8',  teamId: '2', name: '大野 隆',     role: 'メンバー',    overallGrade: 'B' },
  { id: 'm9',  teamId: '2', name: '渡辺 恵子',   role: 'メンバー',    overallGrade: 'C' },

  // --- 前田チーム (id: '3') ---
  { id: 'm10', teamId: '3', name: '前田 浩二',   role: 'リーダー',    overallGrade: 'A' },
  { id: 'm11', teamId: '3', name: '中島 さやか', role: 'サブリーダー', overallGrade: 'B' },
  { id: 'm12', teamId: '3', name: '久保 修一',   role: 'メンバー',    overallGrade: 'A' },
  { id: 'm13', teamId: '3', name: '石川 美穂',   role: 'メンバー',    overallGrade: 'A' },
  { id: 'm14', teamId: '3', name: '今井 亮',     role: 'メンバー',    overallGrade: 'B' },
  { id: 'm15', teamId: '3', name: '高橋 奈々',   role: 'メンバー',    overallGrade: 'C' },

  // --- 内山チーム (id: '4') ---
  { id: 'm16', teamId: '4', name: '内山 克也',   role: 'リーダー',    overallGrade: 'C' },
  { id: 'm17', teamId: '4', name: '藤田 愛',     role: 'サブリーダー', overallGrade: 'B' },
  { id: 'm18', teamId: '4', name: '小川 豊',     role: 'メンバー',    overallGrade: 'C' },
  { id: 'm19', teamId: '4', name: '村上 春奈',   role: 'メンバー',    overallGrade: 'D' },
  { id: 'm20', teamId: '4', name: '長谷川 達也', role: 'メンバー',    overallGrade: 'C' },

  // --- 西山チーム (id: '5') ---
  { id: 'm21', teamId: '5', name: '西山 俊',     role: 'リーダー',    overallGrade: 'B' },
  { id: 'm22', teamId: '5', name: '木村 彩',     role: 'サブリーダー', overallGrade: 'A' },
  { id: 'm23', teamId: '5', name: '伊藤 大輔',   role: 'メンバー',    overallGrade: 'C' },
  { id: 'm24', teamId: '5', name: '荒木 友美',   role: 'メンバー',    overallGrade: 'B' },

  // --- 田崎チーム (id: '6') ---
  { id: 'm25', teamId: '6', name: '田崎 大輔',   role: 'リーダー',    overallGrade: 'D' },
  { id: 'm26', teamId: '6', name: '吉田 理恵',   role: 'サブリーダー', overallGrade: 'C' },
  { id: 'm27', teamId: '6', name: '尾崎 真',     role: 'メンバー',    overallGrade: 'D' },
  { id: 'm28', teamId: '6', name: '宮本 典子',   role: 'メンバー',    overallGrade: 'D' },
  { id: 'm29', teamId: '6', name: '竹内 隆史',   role: 'メンバー',    overallGrade: 'C' },
  { id: 'm30', teamId: '6', name: '斎藤 幸恵',   role: 'メンバー',    overallGrade: 'D' },

  // --- 竹田チーム (id: '7') ---
  { id: 'm31', teamId: '7', name: '竹田 勝',     role: 'リーダー',    overallGrade: 'C' },
  { id: 'm32', teamId: '7', name: '池田 奈緒',   role: 'サブリーダー', overallGrade: 'B' },
  { id: 'm33', teamId: '7', name: '富田 健二',   role: 'メンバー',    overallGrade: 'D' },

  // --- 河西チーム (id: '8') ---
  { id: 'm34', teamId: '8', name: '河西 浩',     role: 'リーダー',    overallGrade: 'B' },
  { id: 'm35', teamId: '8', name: '原田 美香',   role: 'サブリーダー', overallGrade: 'B' },
  { id: 'm36', teamId: '8', name: '成田 洋二',   role: 'メンバー',    overallGrade: 'C' },
  { id: 'm37', teamId: '8', name: '鎌田 由紀子', role: 'メンバー',    overallGrade: 'B' },
  { id: 'm38', teamId: '8', name: '野田 明彦',   role: 'メンバー',    overallGrade: 'A' },

  // --- 鈴木チーム (id: '9') ---
  { id: 'm39', teamId: '9', name: '鈴木 雄一',   role: 'リーダー',    overallGrade: 'A' },
  { id: 'm40', teamId: '9', name: '矢田 由紀',   role: 'サブリーダー', overallGrade: 'A' },
  { id: 'm41', teamId: '9', name: '清水 浩二',   role: 'メンバー',    overallGrade: 'B' },
  { id: 'm42', teamId: '9', name: '松本 美鈴',   role: 'メンバー',    overallGrade: 'A' },
];
