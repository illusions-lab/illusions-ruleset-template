#!/usr/bin/env node
/**
 * Static consistency check for a ruleset, runnable without illusions.
 *
 * Verifies:
 *  - manifest.json is present and has the required fields
 *  - engineApi matches the supported version
 *  - maintainerEmail is present and looks like an email
 *  - every ruleId is unique
 *  - every ruleId starts with rulesetPrefix (when declared)
 *  - every rule declares applicableModes as an array of known mode ids
 *  - every rule has non-empty docs (positive/negative/source)
 *  - every rule has a docs/rules/<ruleId>.md file
 *
 * Exit code 1 on any problem. Run with `npm run validate`.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SUPPORTED_ENGINE_API = 1;
const CORRECTION_MODE_IDS = ["novel", "official", "blog", "academic", "sns"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
} catch (err) {
  console.error(`✗ manifest.json を読み込めません: ${err.message}`);
  process.exit(1);
}

for (const field of [
  "id",
  "name",
  "nameJa",
  "version",
  "engineApi",
  "license",
  "maintainerEmail",
  "rules",
]) {
  if (manifest[field] === undefined) fail(`manifest.${field} がありません`);
}

if (manifest.engineApi !== SUPPORTED_ENGINE_API) {
  fail(`engineApi は ${SUPPORTED_ENGINE_API} である必要があります（現在: ${manifest.engineApi}）`);
}

if (manifest.maintainerEmail !== undefined && !EMAIL_RE.test(String(manifest.maintainerEmail))) {
  fail(`maintainerEmail がメールアドレスの形式ではありません: ${manifest.maintainerEmail}`);
}

if (manifest.rulesetPrefix !== undefined && typeof manifest.rulesetPrefix !== "string") {
  fail("rulesetPrefix は文字列である必要があります");
}

const rules = Array.isArray(manifest.rules) ? manifest.rules : [];
if (rules.length === 0) warn("ルールが1つもありません");

const seen = new Set();
for (const rule of rules) {
  const id = rule?.ruleId;
  if (typeof id !== "string" || id.length === 0) {
    fail("ruleId が空のルールがあります");
    continue;
  }
  if (seen.has(id)) fail(`ruleId が重複しています: ${id}`);
  seen.add(id);

  if (manifest.rulesetPrefix && !id.startsWith(manifest.rulesetPrefix)) {
    fail(`ruleId「${id}」は接頭辞「${manifest.rulesetPrefix}」で始まっていません`);
  }

  if (!["L1", "L2", "L3"].includes(rule.level)) fail(`ruleId「${id}」の level が不正です`);
  if (!rule.defaultConfig) fail(`ruleId「${id}」に defaultConfig がありません`);

  if (!Array.isArray(rule.applicableModes)) {
    fail(`ruleId「${id}」に applicableModes（配列）がありません`);
  } else {
    for (const mode of rule.applicableModes) {
      if (!CORRECTION_MODE_IDS.includes(mode)) {
        fail(`ruleId「${id}」の applicableModes に不明なモード「${mode}」があります`);
      }
    }
  }

  const docs = rule.docs ?? {};
  for (const k of ["positiveExample", "negativeExample", "sourceReference"]) {
    if (!docs[k]) fail(`ruleId「${id}」の docs.${k} が空です`);
  }

  const docPath = join(ROOT, "docs", "rules", `${id}.md`);
  if (!existsSync(docPath)) fail(`ドキュメントがありません: docs/rules/${id}.md`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} 件の問題が見つかりました。`);
  process.exit(1);
}
console.log(`✓ manifest 検証 OK（${rules.length} ルール）`);
