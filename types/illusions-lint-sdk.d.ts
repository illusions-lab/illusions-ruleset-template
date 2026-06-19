/**
 * Type contract for the illusions校正(lint) ruleset SDK.
 *
 * Vendored copy of `@/lib/linting/sdk` from the illusions repo, kept here so a
 * ruleset can be authored against `import type { … } from "illusions-lint-sdk"`
 * without depending on the illusions source tree.
 *
 * IMPORTANT — these are TYPES ONLY. At runtime, the base classes and detector
 * toolkit are injected by illusions through the `RulesetContext` passed to
 * `createRules`. Never `import` VALUES from this module; only `import type`.
 *
 * Keep `engineApi` in your manifest equal to ENGINE_API_VERSION; illusions
 * quarantines rulesets whose engineApi does not match.
 */
declare module "illusions-lint-sdk" {
  // ---- Core lint primitives ----
  export type Severity = "error" | "warning" | "info";
  export type RuleLevel = "L1" | "L2" | "L3";

  export interface LintReference {
    standard: string;
    section?: string;
    url?: string;
  }

  export interface LintIssue {
    ruleId: string;
    severity: Severity;
    message: string;
    messageJa: string;
    from: number;
    to: number;
    reference?: LintReference;
    originalText?: string;
    fix?: { label: string; labelJa: string; replacement: string };
  }

  export interface LintRuleConfig {
    enabled: boolean;
    severity: Severity;
    skipDialogue?: boolean;
    options?: Record<string, unknown>;
  }

  export interface LintRule {
    id: string;
    name: string;
    nameJa: string;
    description: string;
    descriptionJa: string;
    level: RuleLevel;
    engine?: "regex" | "morphological";
    defaultConfig: LintRuleConfig;
    lint(text: string, config: LintRuleConfig): LintIssue[];
  }

  /** Legacy per-rule metadata consumed by the base-class constructors. */
  export interface JsonRuleMeta {
    ruleId: string;
    level: RuleLevel;
    description: string;
    patternLogic: string;
    positiveExample: string;
    negativeExample: string;
    sourceReference: string;
    bookTitle: string;
  }

  /** Morphological (kuromoji) token, for L2 rules. */
  export interface Token {
    surface: string;
    pos: string;
    pos_detail_1?: string;
    pos_detail_2?: string;
    pos_detail_3?: string;
    conjugation_type?: string;
    conjugation_form?: string;
    basic_form?: string;
    reading?: string;
    pronunciation?: string;
    start: number;
    end: number;
  }

  /** Lightweight dictionary lookup projection. */
  export interface DictLookup {
    found: boolean;
    reading?: string;
    pos?: string;
    register?: string;
    freqRank?: number;
  }

  export type GenjiHealthState =
    | "ready"
    | "web-fallback"
    | "not-installed"
    | "corrupt"
    | "unknown";

  /** Correction mode (校正モード) identifier. */
  export type CorrectionModeId = "novel" | "official" | "blog" | "academic" | "sns";

  /** All correction modes a rule may opt into via applicableModes. */
  export const CORRECTION_MODE_IDS: readonly CorrectionModeId[];

  // ---- Base classes (declared abstract; provided at runtime via ctx.bases) ----
  export abstract class AbstractLintRule implements LintRule {
    readonly id: string;
    readonly name: string;
    readonly nameJa: string;
    readonly description: string;
    readonly descriptionJa: string;
    readonly level: RuleLevel;
    engine?: "regex" | "morphological";
    readonly defaultConfig: LintRuleConfig;
    abstract lint(text: string, config: LintRuleConfig): LintIssue[];
  }

  export abstract class AbstractL1Rule extends AbstractLintRule {
    readonly meta: JsonRuleMeta;
    constructor(
      meta: JsonRuleMeta,
      config: {
        id: string;
        name: string;
        nameJa: string;
        description: string;
        descriptionJa: string;
        defaultConfig: LintRuleConfig;
      },
    );
  }

  export abstract class AbstractMorphologicalLintRule extends AbstractLintRule {
    abstract lintWithTokens(
      text: string,
      tokens: ReadonlyArray<Token>,
      config: LintRuleConfig,
    ): LintIssue[];
  }

  export abstract class AbstractDocumentLintRule extends AbstractLintRule {
    abstract lintDocument(
      paragraphs: ReadonlyArray<{ text: string; index: number }>,
      config: LintRuleConfig,
    ): Array<{ paragraphIndex: number; issues: LintIssue[] }>;
  }

  export abstract class AbstractMorphologicalDocumentLintRule extends AbstractLintRule {
    abstract lintDocumentWithTokens(
      paragraphs: ReadonlyArray<{ text: string; index: number; tokens: ReadonlyArray<Token> }>,
      config: LintRuleConfig,
    ): Array<{ paragraphIndex: number; issues: LintIssue[] }>;
  }

  // ---- Ruleset module contract ----
  export const ENGINE_API_VERSION: number;
  export function requirementKey(req: RulesetRequirement): string;

  export type RulesetRequirement = { kind: "dict"; dictId: "genji" };
  export type GuidelineLicenseLabel = "Public" | "Paid" | "CC BY 4.0";

  export interface RulesetGuidelineMeta {
    id: string;
    nameJa: string;
    publisherJa: string;
    year: number | null;
    license: GuidelineLicenseLabel;
    descriptionJa: string;
  }

  export interface RulesetRuleDocs {
    positiveExample: string;
    negativeExample: string;
    sourceReference: string;
  }

  export interface RulesetRuleMeta {
    ruleId: string;
    nameJa: string;
    descriptionJa: string;
    guidelineId?: string;
    level: RuleLevel;
    defaultConfig: LintRuleConfig;
    supportsSkipDialogue?: boolean;
    /**
     * Correction modes this rule auto-enables in. Switching to a listed mode
     * turns the rule on automatically. Empty array = manual toggle only.
     */
    applicableModes: CorrectionModeId[];
    docs: RulesetRuleDocs;
    requires?: RulesetRequirement[];
  }

  export interface RulesetManifest {
    id: string;
    name: string;
    nameJa: string;
    version: string;
    engineApi: number;
    license: string;
    /** Maintainer contact email. REQUIRED. Used for marketplace notifications. */
    maintainerEmail: string;
    /** Shared naming prefix for every ruleId (collision avoidance). */
    rulesetPrefix?: string;
    guidelines: RulesetGuidelineMeta[];
    rules: RulesetRuleMeta[];
    requires?: RulesetRequirement[];
  }

  export interface RulesetModule {
    manifest: RulesetManifest;
    createRules(ctx: RulesetContext): LintRule[];
  }

  // ---- Context handed to createRules ----
  export interface RulesetBases {
    AbstractLintRule: typeof AbstractLintRule;
    AbstractL1Rule: typeof AbstractL1Rule;
    AbstractMorphologicalLintRule: typeof AbstractMorphologicalLintRule;
    AbstractDocumentLintRule: typeof AbstractDocumentLintRule;
    AbstractMorphologicalDocumentLintRule: typeof AbstractMorphologicalDocumentLintRule;
  }

  export interface RegexReplaceOptions {
    text: string;
    pattern: RegExp;
    ruleId: string;
    severity: Severity;
    message: string;
    messageJa: string;
    replacement: (match: RegExpExecArray) => string;
    span?: (match: RegExpExecArray) => { from: number; to: number; original: string };
    reference?: LintReference;
    fixLabel?: string;
    fixLabelJa?: string;
  }

  export interface UnitSpec {
    pattern: RegExp;
    correct: string;
  }

  export interface UnitDetectorOptions {
    text: string;
    ruleId: string;
    severity: Severity;
    units: ReadonlyArray<UnitSpec>;
    reference?: LintReference;
    messageJa?: (matched: string, correct: string) => string;
    dedup?: boolean;
  }

  export interface WordListMatch {
    word: string;
    from: number;
    to: number;
  }

  export interface DictToolkit {
    readonly ready: boolean;
    readonly state: GenjiHealthState;
    lookupBatch(terms: string[]): Promise<Map<string, DictLookup>>;
    has(term: string): Promise<boolean>;
  }

  export interface DetectorToolkit {
    nfkc(input: string): string;
    charMap(map: ReadonlyMap<string, string>): (ch: string) => string;
    applyCharMap(map: ReadonlyMap<string, string>, input: string): string;
    regexReplace(opts: RegexReplaceOptions): LintIssue[];
    detectUnits(opts: UnitDetectorOptions): LintIssue[];
    matchWordList(text: string, words: ReadonlyArray<string>): WordListMatch[];
    dedupe(issues: LintIssue[], key?: (issue: LintIssue) => string): LintIssue[];
    posFilter(tokens: ReadonlyArray<Token>, pred: (t: Token) => boolean): Token[];
    toJsonRuleMeta(rule: RulesetRuleMeta, manifest: RulesetManifest): JsonRuleMeta;
    dict: DictToolkit;
  }

  export interface RulesetDeps {
    requirements: ReadonlyMap<string, boolean>;
    dictState: GenjiHealthState;
  }

  export interface RulesetContext {
    engineApi: number;
    bases: RulesetBases;
    toolkit: DetectorToolkit;
    deps: RulesetDeps;
  }
}
