# 勤務カレンダー Wear OS アプリ 仕様（Pixel Watch 3 用）

PC の Claude Code でこのファイルを読んで、`wear/` フォルダに Android（Wear OS）プロジェクトを作成する。
個人用にワイヤレスデバッグでインストールして使う。ストア公開はしない。

## 目的

勤務カレンダー（出勤＝白、休日＝赤）を、Pixel Watch 3 の **タイル（Tile）** で月のマス目の形で見る。

## データ

- アプリに組み込む：`wear/app/src/main/assets/calendar.json`
- 中身は作成ページ（https://soutsu.github.io/JobCalendar/ ）の「ファイルに書き出し」で作った `work-calendar-YYYY.json` をそのまま使う（ファイル名だけ `calendar.json` に変える）
- ウォッチ側で祝日計算はしない。次のフィールドだけを使う：

| フィールド | 例 | 意味 |
|---|---|---|
| `startYear` | `2026` | 年度（4月始まり） |
| `title` | `""` または任意 | 空なら `2026 - 2027` のように表示 |
| `subtitle` | `"A班専用Calendar"` | 補足表示用 |
| `rangeStart` / `rangeEnd` | `"2026-04-01"` / `"2027-04-30"` | データのある期間 |
| `offDays` | `["2026-04-04", ...]` | 休日の一覧（土日祝と手動の変更を反映済み）。これに含まれない日は出勤日 |
| `holidays` | `{"2026-09-21": "敬老の日"}` | 祝日名（任意で表示に使う） |

- `calendar.json` は公開サイト（GitHub Pages）に載らないよう **git に含めない**（`wear/.gitignore` 済み）

## タイルの表示

- 画面は丸型（Pixel Watch 3：41mm / 45mm）。背景は黒
- 上部：`2026年10月`（タップで今月に戻る）
- 曜日の見出し：日 月 火 水 木 金 土（日・土は赤）
- 日付のマス：7列 × 最大6行。**休日＝赤（#FF6B6B 程度）、出勤＝白**
- 今日：丸枠で強調
- 月の切り替え：左右に小さな ‹ › ボタン（タイルの状態を使って前月・翌月を表示。データ期間の外には進めない）
- データ期間外の月：「データがありません」と表示
- 丸い画面の端で切れないよう、グリッドは中央寄せで余白を取る
- 日付が変わったら今日の表示が更新されるようにする（次の0時までを有効期限にする等）

## アプリ本体（任意・簡易でよい）

- アプリを開いたときは、タイルと同じ月表示＋「2026年度 / A班専用Calendar」の表示程度でよい
- 横スワイプで月を切り替えられると尚よい

## 技術

- Kotlin、Gradle（Kotlin DSL）
- `androidx.wear.tiles` ＋ `androidx.wear.protolayout`（安定版の最新）
- minSdk 30、targetSdk は Wear OS 5 に合わせる
- ネットワーク・権限は不要

## 年に1回の更新手順

1. 作成ページで新年度のカレンダーを作って保存し、「ファイルに書き出し」
2. できた `work-calendar-YYYY.json` を `wear/app/src/main/assets/calendar.json` に上書き
3. Pixel Watch 3 のワイヤレスデバッグで接続し、`./gradlew installDebug`（または Android Studio から実行）
4. タイルが更新されない場合は、タイルを一度外して追加し直す
