/**
 * Sample L1 rule: flag full-width "！" in Japanese text and offer half-width "!".
 *
 * Demonstrates the SDK pattern:
 *  - extend the base class from `ctx.bases` (NOT a direct import),
 *  - detect via `ctx.toolkit` (here: regexReplace),
 *  - build the legacy meta with `ctx.toolkit.toJsonRuleMeta`.
 */
import type {
  LintIssue,
  LintRule,
  LintRuleConfig,
  RulesetContext,
  RulesetManifest,
} from "illusions-lint-sdk";

export function createSampleFwExclaim(ctx: RulesetContext, manifest: RulesetManifest): LintRule {
  const meta = manifest.rules.find((r) => r.ruleId === "sample-fw-exclaim");
  if (!meta) throw new Error("manifest is missing the sample-fw-exclaim rule");

  const { AbstractL1Rule } = ctx.bases;
  const { toolkit } = ctx;

  class SampleFwExclaim extends AbstractL1Rule {
    lint(text: string, config: LintRuleConfig): LintIssue[] {
      if (!config.enabled) return [];
      return toolkit.regexReplace({
        text,
        pattern: /！/,
        ruleId: this.id,
        severity: config.severity,
        message: "Use half-width '!' in Japanese text",
        messageJa: "全角『！』は半角『!』にしてください。",
        replacement: () => "!",
      });
    }
  }

  return new SampleFwExclaim(toolkit.toJsonRuleMeta(meta, manifest), {
    id: meta.ruleId,
    name: meta.nameJa,
    nameJa: meta.nameJa,
    description: meta.descriptionJa,
    descriptionJa: meta.descriptionJa,
    defaultConfig: meta.defaultConfig,
  });
}
