#!/usr/bin/env ts-node

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import {
  extractTestJobCommands,
  FormValues,
  ExtractedCommand,
} from "./command-extractor";
import { runCommands, printResults, allPassed, CommandResult } from "./integration-runner";

interface CommunityRepo {
  repo: string;
  subdir: string;
  packageManager: "yarn" | "npm";
  sha: string;
  description: string;
}

/**
 * Detect which scripts are available in a package.json.
 */
function detectScripts(packageJsonPath: string): Set<string> {
  if (!fs.existsSync(packageJsonPath)) {
    return new Set();
  }
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return new Set(Object.keys(pkg.scripts || {}));
}

/**
 * Build a FormValues config matching available scripts.
 */
function buildConfigForRepo(
  scripts: Set<string>,
  packageManager: "yarn" | "npm"
): FormValues {
  const tests: string[] = [];
  const advancedOptions = {
    iOSSupport: false,
    publishToExpo: false,
    publishToStores: false,
    jestTests: false,
    rntlTests: false,
    renderHookTests: false,
    caching: true,
    notifications: false,
  };

  // Only add test types that have corresponding scripts
  if (scripts.has("lint")) tests.push("eslint");
  if (scripts.has("format:check")) tests.push("prettier");
  // TypeScript check uses npx tsc / yarn tsc (always available if tsconfig exists)
  // We'll check for tsconfig in the caller

  if (scripts.has("test")) advancedOptions.jestTests = true;
  if (scripts.has("test:rntl")) advancedOptions.rntlTests = true;
  if (scripts.has("test:hooks")) advancedOptions.renderHookTests = true;

  return {
    storageType: "github-release",
    buildTypes: ["dev"],
    tests,
    triggers: ["push-main"],
    packageManager,
    advancedOptions,
  };
}

/**
 * Filter commands to only those whose scripts exist in the repo.
 */
function filterForAvailableScripts(
  commands: ExtractedCommand[],
  scripts: Set<string>,
  repoDir: string
): ExtractedCommand[] {
  return commands.filter((cmd) => {
    // Install commands always work
    if (cmd.category === "install" || cmd.category === "cache-dir") {
      return true;
    }

    // Typecheck needs tsconfig.json
    if (cmd.category === "typecheck") {
      return fs.existsSync(path.join(repoDir, "tsconfig.json"));
    }

    // Script-based commands
    const scriptMap: Record<string, string> = {
      lint: "lint",
      format: "format:check",
      jest: "test",
      rntl: "test:rntl",
      hooks: "test:hooks",
    };

    const requiredScript = scriptMap[cmd.category];
    if (requiredScript) {
      return scripts.has(requiredScript);
    }

    return true;
  });
}

async function main() {
  const program = new Command();

  program
    .name("community-runner")
    .description("Test generated workflows against community repos")
    .option(
      "--repos-file <path>",
      "Path to community repos JSON",
      path.resolve(__dirname, "..", "configs", "community-repos.json")
    )
    .option("--repo-index <number>", "Run only a specific repo by index", parseInt)
    .option("--work-dir <path>", "Working directory for clones", "/tmp/community-tests")
    .option("--graceful-missing-scripts", "Skip missing scripts instead of failing", true)
    .option("--verbose", "Show detailed output", false)
    .parse(process.argv);

  const opts = program.opts();

  const reposFile = path.resolve(opts.reposFile);
  const repos: CommunityRepo[] = JSON.parse(
    fs.readFileSync(reposFile, "utf-8")
  );

  const workDir = path.resolve(opts.workDir);
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  const indices =
    opts.repoIndex !== undefined
      ? [opts.repoIndex as number]
      : repos.map((_, i) => i);

  let allResults: { repo: string; results: CommandResult[]; passed: boolean }[] = [];

  for (const idx of indices) {
    const repo = repos[idx];
    console.log(`\n${"=".repeat(80)}`);
    console.log(`Community repo: ${repo.repo} (${repo.subdir})`);
    console.log(`Description: ${repo.description}`);
    console.log(`Package manager: ${repo.packageManager}`);
    console.log(`${"=".repeat(80)}`);

    const repoDir = path.join(workDir, repo.repo.replace("/", "-"));
    const appDir = repo.subdir
      ? path.join(repoDir, repo.subdir)
      : repoDir;

    // Clone the repo
    if (!fs.existsSync(repoDir)) {
      console.log(`Cloning ${repo.repo}...`);
      execSync(
        `git clone --depth 1 --branch ${repo.sha} https://github.com/${repo.repo}.git ${repoDir}`,
        { stdio: "pipe", timeout: 120_000 }
      );
    }

    if (!fs.existsSync(appDir)) {
      console.error(`App directory not found: ${appDir}`);
      continue;
    }

    // Detect available scripts
    const scripts = detectScripts(path.join(appDir, "package.json"));
    console.log(`Available scripts: ${[...scripts].join(", ")}`);

    // Build config and extract commands
    const config = buildConfigForRepo(scripts, repo.packageManager);
    let commands = extractTestJobCommands(config);

    // Filter for available scripts
    if (opts.gracefulMissingScripts) {
      commands = filterForAvailableScripts(commands, scripts, appDir);
    }

    console.log(`Commands to run: ${commands.length}`);

    // Install dependencies first
    console.log("Installing dependencies...");
    try {
      const installCmd =
        repo.packageManager === "yarn" ? "yarn install" : "npm install";
      execSync(installCmd, {
        cwd: appDir,
        stdio: "pipe",
        timeout: 300_000,
      });
    } catch (err) {
      console.error("Dependency installation failed, skipping repo");
      continue;
    }

    // Run commands (skip install since we already did it)
    const nonInstallCommands = commands.filter(
      (c) => c.category !== "install"
    );

    const results = runCommands(nonInstallCommands, {
      fixtureDir: appDir,
      continueOnError: true,
      skipBuild: true,
      verbose: opts.verbose,
    });

    printResults(results);

    allResults.push({
      repo: `${repo.repo}/${repo.subdir}`,
      results,
      passed: allPassed(results),
    });
  }

  // Print summary
  console.log(`\n${"=".repeat(80)}`);
  console.log("Community Test Summary");
  console.log("=".repeat(80));

  for (const r of allResults) {
    const status = r.passed ? "PASS" : "FAIL";
    const total = r.results.length;
    const passed = r.results.filter(
      (c) => !c.skipped && c.exitCode === 0
    ).length;
    const failed = r.results.filter(
      (c) => !c.skipped && c.exitCode !== 0
    ).length;
    console.log(`  [${status}] ${r.repo} — ${passed}/${total} passed, ${failed} failed`);
  }

  const overallPassed = allResults.every((r) => r.passed);
  process.exit(overallPassed ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
