# コントリビューション・ガイド

このルールセットへの貢献ありがとうございます。

## 開発の流れ

```bash
npm install
npm run check     # typecheck + test + build（PR 前に必須）
npm run validate  # manifest とドキュメント/接頭辞の整合チェック
```

## ルールを追加する

1. `src/rules/<ruleId>.ts` に実装（基底・道具は `ctx` から受け取る。SDK は `import type` のみ）。
2. `src/index.ts` の `createRules` から返す。
3. `manifest.json` の `rules[]` にメタを追加（`ruleId` は `rulesetPrefix` で始める。`docs` に正例/誤例/出典）。
4. `docs/rules/<ruleId>.md` を作成（1ルール=1ファイル）。
5. `test/<ruleId>.test.ts` を追加（positive→0 / negative→≥1）。
6. `npm run check && npm run validate` が緑であることを確認。
7. `CHANGELOG.md` の `Unreleased` に記載。

## コーディング規約

- TypeScript strict。`any` 禁止（`unknown` を使う）。
- UI に出る文字列（`messageJa` / `nameJa` / `descriptionJa`）は日本語。
- コード・コメントは英語または日本語。
- 文字幅・濁点・旧字体などの正規化は `ctx.toolkit.nfkc` を優先（ハードコード変換表を避ける）。

## コミット / PR

- 1 PR = 論理的に1つの変更。`npm run check` と `npm run validate` を通してから提出。
- レビューでの指摘は、根拠を添えて合意のうえ取り込む。
