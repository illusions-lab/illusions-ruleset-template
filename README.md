# illusions-ruleset-template

illusions 校正(lint)ルールセット開発用テンプレート。**1リポジトリ = 1ルールセット**。

このテンプレートを `Use this template` で複製し、自分の校正ルールセットを開発する。ビルド成果物
（`dist/index.js` + `manifest.json`）を illusions の `~/.illusions/rulesets/<id>/` に置くと読み込まれる
（Electron 版のみ。Web 版は本体同梱ルールのみ）。

## クイックスタート

```bash
npm install
npm run check     # typecheck + test + build
```

`dist/index.js` が生成される。`manifest.json` と一緒に配布する。

## ディレクトリ構成

```
.
├── manifest.json                 # ★ルールセットのメタ（package.json 的存在。コードを実行せず読める）
├── package.json                  # npm メタ + ビルド/テストスクリプト
├── tsconfig.json / tsup.config.ts / vitest.config.ts
├── types/illusions-lint-sdk.d.ts # SDK 型契約（import type 用にベンダリング）
├── src/
│   ├── index.ts                  # default export: RulesetModule
│   └── rules/<ruleId>.ts         # 各ルールの実装
├── docs/
│   ├── README.md                 # 校正目録の書き方
│   └── <ruleId>.md               # ルールごとのドキュメント（テンプレ）
├── test/
│   ├── test-kit.ts               # ローカルテスト用の RulesetContext
│   └── <ruleId>.test.ts          # ゴールデン（positive→0 / negative→≥1）
└── .github/workflows/            # CI（typecheck/test/build）+ Release（成果物添付）
```

## ルールの書き方（要点）

- ルールセットは `RulesetModule` を **default export** する（`src/index.ts`）。
- `manifest` は**純データ**。UI 一覧・`engineApi` 整合・隔離判定にコード非実行で使われる。
- `createRules(ctx)` は `ctx` から基底クラスと道具を受け取る:
  - 基底: `ctx.bases.AbstractL1Rule` 等を `extends`。
  - 道具: `ctx.toolkit.regexReplace` / `nfkc`（濁点合成）/ `detectUnits`（単位重複除去）など。
    **車輪を再発明しない**。文字幅・濁点・旧字体は `nfkc` を優先（ハードコード変換表は避ける）。
- **SDK は `import type` のみ**。`illusions-lint-sdk` から値を import しない（外部モジュールは実行時に解決
  できない）。実体は必ず `ctx` 経由で受け取る。

サンプル: `src/rules/sample-fw-exclaim.ts` と `src/index.ts` を参照。詳細な契約は illusions 本体の
`docs/linting/ruleset-authoring.md` を参照。

## 辞典に依存するルール

幻辞(Genji)辞典が必要なルールは `manifest.json` の該当 `rules[]` に宣言する:

```json
"requires": [{ "kind": "dict", "dictId": "genji" }]
```

辞典が未ダウンロードのとき、illusions は**そのルールを自動的に無効化し、日本語の警告を1回表示**する。
`ctx.toolkit.dict` は未 ready 時に空結果を返すフェイルセーフなので、ルール側で分岐は不要。

## テスト（必須）

`test/test-kit.ts` の `createTestContext()` が、illusions が実行時に注入するものと同等の `ctx` を提供する。
各ルールに **positive 例→0 / negative 例→≥1** のゴールデンテストを書く。共通ゴールデンは
`manifest.json` の `docs` 例を自動的に検証する（`test/sample-fw-exclaim.test.ts` 参照）。

```bash
npm test
```

## 配布

- **フォルダ配布**: `dist/index.js` + `manifest.json` を `~/.illusions/rulesets/<id>/` に置く。
- **単一ファイル配布 / クローズドソース**: `npm run build:min` で難読化したり、`.illruleset` コンテナ
  （平文ヘッダ + ペイロード）にまとめる（illusions の `docs/linting/closed-source.md` 参照）。

## リリース

`v*` タグを push すると `.github/workflows/release.yml` が `dist/index.js` と `manifest.json` を
ビルドして GitHub Release に添付する。

```bash
npm version patch && git push --follow-tags
```

## バージョン互換

`manifest.json` の `engineApi` は illusions 側の `ENGINE_API_VERSION`（現在 **1**）と一致させること。
一致しないルールセットは隔離され、警告とともに読み込まれない。
