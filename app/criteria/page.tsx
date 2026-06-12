export const dynamic = 'force-dynamic';

type GradeRowProps = {
  grade: string;
  score: string;
  threshold: string;
  color: string;
};

function GradeRow({ grade, score, threshold, color }: GradeRowProps) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${color}`}>
        {grade}
      </span>
      <div className="flex-1">
        <p className="text-base font-semibold text-gray-800">{score}点</p>
        <p className="text-sm text-gray-400">{threshold}</p>
      </div>
    </div>
  );
}

type SectionProps = {
  number: string;
  title: string;
  children: React.ReactNode;
};

function Section({ number, title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

type TableRowProps = {
  cols: string[];
  header?: boolean;
};

function TableRow({ cols, header }: TableRowProps) {
  const base = 'py-2.5 px-4 text-sm border-b border-gray-100 last:border-0';
  return (
    <tr className={header ? 'bg-gray-50' : 'hover:bg-gray-50'}>
      {cols.map((col, i) => (
        header
          ? <th key={i} className={`${base} text-left font-semibold text-gray-600`}>{col}</th>
          : <td key={i} className={`${base} text-gray-700`}>{col}</td>
      ))}
    </tr>
  );
}

export default function CriteriaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">評価基準</h1>
        <p className="text-base text-gray-400 mt-1">各評価の算出ロジックをまとめています</p>
      </div>

      <div className="space-y-5">

        {/* 全体の仕組み */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-indigo-900 mb-3">全体の仕組み</h2>
          <div className="space-y-2 text-base text-indigo-800">
            <p>① コンプライアンス ② 期限厳守 ③ リファラル活動 の3項目を評価し、その平均が<strong>個人評価</strong>になります。</p>
            <p className="text-sm text-indigo-600 mt-1">※ リーダーは個人評価の対象外です。チームの個人評価の平均が<strong>チーム評価</strong>として表示されます。</p>
          </div>
        </div>

        {/* グレード基準 */}
        <Section number="★" title="グレード基準">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { grade: 'A', score: '4', threshold: '平均 3.5以上', color: 'bg-violet-100 text-violet-700' },
              { grade: 'B', score: '3', threshold: '平均 2.5以上', color: 'bg-blue-100 text-blue-700' },
              { grade: 'C', score: '2', threshold: '平均 1.5以上', color: 'bg-teal-100 text-teal-700' },
              { grade: 'D', score: '1', threshold: '平均 1.5未満', color: 'bg-orange-100 text-orange-700' },
            ].map((g) => (
              <div key={g.grade} className="border border-gray-100 rounded-xl p-4 text-center">
                <span className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2 ${g.color}`}>
                  {g.grade}
                </span>
                <p className="text-base font-semibold text-gray-800">{g.score}点</p>
                <p className="text-xs text-gray-400 mt-0.5">{g.threshold}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* コンプライアンス評価 */}
        <Section number="①" title="コンプライアンス評価">
          <p className="text-sm text-gray-500 mb-4">評価者（最大3名）が以下の3項目をA〜Dで評価し、全スコアの平均で算出します。</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                <TableRow cols={['評価項目', '内容']} header />
                <TableRow cols={['勤怠', '遅刻・欠勤・無断欠席がないか']} />
                <TableRow cols={['報連相', '報告・連絡・相談が適切にできているか']} />
                <TableRow cols={['積極性', '仕事に対して積極的に取り組んでいるか']} />
              </tbody>
            </table>
          </div>
        </Section>

        {/* 期限厳守評価 */}
        <Section number="②" title="期限厳守評価">
          <p className="text-sm text-gray-500 mb-4">NGのみ記録。月あたりNG数が少ないほど評価が高くなります。</p>

          <div className="space-y-4">
            <div className="bg-teal-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-teal-800 mb-2">NGが0件の場合（登録からの経過期間で判定）</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <TableRow cols={['経過期間', '評価']} header />
                    <TableRow cols={['1ヶ月未満', 'C（実績蓄積中）']} />
                    <TableRow cols={['1ヶ月以上', 'B']} />
                    <TableRow cols={['2ヶ月以上', 'A']} />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-orange-800 mb-2">NGが1件以上の場合（月あたりNG数で判定）</p>
              <p className="text-xs text-orange-600 mb-3">月あたりNG数 ＝ NG件数 ÷ 最初のNG記録からの経過月数（最低1ヶ月）</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <TableRow cols={['月あたりNG数', '評価']} header />
                    <TableRow cols={['0.5件以下', 'B']} />
                    <TableRow cols={['1.0件以下', 'C']} />
                    <TableRow cols={['1.0件超', 'D']} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Section>

        {/* リファラル活動評価 */}
        <Section number="③" title="リファラル活動評価">
          <p className="text-sm text-gray-500 mb-4">活動内容に応じた加重スコアを月あたりで換算して評価します。</p>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">活動の配点</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: '相談', score: '0.5点' },
                  { label: '面談', score: '2点' },
                  { label: '内定', score: '5点' },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-gray-100 rounded-lg py-3 px-2">
                    <p className="text-base font-bold text-indigo-700">{item.score}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-teal-800 mb-2">合計スコアが0の場合（登録からの経過期間で判定）</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <TableRow cols={['経過期間', '評価']} header />
                    <TableRow cols={['1ヶ月未満', 'C（活動前）']} />
                    <TableRow cols={['1ヶ月以上', 'D（活動なし）']} />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-indigo-800 mb-2">スコアがある場合（月あたりレートで判定）</p>
              <p className="text-xs text-indigo-600 mb-3">月あたりレート ＝ 合計スコア ÷ 登録からの経過月数（最低1ヶ月）</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <TableRow cols={['月あたりレート', '評価', '目安']} header />
                    <TableRow cols={['2.5以上', 'A', '内定1件 ÷ 2ヶ月ペース相当']} />
                    <TableRow cols={['1.25以上', 'B', '内定1件 ÷ 4ヶ月ペース相当']} />
                    <TableRow cols={['0.83以上', 'C', '内定1件 ÷ 6ヶ月ペース相当']} />
                    <TableRow cols={['0.83未満', 'D', '活動が少ない']} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Section>

        {/* チーム評価 */}
        <Section number="T" title="チーム評価">
          <div className="space-y-3 text-base text-gray-700">
            <p>リーダーを除く<strong>サブリーダー・メンバーの個人評価の平均</strong>でチームの総合評価を算出します。</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
              <p>チーム評価 ＝ （サブリーダー＋メンバー全員の個人評価スコアの合計）÷ 人数</p>
              <p className="mt-1">※ 個人評価がまだない（undefined）メンバーは平均の計算から除外されます。</p>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
