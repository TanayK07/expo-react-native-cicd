/**
 * packageManagerE2E.test.ts
 *
 * End-to-end tests proving that Issues #14 and #12 are fixed:
 *
 *   Issue #14 — "Allow execution without yarn.lock"
 *     User reports: "Dependencies lock file is not found … Supported file
 *     patterns: yarn.lock" because the generator hardcodes `cache: "yarn"` in
 *     actions/setup-node, which requires a yarn.lock file.
 *
 *   Issue #12 — "YARN LOCK ISSUES"
 *     User says "I am using npm" and gets the same fatal error.
 *
 * Root cause: the generator hardcoded 14 yarn-specific references:
 *   - `cache: "yarn"` in actions/setup-node (2×: test + build jobs)
 *   - `yarn.lock` in cache key hashFiles (2×)
 *   - `yarn cache dir` for cache directory (2×)
 *   - `yarn-cache-dir-path` step id (2×)
 *   - `yarn install` (2×: test + build jobs)
 *   - `yarn global add eas-cli@latest` (1×)
 *   - `yarn tsc`, `yarn lint`, `yarn format:check`, `yarn test`,
 *     `yarn test:rntl`, `yarn test:hooks` (up to 6×)
 *
 * These E2E tests validate the COMPLETE workflow output by:
 *   1. Parsing the generated YAML with js-yaml (same as GitHub Actions)
 *   2. Inspecting every step's `run`, `with`, `id`, and `name` fields
 *   3. Asserting zero yarn references for npm configs
 *   4. Asserting full backward compatibility for yarn configs
 *   5. Testing every permutation of storage × tests × advanced options
 *      for both package managers
 */

import yaml from "js-yaml";
import { generateWorkflowYaml } from "../workflowGenerator";
import { FormValues, AdvancedOptions } from "../../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_ADVANCED: AdvancedOptions = {
  iOSSupport: false,
  publishToExpo: false,
  publishToStores: false,
  jestTests: false,
  rntlTests: false,
  renderHookTests: false,
  caching: true,
  notifications: false,
};

function makeForm(overrides: Partial<FormValues> = {}): FormValues {
  return {
    storageType: "github-release",
    buildTypes: ["dev"],
    tests: [],
    triggers: ["push-main"],
    advancedOptions: { ...DEFAULT_ADVANCED },
    ...overrides,
  };
}

interface GHAStep {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  id?: string;
}

interface GHAJob {
  "runs-on": string;
  needs?: string | string[];
  steps: GHAStep[];
}

interface GHAWorkflow {
  name: string;
  on: Record<string, unknown>;
  env: Record<string, string>;
  jobs: Record<string, GHAJob>;
}

function parse(yamlStr: string): GHAWorkflow {
  return yaml.load(yamlStr) as GHAWorkflow;
}

/** Collect all string values from a parsed workflow (step runs, names, ids, with values). */
function collectAllStrings(wf: GHAWorkflow): string[] {
  const strings: string[] = [];
  for (const job of Object.values(wf.jobs)) {
    for (const step of job.steps) {
      if (step.run) strings.push(step.run);
      if (step.name) strings.push(step.name);
      if (step.id) strings.push(step.id);
      if (step.with) {
        for (const val of Object.values(step.with)) {
          if (typeof val === "string") strings.push(val);
        }
      }
    }
  }
  return strings;
}

// ─── 1. Issue #14 & #12 Exact Reproduction ──────────────────────────────────
//
// The root cause was `cache: "yarn"` in actions/setup-node. GitHub's
// setup-node action with `cache: "yarn"` searches for yarn.lock and fails
// with "Dependencies lock file is not found … Supported file patterns:
// yarn.lock" when only package-lock.json exists.

describe("Issue #14 & #12: npm users no longer get yarn.lock errors", () => {
  it("actions/setup-node uses cache: 'npm' (not 'yarn') when npm selected", () => {
    const yamlStr = generateWorkflowYaml(
      makeForm({ packageManager: "npm", tests: ["typescript"] }),
    );
    const wf = parse(yamlStr);

    // Check EVERY setup-node step in ALL jobs
    for (const [jobId, job] of Object.entries(wf.jobs)) {
      for (const step of job.steps) {
        if (step.uses?.includes("actions/setup-node")) {
          expect(step.with?.cache).toBe("npm");
        }
      }
    }
  });

  it("no step references yarn.lock anywhere when npm is selected", () => {
    const yamlStr = generateWorkflowYaml(
      makeForm({
        packageManager: "npm",
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          ...DEFAULT_ADVANCED,
          caching: true,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
        },
      }),
    );
    const wf = parse(yamlStr);
    const allStrings = collectAllStrings(wf);

    for (const s of allStrings) {
      expect(s).not.toContain("yarn.lock");
    }
  });

  it("cache hashFiles references package-lock.json when npm is selected", () => {
    const yamlStr = generateWorkflowYaml(
      makeForm({
        packageManager: "npm",
        tests: ["typescript"],
        advancedOptions: { ...DEFAULT_ADVANCED, caching: true },
      }),
    );
    const wf = parse(yamlStr);

    for (const job of Object.values(wf.jobs)) {
      for (const step of job.steps) {
        if (step.with?.key && typeof step.with.key === "string") {
          // Only check package manager cache steps (skip EAS build cache)
          if (
            step.with.key.includes("hashFiles") &&
            step.name?.includes("Setup npm cache")
          ) {
            expect(step.with.key).toContain("package-lock.json");
            expect(step.with.key).not.toContain("yarn.lock");
          }
        }
      }
    }
  });

  it("raw YAML string contains zero occurrences of the word 'yarn' when npm is selected (full config)", () => {
    // This is the definitive proof: with every feature enabled, there should
    // be absolutely no trace of yarn in the output.
    const yamlStr = generateWorkflowYaml(
      makeForm({
        packageManager: "npm",
        storageType: "zoho-drive",
        buildTypes: ["dev", "prod-apk", "prod-aab"],
        tests: ["typescript", "eslint", "prettier"],
        triggers: ["push-main", "pull-request", "manual"],
        advancedOptions: {
          ...DEFAULT_ADVANCED,
          caching: true,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          notifications: true,
          notificationType: "both",
        },
      }),
    );

    // Case-insensitive search for any yarn reference
    const yarnMatches = yamlStr.match(/yarn/gi);
    expect(yarnMatches).toBeNull();
  });
});

// ─── 2. npm Command Correctness (parsed YAML) ──────────────────────────────
//
// Verify every npm command is correct by parsing the YAML and inspecting
// the actual step objects, not just string matching.

describe("npm: all commands are correct in parsed YAML", () => {
  const npmFullConfig = makeForm({
    packageManager: "npm",
    storageType: "github-release",
    buildTypes: ["dev", "prod-apk", "prod-aab"],
    tests: ["typescript", "eslint", "prettier"],
    triggers: ["push-main", "pull-request", "manual"],
    advancedOptions: {
      ...DEFAULT_ADVANCED,
      caching: true,
      jestTests: true,
      rntlTests: true,
      renderHookTests: true,
    },
  });

  let wf: GHAWorkflow;
  let allSteps: GHAStep[];

  beforeAll(() => {
    const yamlStr = generateWorkflowYaml(npmFullConfig);
    wf = parse(yamlStr);
    allSteps = Object.values(wf.jobs).flatMap((j) => j.steps);
  });

  it("install dependencies step uses 'npm install'", () => {
    const installSteps = allSteps.filter((s) =>
      s.name?.includes("Install dependencies"),
    );
    expect(installSteps.length).toBeGreaterThanOrEqual(1);
    for (const step of installSteps) {
      expect(step.run).toContain("npm install");
      expect(step.run).not.toContain("yarn install");
    }
  });

  it("EAS CLI install uses 'npm install -g eas-cli@latest'", () => {
    const buildJob =
      wf.jobs["build-and-release"] || wf.jobs["build-and-deploy"];
    const installStep = buildJob.steps.find((s) =>
      s.name?.includes("Install dependencies"),
    );
    expect(installStep?.run).toContain("npm install -g eas-cli@latest");
    expect(installStep?.run).not.toContain("yarn global add");
  });

  it("TypeScript check uses 'npx tsc' (not 'yarn tsc')", () => {
    const tsStep = allSteps.find((s) => s.name?.includes("TypeScript check"));
    expect(tsStep).toBeDefined();
    expect(tsStep?.run).toBe("npx tsc");
  });

  it("ESLint step uses 'npm run lint'", () => {
    const lintStep = allSteps.find((s) => s.name?.includes("ESLint"));
    expect(lintStep).toBeDefined();
    expect(lintStep?.run).toBe("npm run lint");
  });

  it("Prettier step uses 'npm run format:check'", () => {
    const prettierStep = allSteps.find((s) =>
      s.name?.includes("Prettier check"),
    );
    expect(prettierStep).toBeDefined();
    expect(prettierStep?.run).toBe("npm run format:check");
  });

  it("Jest step uses 'npm test' (not 'npm run test')", () => {
    const jestStep = allSteps.find((s) => s.name?.includes("Jest Tests"));
    expect(jestStep).toBeDefined();
    expect(jestStep?.run).toBe("npm test");
  });

  it("RNTL step uses 'npm run test:rntl'", () => {
    const rntlStep = allSteps.find((s) =>
      s.name?.includes("React Native Testing Library"),
    );
    expect(rntlStep).toBeDefined();
    expect(rntlStep?.run).toBe("npm run test:rntl");
  });

  it("renderHook step uses 'npm run test:hooks'", () => {
    const hookStep = allSteps.find((s) => s.name?.includes("renderHook Tests"));
    expect(hookStep).toBeDefined();
    expect(hookStep?.run).toBe("npm run test:hooks");
  });

  it("cache directory step uses 'npm config get cache'", () => {
    const cacheSteps = allSteps.filter((s) =>
      s.name?.includes("cache directory path"),
    );
    expect(cacheSteps.length).toBeGreaterThanOrEqual(1);
    for (const step of cacheSteps) {
      expect(step.run).toContain("npm config get cache");
      expect(step.id).toBe("npm-cache-dir-path");
    }
  });

  it("cache setup step name contains 'npm' and key uses package-lock.json", () => {
    const cacheSetupSteps = allSteps.filter(
      (s) =>
        s.uses?.includes("actions/cache") &&
        s.name?.includes("Setup npm cache"),
    );
    expect(cacheSetupSteps.length).toBeGreaterThanOrEqual(1);
    for (const step of cacheSetupSteps) {
      const key = step.with?.key as string;
      expect(key).toContain("package-lock.json");
      expect(key).toContain("-npm-");
      expect(key).not.toContain("yarn");
    }
  });
});

// ─── 3. Yarn Backward Compatibility ─────────────────────────────────────────
//
// Ensure existing yarn behavior is UNCHANGED — this prevents regressions
// for all current users.

describe("yarn (default): full backward compatibility", () => {
  const yarnFullConfig = makeForm({
    // packageManager intentionally omitted — should default to yarn
    storageType: "zoho-drive",
    buildTypes: ["dev", "prod-apk", "prod-aab"],
    tests: ["typescript", "eslint", "prettier"],
    triggers: ["push-main", "pull-request", "manual"],
    advancedOptions: {
      ...DEFAULT_ADVANCED,
      caching: true,
      jestTests: true,
      rntlTests: true,
      renderHookTests: true,
    },
  });

  let wf: GHAWorkflow;
  let allSteps: GHAStep[];

  beforeAll(() => {
    const yamlStr = generateWorkflowYaml(yarnFullConfig);
    wf = parse(yamlStr);
    allSteps = Object.values(wf.jobs).flatMap((j) => j.steps);
  });

  it("actions/setup-node uses cache: 'yarn'", () => {
    for (const job of Object.values(wf.jobs)) {
      for (const step of job.steps) {
        if (step.uses?.includes("actions/setup-node")) {
          expect(step.with?.cache).toBe("yarn");
        }
      }
    }
  });

  it("install dependencies uses 'yarn install'", () => {
    const installSteps = allSteps.filter((s) =>
      s.name?.includes("Install dependencies"),
    );
    for (const step of installSteps) {
      expect(step.run).toContain("yarn install");
    }
  });

  it("EAS CLI uses 'yarn global add eas-cli@latest'", () => {
    const buildJob =
      wf.jobs["build-and-release"] || wf.jobs["build-and-deploy"];
    const installStep = buildJob.steps.find((s) =>
      s.name?.includes("Install dependencies"),
    );
    expect(installStep?.run).toContain("yarn global add eas-cli@latest");
  });

  it("TypeScript check uses 'yarn tsc'", () => {
    const tsStep = allSteps.find((s) => s.name?.includes("TypeScript check"));
    expect(tsStep?.run).toBe("yarn tsc");
  });

  it("ESLint uses 'yarn lint'", () => {
    const lintStep = allSteps.find((s) => s.name?.includes("ESLint"));
    expect(lintStep?.run).toBe("yarn lint");
  });

  it("Prettier uses 'yarn format:check'", () => {
    const prettierStep = allSteps.find((s) =>
      s.name?.includes("Prettier check"),
    );
    expect(prettierStep?.run).toBe("yarn format:check");
  });

  it("Jest uses 'yarn test'", () => {
    const jestStep = allSteps.find((s) => s.name?.includes("Jest Tests"));
    expect(jestStep?.run).toBe("yarn test");
  });

  it("RNTL uses 'yarn test:rntl'", () => {
    const rntlStep = allSteps.find((s) =>
      s.name?.includes("React Native Testing Library"),
    );
    expect(rntlStep?.run).toBe("yarn test:rntl");
  });

  it("renderHook uses 'yarn test:hooks'", () => {
    const hookStep = allSteps.find((s) => s.name?.includes("renderHook Tests"));
    expect(hookStep?.run).toBe("yarn test:hooks");
  });

  it("cache references yarn.lock and yarn-cache-dir-path", () => {
    const cacheSteps = allSteps.filter((s) =>
      s.name?.includes("cache directory path"),
    );
    for (const step of cacheSteps) {
      expect(step.run).toContain("yarn cache dir");
      expect(step.id).toBe("yarn-cache-dir-path");
    }
  });

  it("raw YAML contains zero occurrences of 'npm' (as a package manager command)", () => {
    const yamlStr = generateWorkflowYaml(yarnFullConfig);
    // npm should not appear as a command — but note: it can appear in
    // unrelated contexts like "node_modules" or step names. We specifically
    // check there are no npm install/run/test commands.
    expect(yamlStr).not.toContain("npm install");
    expect(yamlStr).not.toContain("npm run ");
    expect(yamlStr).not.toContain("npm test");
    expect(yamlStr).not.toContain("npm config get cache");
    expect(yamlStr).not.toContain("npx tsc");
    expect(yamlStr).not.toContain('cache: "npm"');
    expect(yamlStr).not.toContain("package-lock.json");
  });
});

// ─── 4. Explicit packageManager: 'yarn' matches default (undefined) ─────────

describe("explicit packageManager: 'yarn' produces identical output to undefined", () => {
  const configs: Array<{ label: string; overrides: Partial<FormValues> }> = [
    { label: "minimal config", overrides: {} },
    {
      label: "all tests + caching",
      overrides: {
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          ...DEFAULT_ADVANCED,
          caching: true,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
        },
      },
    },
    {
      label: "zoho-drive + all builds + all triggers",
      overrides: {
        storageType: "zoho-drive",
        buildTypes: ["dev", "prod-apk", "prod-aab"],
        triggers: ["push-main", "pull-request", "manual"],
      },
    },
  ];

  for (const { label, overrides } of configs) {
    it(`${label}: explicit yarn === undefined packageManager`, () => {
      const withUndefined = generateWorkflowYaml(makeForm(overrides));
      const withExplicitYarn = generateWorkflowYaml(
        makeForm({ ...overrides, packageManager: "yarn" }),
      );
      expect(withExplicitYarn).toBe(withUndefined);
    });
  }
});

// ─── 5. Cross-product: npm × every storage type ────────────────────────────
//
// Ensure npm works with all 4 storage types and produces valid YAML.

describe("npm × every storage type: valid YAML and correct commands", () => {
  const STORAGE_TYPES = [
    "github-release",
    "zoho-drive",
    "google-drive",
    "custom",
  ];

  for (const storageType of STORAGE_TYPES) {
    it(`npm + ${storageType}: parses as valid YAML with no yarn references`, () => {
      const yamlStr = generateWorkflowYaml(
        makeForm({
          packageManager: "npm",
          storageType,
          buildTypes: ["dev", "prod-apk", "prod-aab"],
          tests: ["typescript", "eslint", "prettier"],
          triggers: ["push-main", "pull-request", "manual"],
          advancedOptions: { ...DEFAULT_ADVANCED, caching: true },
        }),
      );

      // Must parse without error
      let parsed: unknown;
      expect(() => {
        parsed = yaml.load(yamlStr);
      }).not.toThrow();
      expect(parsed).not.toBeNull();

      // Zero yarn references
      expect(yamlStr).not.toContain("yarn");
    });
  }
});

// ─── 6. Cross-product: npm × every advanced option ─────────────────────────
//
// Ensure npm works correctly with iOS support, publishing, notifications, etc.

describe("npm × advanced options: valid YAML and no yarn leakage", () => {
  const ADVANCED_COMBOS: Array<{
    label: string;
    opts: Partial<AdvancedOptions>;
  }> = [
    { label: "caching disabled", opts: { caching: false } },
    {
      label: "iOS support",
      opts: { iOSSupport: true },
    },
    {
      label: "publishToExpo",
      opts: { publishToExpo: true },
    },
    {
      label: "publishToStores + iOS",
      opts: { publishToStores: true, iOSSupport: true },
    },
    {
      label: "all notifications (both)",
      opts: { notifications: true, notificationType: "both" },
    },
    {
      label: "discord notifications",
      opts: { notifications: true, notificationType: "discord" },
    },
    {
      label: "slack notifications",
      opts: { notifications: true, notificationType: "slack" },
    },
    {
      label: "all advanced options enabled",
      opts: {
        iOSSupport: true,
        publishToExpo: true,
        publishToStores: true,
        jestTests: true,
        rntlTests: true,
        renderHookTests: true,
        caching: true,
        notifications: true,
        notificationType: "both",
      },
    },
  ];

  for (const { label, opts } of ADVANCED_COMBOS) {
    it(`npm + ${label}: valid YAML, zero yarn references`, () => {
      const yamlStr = generateWorkflowYaml(
        makeForm({
          packageManager: "npm",
          storageType: "github-release",
          buildTypes: ["dev", "prod-apk"],
          tests: ["typescript", "eslint"],
          triggers: ["push-main", "manual"],
          advancedOptions: { ...DEFAULT_ADVANCED, ...opts },
        }),
      );

      // Parse
      expect(() => yaml.load(yamlStr)).not.toThrow();

      // No yarn leakage
      expect(yamlStr).not.toContain("yarn");
    });
  }
});

// ─── 7. GHA Schema Compliance for npm configs ──────────────────────────────
//
// Validates that npm-generated workflows pass the same GHA structural checks
// that the 1,568 permutation tests use for yarn.

describe("npm: GitHub Actions schema compliance across permutations", () => {
  const STORAGE_TYPES = [
    "github-release",
    "zoho-drive",
    "google-drive",
    "custom",
  ];
  const BUILD_COMBOS = [
    ["dev"],
    ["prod-apk"],
    ["prod-aab"],
    ["dev", "prod-apk", "prod-aab"],
  ];
  const TEST_COMBOS = [
    [],
    ["typescript"],
    ["typescript", "eslint", "prettier"],
  ];
  const TRIGGER_COMBOS = [["push-main"], ["manual"], ["push-main", "manual"]];

  // 4 × 4 × 3 × 3 = 144 permutations
  for (const storageType of STORAGE_TYPES) {
    for (const buildTypes of BUILD_COMBOS) {
      for (const tests of TEST_COMBOS) {
        for (const triggers of TRIGGER_COMBOS) {
          const label = `npm | ${storageType} | builds=[${buildTypes}] | tests=[${tests.length ? tests : "none"}] | triggers=[${triggers}]`;

          it(`valid GHA: ${label}`, () => {
            const yamlStr = generateWorkflowYaml({
              packageManager: "npm",
              storageType,
              buildTypes,
              tests,
              triggers,
              advancedOptions: { ...DEFAULT_ADVANCED },
            });

            const parsed = yaml.load(yamlStr) as GHAWorkflow;

            // Top-level structure
            expect(parsed.name).toBeDefined();
            expect(parsed.on).toBeDefined();
            expect(parsed.jobs).toBeDefined();

            // Every job has runs-on and non-empty steps
            for (const [jobId, job] of Object.entries(parsed.jobs)) {
              expect(job["runs-on"]).toBeDefined();
              expect(job.steps.length).toBeGreaterThan(0);

              // Every step has uses XOR run
              for (const step of job.steps) {
                const hasUses =
                  typeof step.uses === "string" && step.uses.length > 0;
                const hasRun =
                  typeof step.run === "string" && step.run.length > 0;
                expect(hasUses || hasRun).toBe(true);
                expect(hasUses && hasRun).toBe(false);
              }

              // needs references must be valid
              if (job.needs) {
                const deps = Array.isArray(job.needs) ? job.needs : [job.needs];
                const jobNames = Object.keys(parsed.jobs);
                for (const dep of deps) {
                  expect(jobNames).toContain(dep);
                }
              }
            }

            // No yarn references
            expect(yamlStr).not.toContain("yarn");
          });
        }
      }
    }
  }
});

// ─── 8. Caching disabled: no cache steps for either package manager ─────────

describe("caching disabled: no cache steps regardless of package manager", () => {
  for (const pkgMgr of ["yarn", "npm"] as const) {
    it(`${pkgMgr}: no cache steps when caching=false`, () => {
      const yamlStr = generateWorkflowYaml(
        makeForm({
          packageManager: pkgMgr,
          tests: ["typescript"],
          advancedOptions: { ...DEFAULT_ADVANCED, caching: false },
        }),
      );
      const wf = parse(yamlStr);
      const allSteps = Object.values(wf.jobs).flatMap((j) => j.steps);

      const cacheSteps = allSteps.filter(
        (s) =>
          s.uses?.includes("actions/cache") &&
          !s.with?.path?.toString().includes(".eas-build-local"),
      );
      // Should have no package manager cache steps (EAS cache is separate and OK)
      const pkgCacheSteps = cacheSteps.filter(
        (s) =>
          s.name?.includes("Setup yarn cache") ||
          s.name?.includes("Setup npm cache"),
      );
      expect(pkgCacheSteps.length).toBe(0);

      // No cache directory path steps
      const dirSteps = allSteps.filter((s) =>
        s.name?.includes("cache directory path"),
      );
      expect(dirSteps.length).toBe(0);
    });
  }
});

// ─── 9. Snapshot: npm full config ───────────────────────────────────────────
//
// Captures the complete output for visual review / regression detection.

describe("npm snapshots", () => {
  it("matches snapshot for npm full config", () => {
    const yamlStr = generateWorkflowYaml({
      packageManager: "npm",
      storageType: "github-release",
      buildTypes: ["dev", "prod-apk", "prod-aab"],
      tests: ["typescript", "eslint", "prettier"],
      triggers: ["push-main", "pull-request", "manual"],
      advancedOptions: {
        ...DEFAULT_ADVANCED,
        caching: true,
        jestTests: true,
        rntlTests: true,
        renderHookTests: true,
      },
    });
    expect(yamlStr).toMatchSnapshot();
  });

  it("matches snapshot for npm minimal config (no tests, no caching)", () => {
    const yamlStr = generateWorkflowYaml({
      packageManager: "npm",
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED, caching: false },
    });
    expect(yamlStr).toMatchSnapshot();
  });
});
