# 校正目録（ルール ドキュメント）

このフォルダには**ルールごとのドキュメント**を置く（`docs/<ruleId>.md`）。各ファイルは
ルールの意図・出典・正負例・実装メモを記述する。`manifest.json` の `docs`（正例/負例/出典）と
内容を一致させ、テスト(`test/<ruleId>.test.ts`)のゴールデンとも同期させること。

## 書き方

1. ルールを `src/rules/<ruleId>.ts` に実装し、`src/index.ts` の `createRules` から返す。
2. `manifest.json` の `rules[]` に同じ `ruleId` のメタ（`docs` 正負例・出典含む）を追加する。
3. `docs/<ruleId>.md` をこのテンプレートに従って作成する。
4. `test/<ruleId>.test.ts` を追加（または共通ゴールデンが拾う）。
5. `npm run check`（typecheck + test + build）が緑になることを確認。

## テンプレート

ルールごとに [sample-fw-exclaim.md](./sample-fw-exclaim.md) を写経して使う。
