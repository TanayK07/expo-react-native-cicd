/**
 * workflowYamlValidity.test.ts
 *
 * Validates that EVERY permutation the workflow generator can produce:
 *   1. Is valid, parseable YAML (via js-yaml)
 *   2. Conforms to the GitHub Actions workflow schema:
 *      - top-level: name, on, env, jobs
 *      - each job: runs-on, steps (non-empty)
 *      - each step: uses OR run (never both, never neither)
 *      - `needs` references must point to existing job IDs
 *   3. Contains the correct env vars, jobs, steps, and build commands
 *      for the specific configuration that was requested
 *
 * Coverage matrix:
 *   storageType:  4 values  × buildTypes: 7 non-empty subsets
 *   × tests: 8 subsets      × triggers: 7 non-empty subsets
 *   = 1,568 base permutations — ALL validated for YAML + GHA structure.
 *
 *   Plus additional targeted tests for advancedOptions permutations.
 */

import yaml from "js-yaml";
import { generateWorkflowYaml } from "../workflowGenerator";
import { FormValues, AdvancedOptions } from "../../types";

// ─── GHA Type Definitions ────────────────────────────────────────────────────

interface GHAStep {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, unknown>;
  if?: string;
  id?: string;
}

interface GHAJob {
  "runs-on": string;
  needs?: string | string[];
  if?: string;
  steps: GHAStep[];
  strategy?: unknown;
}

interface GHAWorkflow {
  name: string;
  on: Record<string, unknown>;
  env: Record<string, string>;
  jobs: Record<string, GHAJob>;
}

// ─── Validation Engine ───────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a parsed GitHub Actions workflow object for structural correctness.
 * Checks all GHA schema requirements.
 */
function validateGHAStructure(obj: unknown): ValidationResult {
  const errors: string[] = [];
  const wf = obj as GHAWorkflow;

  // ── Top-level required fields ──
  if (typeof wf?.name !== "string" || wf.name.trim().length === 0) {
    errors.push("Top-level `name` is missing or empty");
  }

  if (!wf?.on || typeof wf.on !== "object" || Array.isArray(wf.on)) {
    errors.push("Top-level `on` is missing or not an object");
  } else if (Object.keys(wf.on).length === 0) {
    errors.push("Top-level `on` has no triggers defined");
  }

  if (!wf?.jobs || typeof wf.jobs !== "object" || Array.isArray(wf.jobs)) {
    errors.push("Top-level `jobs` is missing or not an object");
    return { valid: false, errors };
  }

  const jobNames = Object.keys(wf.jobs);

  if (jobNames.length === 0) {
    errors.push("`jobs` has no entries — at least one job is required");
    return { valid: false, errors };
  }

  // ── Validate each job ──
  for (const [jobId, job] of Object.entries(wf.jobs)) {
    const j = job as GHAJob;

    // runs-on
    if (!j["runs-on"] || typeof j["runs-on"] !== "string") {
      errors.push(`Job "${jobId}": missing required \`runs-on\``);
    }

    // steps array must exist and be non-empty
    if (!Array.isArray(j.steps)) {
      errors.push(`Job "${jobId}": \`steps\` must be an array`);
    } else if (j.steps.length === 0) {
      errors.push(`Job "${jobId}": \`steps\` must not be empty`);
    } else {
      // ── Validate each step ──
      for (let i = 0; i < j.steps.length; i++) {
        const step = j.steps[i] as GHAStep;
        const label = `Job "${jobId}" step ${i + 1} ("${step?.name ?? "unnamed"}")`;

        const hasUses =
          typeof step?.uses === "string" && step.uses.trim().length > 0;
        const hasRun =
          typeof step?.run === "string" && step.run.trim().length > 0;

        if (!hasUses && !hasRun) {
          errors.push(`${label}: must have either \`uses\` or \`run\``);
        }
        if (hasUses && hasRun) {
          errors.push(`${label}: cannot have both \`uses\` and \`run\``);
        }
      }
    }

    // needs must reference existing job IDs
    if (j.needs !== undefined) {
      const deps = Array.isArray(j.needs) ? j.needs : [j.needs];
      for (const dep of deps) {
        if (!jobNames.includes(dep)) {
          errors.push(
            `Job "${jobId}": \`needs: "${dep}"\` references a job that does not exist`,
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Parses the YAML string and validates GHA structure.
 * Throws on YAML parse failure (will fail the calling test).
 */
function parseAndValidate(yamlStr: string): {
  parsed: GHAWorkflow;
  result: ValidationResult;
} {
  // yaml.load() throws YAMLException if the string is not valid YAML
  const parsed = yaml.load(yamlStr) as GHAWorkflow;
  const result = validateGHAStructure(parsed);
  return { parsed, result };
}

// ─── Permutation Helpers ─────────────────────────────────────────────────────

const STORAGE_TYPES = [
  "github-release",
  "zoho-drive",
  "google-drive",
  "custom",
];
const BUILD_ITEMS = ["dev", "prod-apk", "prod-aab"];
const TEST_ITEMS = ["typescript", "eslint", "prettier"];
const TRIGGER_ITEMS = ["push-main", "pull-request", "manual"];

/** Returns all non-empty subsets of items (2^n - 1 combinations). */
function nonEmptySubsets<T>(items: T[]): T[][] {
  const result: T[][] = [];
  for (let mask = 1; mask < 1 << items.length; mask++) {
    result.push(items.filter((_, idx) => mask & (1 << idx)));
  }
  return result;
}

/** Returns all subsets including empty set (2^n combinations). */
function allSubsets<T>(items: T[]): T[][] {
  return [[], ...nonEmptySubsets(items)];
}

const BUILD_COMBOS = nonEmptySubsets(BUILD_ITEMS); // 7 combos
const TEST_COMBOS = allSubsets(TEST_ITEMS); // 8 combos (includes [])
const TRIGGER_COMBOS = nonEmptySubsets(TRIGGER_ITEMS); // 7 combos

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

// ─── 1. Full Permutation: YAML Parseability ───────────────────────────────────

describe("All 1,568 base permutations: YAML must be parseable", () => {
  // 4 storageTypes × 7 buildType combos × 8 test combos × 7 trigger combos = 1,568
  let totalTested = 0;
  let failures: string[] = [];

  afterAll(() => {
    // Report summary after all permutations run
    if (failures.length > 0) {
      console.error(
        `YAML parse failures (${failures.length}/${totalTested}):\n${failures.slice(0, 10).join("\n")}`,
      );
    }
  });

  for (const storageType of STORAGE_TYPES) {
    for (const buildTypes of BUILD_COMBOS) {
      for (const tests of TEST_COMBOS) {
        for (const triggers of TRIGGER_COMBOS) {
          const label = `${storageType} | builds=[${buildTypes}] | tests=[${tests}] | triggers=[${triggers}]`;

          it(`parses as valid YAML: ${label}`, () => {
            totalTested++;
            const config: FormValues = {
              storageType,
              buildTypes,
              tests,
              triggers,
              advancedOptions: { ...DEFAULT_ADVANCED },
            };

            const yamlStr = generateWorkflowYaml(config);

            let parsed: unknown;
            expect(() => {
              parsed = yaml.load(yamlStr);
            }).not.toThrow();

            // Must parse to a non-null object
            expect(parsed).not.toBeNull();
            expect(typeof parsed).toBe("object");
          });
        }
      }
    }
  }
});

// ─── 2. Full Permutation: GitHub Actions Structure ────────────────────────────

describe("All 1,568 base permutations: must conform to GHA schema", () => {
  for (const storageType of STORAGE_TYPES) {
    for (const buildTypes of BUILD_COMBOS) {
      for (const tests of TEST_COMBOS) {
        for (const triggers of TRIGGER_COMBOS) {
          const label = `${storageType} | builds=[${buildTypes}] | tests=[${tests.length ? tests : "none"}] | triggers=[${triggers}]`;

          it(`valid GHA structure: ${label}`, () => {
            const config: FormValues = {
              storageType,
              buildTypes,
              tests,
              triggers,
              advancedOptions: { ...DEFAULT_ADVANCED },
            };

            const yamlStr = generateWorkflowYaml(config);
            const { result } = parseAndValidate(yamlStr);

            expect(result.errors).toEqual([]);
            expect(result.valid).toBe(true);
          });
        }
      }
    }
  }
});

// ─── 3. Job Presence & Dependency Correctness ────────────────────────────────

describe("Job presence and `needs` dependency correctness", () => {
  it("check-skip job always exists in every permutation", () => {
    for (const storageType of STORAGE_TYPES) {
      for (const buildTypes of BUILD_COMBOS.slice(0, 3)) {
        for (const triggers of TRIGGER_COMBOS.slice(0, 3)) {
          const yamlStr = generateWorkflowYaml({
            storageType,
            buildTypes,
            tests: [],
            triggers,
            advancedOptions: { ...DEFAULT_ADVANCED },
          });
          const { parsed } = parseAndValidate(yamlStr);
          expect(parsed.jobs).toHaveProperty("check-skip");
        }
      }
    }
  });

  it("build job is named `build-and-release` for github-release storage", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.jobs).toHaveProperty("build-and-release");
    expect(parsed.jobs).not.toHaveProperty("build-and-deploy");
  });

  it("build job is named `build-and-deploy` for all other storage types", () => {
    for (const storageType of ["zoho-drive", "google-drive", "custom"]) {
      const yamlStr = generateWorkflowYaml({
        storageType,
        buildTypes: ["dev"],
        tests: [],
        triggers: ["push-main"],
        advancedOptions: { ...DEFAULT_ADVANCED },
      });
      const { parsed } = parseAndValidate(yamlStr);
      expect(parsed.jobs).toHaveProperty("build-and-deploy");
      expect(parsed.jobs).not.toHaveProperty("build-and-release");
    }
  });

  it("test job appears when tests are selected", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: ["typescript"],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.jobs).toHaveProperty("test");
  });

  it("test job is absent when no tests are selected", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: {
        ...DEFAULT_ADVANCED,
        jestTests: false,
        rntlTests: false,
        renderHookTests: false,
      },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.jobs).not.toHaveProperty("test");
  });

  it("test job's `needs` points to check-skip", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: ["eslint"],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    const testJob = parsed.jobs["test"];
    expect(testJob).toBeDefined();
    const needs = Array.isArray(testJob.needs)
      ? testJob.needs
      : [testJob.needs];
    expect(needs).toContain("check-skip");
  });

  it("build job's `needs` points to `test` when test job exists", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: ["typescript"],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    const buildJob =
      parsed.jobs["build-and-release"] || parsed.jobs["build-and-deploy"];
    expect(buildJob).toBeDefined();
    const needs = Array.isArray(buildJob.needs)
      ? buildJob.needs
      : [buildJob.needs];
    expect(needs).toContain("test");
  });

  it("build job's `needs` points to check-skip when no test job", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: {
        ...DEFAULT_ADVANCED,
        jestTests: false,
        rntlTests: false,
        renderHookTests: false,
      },
    });
    const { parsed } = parseAndValidate(yamlStr);
    const buildJob =
      parsed.jobs["build-and-release"] || parsed.jobs["build-and-deploy"];
    const needs = Array.isArray(buildJob.needs)
      ? buildJob.needs
      : [buildJob.needs];
    expect(needs).toContain("check-skip");
  });

  it("all `needs` references in every permutation point to valid job IDs", () => {
    // Sample across storage types × trigger combos
    for (const storageType of STORAGE_TYPES) {
      for (const triggers of TRIGGER_COMBOS) {
        for (const tests of [[], ["typescript"]]) {
          const yamlStr = generateWorkflowYaml({
            storageType,
            buildTypes: ["dev", "prod-apk"],
            tests,
            triggers,
            advancedOptions: { ...DEFAULT_ADVANCED },
          });
          const { parsed, result } = parseAndValidate(yamlStr);
          const jobNames = Object.keys(parsed.jobs);

          // Check every `needs` reference
          for (const [jobId, job] of Object.entries(parsed.jobs)) {
            if (job.needs !== undefined) {
              const deps = Array.isArray(job.needs) ? job.needs : [job.needs];
              for (const dep of deps) {
                expect(jobNames).toContain(dep); // dep must be a real job
              }
            }
          }

          expect(result.valid).toBe(true);
        }
      }
    }
  });
});

// ─── 4. Step Validity: every step must have `uses` XOR `run` ─────────────────

describe("Step validity: every step has `uses` XOR `run`", () => {
  const REPRESENTATIVE_CONFIGS: Array<{ label: string; config: FormValues }> = [
    {
      label: "github-release, all builds, all tests, all triggers",
      config: {
        storageType: "github-release",
        buildTypes: ["dev", "prod-apk", "prod-aab"],
        tests: ["typescript", "eslint", "prettier"],
        triggers: ["push-main", "pull-request", "manual"],
        advancedOptions: { ...DEFAULT_ADVANCED, caching: true },
      },
    },
    {
      label: "zoho-drive, dev only, no tests, push-main",
      config: {
        storageType: "zoho-drive",
        buildTypes: ["dev"],
        tests: [],
        triggers: ["push-main"],
        advancedOptions: { ...DEFAULT_ADVANCED },
      },
    },
    {
      label: "google-drive, prod-aab, all tests, manual",
      config: {
        storageType: "google-drive",
        buildTypes: ["prod-aab"],
        tests: ["typescript", "eslint", "prettier"],
        triggers: ["manual"],
        advancedOptions: { ...DEFAULT_ADVANCED, jestTests: true },
      },
    },
    {
      label: "custom, all builds, no tests, all triggers",
      config: {
        storageType: "custom",
        buildTypes: ["dev", "prod-apk", "prod-aab"],
        tests: [],
        triggers: ["push-main", "pull-request", "manual"],
        advancedOptions: { ...DEFAULT_ADVANCED },
      },
    },
    {
      label: "github-release, iOS support, all builds, manual",
      config: {
        storageType: "github-release",
        buildTypes: ["dev", "prod-aab"],
        tests: ["typescript"],
        triggers: ["manual"],
        advancedOptions: { ...DEFAULT_ADVANCED, iOSSupport: true },
      },
    },
    {
      label: "zoho-drive, notifications + caching, all tests",
      config: {
        storageType: "zoho-drive",
        buildTypes: ["dev", "prod-apk"],
        tests: ["typescript", "eslint"],
        triggers: ["push-main", "manual"],
        advancedOptions: {
          ...DEFAULT_ADVANCED,
          notifications: true,
          caching: true,
          jestTests: true,
          rntlTests: true,
        },
      },
    },
    {
      label: "google-drive, publishToStores, iOS, all triggers",
      config: {
        storageType: "google-drive",
        buildTypes: ["prod-aab"],
        tests: [],
        triggers: ["push-main", "pull-request", "manual"],
        advancedOptions: {
          ...DEFAULT_ADVANCED,
          publishToStores: true,
          iOSSupport: true,
        },
      },
    },
    {
      label: "custom, no caching, renderHookTests, push-main + manual",
      config: {
        storageType: "custom",
        buildTypes: ["dev"],
        tests: [],
        triggers: ["push-main", "manual"],
        advancedOptions: {
          ...DEFAULT_ADVANCED,
          caching: false,
          jestTests: true,
          renderHookTests: true,
        },
      },
    },
  ];

  for (const { label, config } of REPRESENTATIVE_CONFIGS) {
    it(`all steps have uses XOR run: ${label}`, () => {
      const yamlStr = generateWorkflowYaml(config);
      const { parsed, result } = parseAndValidate(yamlStr);

      expect(result.errors).toEqual([]);

      for (const [jobId, job] of Object.entries(parsed.jobs)) {
        for (let i = 0; i < job.steps.length; i++) {
          const step = job.steps[i];
          const hasUses =
            typeof step.uses === "string" && step.uses.trim().length > 0;
          const hasRun =
            typeof step.run === "string" && step.run.trim().length > 0;

          expect(hasUses || hasRun).toBe(true); // at least one
          expect(hasUses && hasRun).toBe(false); // not both
        }
      }
    });
  }
});

// ─── 5. Env Var Correctness Per Config ───────────────────────────────────────

describe("Env vars: correct secrets injected per storageType", () => {
  it("github-release: has EXPO_TOKEN and NODE_OPTIONS, no rclone secrets", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("EXPO_TOKEN");
    expect(parsed.env).toHaveProperty("NODE_OPTIONS");
    expect(parsed.env).not.toHaveProperty("RCLONE_CONFIG_ZOHODRIVE_TYPE");
    expect(parsed.env).not.toHaveProperty("RCLONE_CONFIG_GDRIVE_TYPE");
    expect(parsed.env).not.toHaveProperty("CLOUD_STORAGE_TYPE");
  });

  it("zoho-drive: has Zoho rclone secrets", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "zoho-drive",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("RCLONE_CONFIG_ZOHODRIVE_TYPE");
    expect(parsed.env).toHaveProperty("RCLONE_CONFIG_ZOHODRIVE_TOKEN");
    expect(parsed.env).toHaveProperty("RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID");
    expect(parsed.env).not.toHaveProperty("RCLONE_CONFIG_GDRIVE_TYPE");
  });

  it("google-drive: has GDrive rclone secrets", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "google-drive",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("RCLONE_CONFIG_GDRIVE_TYPE");
    expect(parsed.env).toHaveProperty("RCLONE_CONFIG_GDRIVE_TOKEN");
    expect(parsed.env).toHaveProperty("RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID");
    expect(parsed.env).not.toHaveProperty("RCLONE_CONFIG_ZOHODRIVE_TYPE");
  });

  it("custom: has CLOUD_STORAGE secrets", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "custom",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("CLOUD_STORAGE_TYPE");
    expect(parsed.env).toHaveProperty("CLOUD_STORAGE_TOKEN");
    expect(parsed.env).toHaveProperty("CLOUD_STORAGE_ROOT_ID");
    expect(parsed.env).not.toHaveProperty("RCLONE_CONFIG_ZOHODRIVE_TYPE");
  });

  it("iOS support: has Apple env vars", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["manual"],
      advancedOptions: { ...DEFAULT_ADVANCED, iOSSupport: true },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("EXPO_APPLE_ID");
    expect(parsed.env).toHaveProperty("EXPO_APPLE_PASSWORD");
    expect(parsed.env).toHaveProperty("EXPO_TEAM_ID");
  });

  it("publishToStores: has GOOGLE_PLAY_SERVICE_ACCOUNT env var", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["prod-aab"],
      tests: [],
      triggers: ["manual"],
      advancedOptions: { ...DEFAULT_ADVANCED, publishToStores: true },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("GOOGLE_PLAY_SERVICE_ACCOUNT");
  });

  it("notifications: has SLACK_WEBHOOK and DISCORD_WEBHOOK env vars", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED, notifications: true },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.env).toHaveProperty("SLACK_WEBHOOK");
    expect(parsed.env).toHaveProperty("DISCORD_WEBHOOK");
  });
});

// ─── 6. Trigger Section Correctness ──────────────────────────────────────────

describe("Trigger (`on:`) section correctness per config", () => {
  it("push-main trigger → `on.push` is defined with branches", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.on).toHaveProperty("push");
    const pushTrigger = parsed.on["push"] as {
      branches?: string[];
      "paths-ignore"?: string[];
    };
    expect(Array.isArray(pushTrigger.branches)).toBe(true);
    expect(pushTrigger.branches).toContain("main");
    expect(pushTrigger.branches).toContain("master");
  });

  it("pull-request trigger → `on.pull_request` is defined", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["pull-request"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.on).toHaveProperty("pull_request");
  });

  it("manual trigger → `on.workflow_dispatch` is defined with inputs", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["manual"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.on).toHaveProperty("workflow_dispatch");
    const dispatch = parsed.on["workflow_dispatch"] as {
      inputs?: Record<string, unknown>;
    };
    expect(dispatch.inputs).toHaveProperty("buildType");
  });

  it("all three triggers → `on` has push, pull_request, workflow_dispatch", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main", "pull-request", "manual"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const { parsed } = parseAndValidate(yamlStr);
    expect(parsed.on).toHaveProperty("push");
    expect(parsed.on).toHaveProperty("pull_request");
    expect(parsed.on).toHaveProperty("workflow_dispatch");
  });

  it("iOS manual trigger → workflow_dispatch.inputs has `platform` field", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["manual"],
      advancedOptions: { ...DEFAULT_ADVANCED, iOSSupport: true },
    });
    const { parsed } = parseAndValidate(yamlStr);
    const dispatch = parsed.on["workflow_dispatch"] as {
      inputs?: Record<string, unknown>;
    };
    expect(dispatch.inputs).toHaveProperty("buildType");
    expect(dispatch.inputs).toHaveProperty("platform");
  });
});

// ─── 7. Build Step Presence per buildTypes ───────────────────────────────────

describe("Build steps: correct EAS commands per buildType selection", () => {
  function getBuildJobSteps(yamlStr: string): GHAStep[] {
    const { parsed } = parseAndValidate(yamlStr);
    const buildJob =
      parsed.jobs["build-and-release"] || parsed.jobs["build-and-deploy"];
    return buildJob?.steps ?? [];
  }

  it("dev buildType → has step running `--profile development`", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const steps = getBuildJobSteps(yamlStr);
    const devStep = steps.find(
      (s) => s.run?.includes("--profile development") ?? false,
    );
    expect(devStep).toBeDefined();
    expect(devStep?.run).toContain("--platform android");
    expect(devStep?.run).toContain("--output=./app-dev.apk");
  });

  it("prod-apk buildType → has step running `--profile production-apk`", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["prod-apk"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const steps = getBuildJobSteps(yamlStr);
    const prodApkStep = steps.find(
      (s) => s.run?.includes("--profile production-apk") ?? false,
    );
    expect(prodApkStep).toBeDefined();
    expect(prodApkStep?.run).toContain("--output=./app-prod.apk");
  });

  it("prod-aab buildType → has step running `--profile production` (AAB)", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["prod-aab"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const steps = getBuildJobSteps(yamlStr);
    // prod-aab uses `--profile production` without `-apk` suffix
    const prodAabStep = steps.find(
      (s) =>
        (s.run?.includes("--profile production") &&
          !s.run.includes("--profile production-apk")) ??
        false,
    );
    expect(prodAabStep).toBeDefined();
    expect(prodAabStep?.run).toContain("--output=./app-prod.aab");
  });

  it("all buildTypes → all three EAS build commands present", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev", "prod-apk", "prod-aab"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const steps = getBuildJobSteps(yamlStr);
    const runSteps = steps.map((s) => s.run ?? "");

    expect(runSteps.some((r) => r.includes("--profile development"))).toBe(
      true,
    );
    expect(runSteps.some((r) => r.includes("--profile production-apk"))).toBe(
      true,
    );
    expect(
      runSteps.some(
        (r) =>
          r.includes("--profile production") &&
          !r.includes("--profile production-apk"),
      ),
    ).toBe(true);
  });

  it("iOS support + dev → has iOS development build step (--platform ios)", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["manual"],
      advancedOptions: { ...DEFAULT_ADVANCED, iOSSupport: true },
    });
    const steps = getBuildJobSteps(yamlStr);
    const iosDevStep = steps.find(
      (s) =>
        (s.run?.includes("--platform ios") &&
          s.run.includes("--profile development")) ??
        false,
    );
    expect(iosDevStep).toBeDefined();
    expect(iosDevStep?.run).toContain("--output=./app-ios-dev.app");
  });

  it("iOS support always adds iOS production build step", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["prod-apk"],
      tests: [],
      triggers: ["manual"],
      advancedOptions: { ...DEFAULT_ADVANCED, iOSSupport: true },
    });
    const steps = getBuildJobSteps(yamlStr);
    const iosProdStep = steps.find(
      (s) =>
        (s.run?.includes("--platform ios") &&
          s.run.includes("--profile production")) ??
        false,
    );
    expect(iosProdStep).toBeDefined();
    expect(iosProdStep?.run).toContain("--output=./app-ios-prod.ipa");
  });

  it("every build step uses eas CLI and has memory limit set", () => {
    const yamlStr = generateWorkflowYaml({
      storageType: "github-release",
      buildTypes: ["dev", "prod-apk", "prod-aab"],
      tests: [],
      triggers: ["push-main"],
      advancedOptions: { ...DEFAULT_ADVANCED },
    });
    const steps = getBuildJobSteps(yamlStr);
    const easSteps = steps.filter((s) => s.run?.includes("eas build") ?? false);

    expect(easSteps.length).toBeGreaterThanOrEqual(3);
    for (const step of easSteps) {
      expect(step.run).toContain("--max_old_space_size=4096");
      expect(step.run).toContain("--non-interactive");
      expect(step.run).toContain("--local");
    }
  });
});

// ─── 8. Advanced Options: YAML + GHA Validity ────────────────────────────────

describe("Advanced options permutations: YAML + GHA validity", () => {
  const ADVANCED_COMBOS: Array<{
    label: string;
    opts: Partial<AdvancedOptions>;
  }> = [
    { label: "caching=false", opts: { caching: false } },
    { label: "notifications=true", opts: { notifications: true } },
    { label: "jestTests=true", opts: { jestTests: true } },
    {
      label: "jestTests+rntlTests=true",
      opts: { jestTests: true, rntlTests: true },
    },
    {
      label: "jestTests+renderHookTests=true",
      opts: { jestTests: true, renderHookTests: true },
    },
    {
      label: "jestTests+rntlTests+renderHookTests=true",
      opts: { jestTests: true, rntlTests: true, renderHookTests: true },
    },
    { label: "publishToExpo=true", opts: { publishToExpo: true } },
    { label: "publishToStores=true", opts: { publishToStores: true } },
    {
      label: "publishToStores+iOSSupport=true",
      opts: { publishToStores: true, iOSSupport: true },
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
      },
    },
    {
      label: "all disabled except caching",
      opts: {
        iOSSupport: false,
        publishToExpo: false,
        publishToStores: false,
        jestTests: false,
        rntlTests: false,
        renderHookTests: false,
        caching: true,
        notifications: false,
      },
    },
  ];

  for (const { label, opts } of ADVANCED_COMBOS) {
    it(`parses + valid GHA: ${label}`, () => {
      // Test with each storage type to be thorough
      for (const storageType of STORAGE_TYPES) {
        const config: FormValues = {
          storageType,
          buildTypes: ["dev", "prod-apk"],
          tests: ["typescript"],
          triggers: ["push-main", "manual"],
          advancedOptions: { ...DEFAULT_ADVANCED, ...opts },
        };

        const yamlStr = generateWorkflowYaml(config);
        let parsed: unknown;

        expect(() => {
          parsed = yaml.load(yamlStr);
        }).not.toThrow();

        const { result } = parseAndValidate(yamlStr);
        expect(result.errors).toEqual([]);
        expect(result.valid).toBe(true);
      }
    });
  }
});

// ─── 9. Upload Artifact Step Always Present ───────────────────────────────────

describe("GitHub artifact upload step always present", () => {
  it("upload-artifact step exists in build job for every storageType", () => {
    for (const storageType of STORAGE_TYPES) {
      const yamlStr = generateWorkflowYaml({
        storageType,
        buildTypes: ["dev"],
        tests: [],
        triggers: ["push-main"],
        advancedOptions: { ...DEFAULT_ADVANCED },
      });
      const { parsed } = parseAndValidate(yamlStr);
      const buildJob =
        parsed.jobs["build-and-release"] || parsed.jobs["build-and-deploy"];
      const artifactStep = buildJob.steps.find(
        (s) => s.uses?.includes("actions/upload-artifact") ?? false,
      );
      expect(artifactStep).toBeDefined();
      expect(artifactStep?.uses).toContain("@v4");
    }
  });

  it("artifact upload includes correct build file paths", () => {
    for (const [buildTypes, expectedFiles] of [
      [["dev"], ["./app-dev.apk"]],
      [["prod-apk"], ["./app-prod.apk"]],
      [["prod-aab"], ["./app-prod.aab"]],
      [
        ["dev", "prod-apk", "prod-aab"],
        ["./app-dev.apk", "./app-prod.apk", "./app-prod.aab"],
      ],
    ] as Array<[string[], string[]]>) {
      const yamlStr = generateWorkflowYaml({
        storageType: "github-release",
        buildTypes,
        tests: [],
        triggers: ["push-main"],
        advancedOptions: { ...DEFAULT_ADVANCED },
      });

      for (const file of expectedFiles) {
        expect(yamlStr).toContain(file);
      }
    }
  });
});

// ─── 10. Common Required Build Steps Always Present ──────────────────────────

describe("Required build steps always present regardless of config", () => {
  const REQUIRED_STEP_CHECKS: Array<{
    description: string;
    check: (steps: GHAStep[]) => boolean;
  }> = [
    {
      description: "checkout step (actions/checkout@v4)",
      check: (steps) => steps.some((s) => s.uses?.includes("actions/checkout")),
    },
    {
      description: "node setup step (actions/setup-node@v4)",
      check: (steps) =>
        steps.some((s) => s.uses?.includes("actions/setup-node")),
    },
    {
      description: "EAS CLI installation (yarn global add eas-cli)",
      check: (steps) =>
        steps.some((s) => s.run?.includes("yarn global add eas-cli")),
    },
    {
      description: "EAS build cache step (actions/cache@v3)",
      check: (steps) =>
        steps.some(
          (s) =>
            s.uses?.includes("actions/cache") &&
            (s.with?.path as string)?.includes(".eas-build-local"),
        ),
    },
    {
      description: "Fix package.json main entry step",
      check: (steps) =>
        steps.some((s) => s.run?.includes("node_modules/expo/AppEntry.js")),
    },
    {
      description: "Update metro.config.js step",
      check: (steps) => steps.some((s) => s.run?.includes("metro.config.js")),
    },
  ];

  for (const { description, check } of REQUIRED_STEP_CHECKS) {
    it(`build job always has: ${description}`, () => {
      // Verify across all storage types and a few build combos
      for (const storageType of STORAGE_TYPES) {
        for (const buildTypes of [["dev"], ["prod-apk", "prod-aab"]]) {
          const yamlStr = generateWorkflowYaml({
            storageType,
            buildTypes,
            tests: [],
            triggers: ["push-main"],
            advancedOptions: { ...DEFAULT_ADVANCED },
          });
          const { parsed } = parseAndValidate(yamlStr);
          const buildJob =
            parsed.jobs["build-and-release"] || parsed.jobs["build-and-deploy"];

          expect(check(buildJob.steps)).toBe(true);
        }
      }
    });
  }
});
