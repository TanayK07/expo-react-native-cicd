#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";
import { FormValues, commandSignature } from "./command-extractor";

export interface MatrixEntry {
  name: string;
  config: FormValues;
  fixture: "yarn-app" | "npm-app";
}

/**
 * Build a base FormValues config with defaults.
 */
function baseConfig(overrides: Partial<FormValues>): FormValues {
  return {
    storageType: "github-release",
    buildTypes: ["dev"],
    tests: [],
    triggers: ["push-main"],
    packageManager: "yarn",
    advancedOptions: {
      iOSSupport: false,
      publishToExpo: false,
      publishToStores: false,
      jestTests: false,
      rntlTests: false,
      renderHookTests: false,
      caching: true,
      notifications: false,
    },
    ...overrides,
  };
}

function fixtureForPkgMgr(
  pkgMgr: "yarn" | "npm" | undefined
): "yarn-app" | "npm-app" {
  return pkgMgr === "npm" ? "npm-app" : "yarn-app";
}

/**
 * Generate the 15 hand-picked PR matrix configs.
 */
export function generatePrMatrix(): MatrixEntry[] {
  const entries: MatrixEntry[] = [
    // 1. npm + no tests (bare install)
    {
      name: "npm-no-tests",
      config: baseConfig({ packageManager: "npm", tests: [] }),
      fixture: "npm-app",
    },
    // 2. yarn + no tests
    {
      name: "yarn-no-tests",
      config: baseConfig({ packageManager: "yarn", tests: [] }),
      fixture: "yarn-app",
    },
    // 3. npm + typescript only
    {
      name: "npm-typescript-only",
      config: baseConfig({ packageManager: "npm", tests: ["typescript"] }),
      fixture: "npm-app",
    },
    // 4. yarn + typescript only
    {
      name: "yarn-typescript-only",
      config: baseConfig({ packageManager: "yarn", tests: ["typescript"] }),
      fixture: "yarn-app",
    },
    // 5. npm + all static tests (ts + eslint + prettier)
    {
      name: "npm-all-static",
      config: baseConfig({
        packageManager: "npm",
        tests: ["typescript", "eslint", "prettier"],
      }),
      fixture: "npm-app",
    },
    // 6. yarn + all static tests
    {
      name: "yarn-all-static",
      config: baseConfig({
        packageManager: "yarn",
        tests: ["typescript", "eslint", "prettier"],
      }),
      fixture: "yarn-app",
    },
    // 7. npm + jest only
    {
      name: "npm-jest-only",
      config: baseConfig({
        packageManager: "npm",
        tests: [],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: false,
          renderHookTests: false,
          caching: true,
          notifications: false,
        },
      }),
      fixture: "npm-app",
    },
    // 8. yarn + jest only
    {
      name: "yarn-jest-only",
      config: baseConfig({
        packageManager: "yarn",
        tests: [],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: false,
          renderHookTests: false,
          caching: true,
          notifications: false,
        },
      }),
      fixture: "yarn-app",
    },
    // 9. npm + all tests (static + jest + rntl + hooks)
    {
      name: "npm-all-tests",
      config: baseConfig({
        packageManager: "npm",
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      }),
      fixture: "npm-app",
    },
    // 10. yarn + all tests
    {
      name: "yarn-all-tests",
      config: baseConfig({
        packageManager: "yarn",
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      }),
      fixture: "yarn-app",
    },
    // 11. npm + caching disabled
    {
      name: "npm-no-caching",
      config: baseConfig({
        packageManager: "npm",
        tests: ["typescript", "eslint"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: false,
          renderHookTests: false,
          caching: false,
          notifications: false,
        },
      }),
      fixture: "npm-app",
    },
    // 12. yarn + caching disabled
    {
      name: "yarn-no-caching",
      config: baseConfig({
        packageManager: "yarn",
        tests: ["typescript", "eslint"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: false,
          renderHookTests: false,
          caching: false,
          notifications: false,
        },
      }),
      fixture: "yarn-app",
    },
    // 13. npm + eslint only
    {
      name: "npm-eslint-only",
      config: baseConfig({ packageManager: "npm", tests: ["eslint"] }),
      fixture: "npm-app",
    },
    // 14. npm + rntl + hooks (no jest standalone)
    {
      name: "npm-rntl-hooks",
      config: baseConfig({
        packageManager: "npm",
        tests: [],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: false,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      }),
      fixture: "npm-app",
    },
    // 15. yarn + prettier only
    {
      name: "yarn-prettier-only",
      config: baseConfig({ packageManager: "yarn", tests: ["prettier"] }),
      fixture: "yarn-app",
    },
  ];

  return entries;
}

/**
 * All test subsets: each combination of [typescript, eslint, prettier].
 */
function allTestSubsets(): string[][] {
  const items = ["typescript", "eslint", "prettier"];
  const subsets: string[][] = [[]];
  for (const item of items) {
    const current = subsets.slice();
    for (const subset of current) {
      subsets.push([...subset, item]);
    }
  }
  return subsets; // 8 subsets including empty
}

/**
 * All combinations of jest/rntl/hooks options.
 */
function allJestCombinations(): {
  jestTests: boolean;
  rntlTests: boolean;
  renderHookTests: boolean;
}[] {
  const combos: {
    jestTests: boolean;
    rntlTests: boolean;
    renderHookTests: boolean;
  }[] = [];
  for (const j of [false, true]) {
    for (const r of [false, true]) {
      for (const h of [false, true]) {
        combos.push({ jestTests: j, rntlTests: r, renderHookTests: h });
      }
    }
  }
  return combos; // 8 combos
}

/**
 * Generate the full nightly matrix, deduplicated by command signature.
 */
export function generateNightlyMatrix(): MatrixEntry[] {
  const packageManagers: ("yarn" | "npm")[] = ["yarn", "npm"];
  const testSubsets = allTestSubsets();
  const jestCombos = allJestCombinations();
  const cachingValues = [true, false];

  const seen = new Set<string>();
  const entries: MatrixEntry[] = [];

  for (const pkgMgr of packageManagers) {
    for (const tests of testSubsets) {
      for (const jestCombo of jestCombos) {
        // Only test with caching variants when there ARE tests
        const hasTests =
          tests.length > 0 ||
          jestCombo.jestTests ||
          jestCombo.rntlTests ||
          jestCombo.renderHookTests;

        const cachingOptions = hasTests ? cachingValues : [true];

        for (const caching of cachingOptions) {
          const config = baseConfig({
            packageManager: pkgMgr,
            tests,
            advancedOptions: {
              iOSSupport: false,
              publishToExpo: false,
              publishToStores: false,
              ...jestCombo,
              caching,
              notifications: false,
            },
          });

          const sig = commandSignature(config);

          if (!seen.has(sig)) {
            seen.add(sig);

            const testDesc = [
              ...tests,
              ...(jestCombo.jestTests ? ["jest"] : []),
              ...(jestCombo.rntlTests ? ["rntl"] : []),
              ...(jestCombo.renderHookTests ? ["hooks"] : []),
            ].join("-") || "no-tests";

            const cachingDesc = caching ? "" : "-nocache";
            const name = `${pkgMgr}-${testDesc}${cachingDesc}`;

            entries.push({
              name,
              config,
              fixture: fixtureForPkgMgr(pkgMgr),
            });
          }
        }
      }
    }
  }

  return entries;
}

/**
 * Generate EAS build matrix (2 package managers x 3 profiles).
 */
export function generateEasMatrix(): MatrixEntry[] {
  const packageManagers: ("yarn" | "npm")[] = ["yarn", "npm"];
  const profiles = ["development", "production-apk", "production"];
  const buildTypeMap: Record<string, string[]> = {
    development: ["dev"],
    "production-apk": ["prod-apk"],
    production: ["prod-aab"],
  };

  const entries: MatrixEntry[] = [];

  for (const pkgMgr of packageManagers) {
    for (const profile of profiles) {
      entries.push({
        name: `${pkgMgr}-eas-${profile}`,
        config: baseConfig({
          packageManager: pkgMgr,
          buildTypes: buildTypeMap[profile],
          tests: [],
        }),
        fixture: fixtureForPkgMgr(pkgMgr),
      });
    }
  }

  return entries;
}

// CLI entry point
if (require.main === module) {
  const { Command } = require("commander");
  const program = new Command();

  program
    .name("matrix-generator")
    .description("Generate integration test matrix config files")
    .requiredOption("--mode <mode>", "Matrix mode: pr, nightly, or eas")
    .option(
      "--output-dir <dir>",
      "Output directory",
      path.resolve(__dirname, "..", "configs")
    )
    .parse(process.argv);

  const opts = program.opts();
  const outputDir = path.resolve(opts.outputDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let matrix: MatrixEntry[];
  let filename: string;

  switch (opts.mode) {
    case "pr":
      matrix = generatePrMatrix();
      filename = "pr-matrix.json";
      break;
    case "nightly":
      matrix = generateNightlyMatrix();
      filename = "nightly-matrix.json";
      break;
    case "eas":
      matrix = generateEasMatrix();
      filename = "eas-matrix.json";
      break;
    default:
      console.error(`Unknown mode: ${opts.mode}`);
      process.exit(1);
  }

  const outPath = path.join(outputDir, filename);
  fs.writeFileSync(outPath, JSON.stringify(matrix, null, 2));
  console.log(`Generated ${matrix.length} entries → ${outPath}`);
}
