# ドキュメント

| パス | 内容 |
| --- | --- |
| `docs/rules/<ruleId>.md` | **1ルール = 1ファイル**。そのルールが何をするか（意図・出典・正負例・実装メモ）を記述する 校正目録。 |

## ルールを追加する手順

1. `src/rules/<ruleId>.ts` に実装し、`src/index.ts` の `createRules` から返す。
2. `manifest.json` の `rules[]` に同じ `ruleId` のメタ（`docs` 正負例・出典を含む）を追加する。
   `rulesetPrefix` を宣言している場合、`ruleId` はその接頭辞で始めること。
3. `docs/rules/<ruleId>.md` を [docs/rules/sample-fw-exclaim.md](./rules/sample-fw-exclaim.md) のテンプレートに
   従って作成する（**ルールごとに1ファイル**）。
4. `test/<ruleId>.test.ts` を追加（共通ゴールデンは `manifest.json` の例を自動検証する）。
5. `npm run check`（typecheck + test + build）が緑になることを確認する。

## 規約

- `docs/rules/` のファイル名は `ruleId` と一致させる（例 `sample-fw-exclaim` → `docs/rules/sample-fw-exclaim.md`）。
- `docs/rules/<ruleId>.md` の正例・誤例は `manifest.json` の `docs` と一致させ、テストと同期させる。
