import { describe, it, expect } from "vitest";

import ruleset from "../src/index";
import manifest from "../manifest.json";
import { createTestContext, CONFIG } from "./test-kit";

/**
 * Golden tests driven by manifest.docs so the 校正目録 (docs) and tests stay in
 * sync: every rule's positive example must yield 0 issues and its negative
 * example must yield >= 1.
 */
describe("ruleset golden examples", () => {
  const rules = ruleset.createRules(createTestContext());

  for (const meta of manifest.rules) {
    describe(meta.ruleId, () => {
      const rule = rules.find((r) => r.id === meta.ruleId);

      it("is built by createRules", () => {
        expect(rule, `rule ${meta.ruleId} not returned by createRules`).toBeDefined();
      });

      it("positive example yields no issue", () => {
        expect(rule!.lint(meta.docs.positiveExample, CONFIG)).toHaveLength(0);
      });

      it("negative example is flagged", () => {
        expect(rule!.lint(meta.docs.negativeExample, CONFIG).length).toBeGreaterThan(0);
      });
    });
  }
});

describe("sample-fw-exclaim specifics", () => {
  const rule = ruleset.createRules(createTestContext()).find((r) => r.id === "sample-fw-exclaim")!;

  it("suggests half-width '!'", () => {
    const issues = rule.lint("やった！", CONFIG);
    expect(issues).toHaveLength(1);
    expect(issues[0].fix?.replacement).toBe("!");
  });

  it("does nothing when disabled", () => {
    expect(rule.lint("やった！", { ...CONFIG, enabled: false })).toHaveLength(0);
  });
});
