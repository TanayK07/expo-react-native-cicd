import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ExtractedCommand } from "./command-extractor";

export interface CommandResult {
  stepName: string;
  command: string;
  category: ExtractedCommand["category"];
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  skipped: boolean;
  skipReason?: string;
}

export interface RunnerOptions {
  fixtureDir: string;
  continueOnError?: boolean;
  timeout?: number;
  skipBuild?: boolean;
  verbose?: boolean;
}

const SKIP_CATEGORIES: ExtractedCommand["category"][] = ["build"];

/**
 * Execute a list of extracted commands in a fixture app directory.
 */
export function runCommands(
  commands: ExtractedCommand[],
  options: RunnerOptions
): CommandResult[] {
  const results: CommandResult[] = [];
  const fixtureDir = path.resolve(options.fixtureDir);
  const timeout = options.timeout || 120_000;

  // Create temp files for GHA environment variables
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "integration-runner-"));
  const githubOutput = path.join(tmpDir, "GITHUB_OUTPUT");
  const githubEnv = path.join(tmpDir, "GITHUB_ENV");
  const githubStepSummary = path.join(tmpDir, "GITHUB_STEP_SUMMARY");
  fs.writeFileSync(githubOutput, "");
  fs.writeFileSync(githubEnv, "");
  fs.writeFileSync(githubStepSummary, "");

  for (const cmd of commands) {
    // Skip build commands if --skip-build
    if (options.skipBuild && SKIP_CATEGORIES.includes(cmd.category)) {
      results.push({
        stepName: cmd.stepName,
        command: cmd.command,
        category: cmd.category,
        exitCode: 0,
        stdout: "",
        stderr: "",
        durationMs: 0,
        skipped: true,
        skipReason: "build commands skipped (--skip-build)",
      });
      continue;
    }

    // Skip commands with GHA expressions
    if (cmd.hasGHAExpressions) {
      results.push({
        stepName: cmd.stepName,
        command: cmd.command,
        category: cmd.category,
        exitCode: 0,
        stdout: "",
        stderr: "",
        durationMs: 0,
        skipped: true,
        skipReason: "contains GitHub Actions expressions",
      });
      continue;
    }

    const start = Date.now();
    let exitCode = 0;
    let stdout = "";
    let stderr = "";

    try {
      // Multi-line commands need bash -c
      const execCommand = cmd.command.includes("\n")
        ? `bash -c ${JSON.stringify(cmd.command)}`
        : cmd.command;

      if (options.verbose) {
        console.log(`\n  Running: ${cmd.stepName}`);
        console.log(`  Command: ${execCommand.substring(0, 200)}...`);
      }

      const output = execSync(execCommand, {
        cwd: fixtureDir,
        env: {
          ...process.env,
          CI: "true",
          GITHUB_OUTPUT: githubOutput,
          GITHUB_ENV: githubEnv,
          GITHUB_STEP_SUMMARY: githubStepSummary,
        },
        timeout,
        stdio: "pipe",
        encoding: "utf-8",
      });

      stdout = output || "";
    } catch (err: unknown) {
      const execErr = err as {
        status?: number;
        stdout?: string;
        stderr?: string;
      };
      exitCode = execErr.status || 1;
      stdout = (execErr.stdout as string) || "";
      stderr = (execErr.stderr as string) || "";
    }

    const durationMs = Date.now() - start;

    results.push({
      stepName: cmd.stepName,
      command: cmd.command,
      category: cmd.category,
      exitCode,
      stdout,
      stderr,
      durationMs,
      skipped: false,
    });

    if (options.verbose) {
      const status = exitCode === 0 ? "PASS" : "FAIL";
      console.log(`  ${status} (${durationMs}ms)`);
    }

    // Stop on first failure unless continueOnError
    if (exitCode !== 0 && !options.continueOnError) {
      break;
    }
  }

  // Cleanup temp files
  try {
    fs.rmSync(tmpDir, { recursive: true });
  } catch {
    // ignore cleanup errors
  }

  return results;
}

/**
 * Print a results table to stdout.
 */
export function printResults(results: CommandResult[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("Integration Test Results");
  console.log("=".repeat(80));

  const maxNameLen = Math.max(
    ...results.map((r) => r.stepName.length),
    10
  );

  for (const r of results) {
    let status: string;
    if (r.skipped) {
      status = "SKIP";
    } else if (r.exitCode === 0) {
      status = "PASS";
    } else {
      status = "FAIL";
    }

    const name = r.stepName.padEnd(maxNameLen);
    const duration = r.skipped ? "-" : `${r.durationMs}ms`;
    const reason = r.skipReason ? ` (${r.skipReason})` : "";

    console.log(`  [${status}] ${name}  ${duration}${reason}`);

    if (r.exitCode !== 0 && !r.skipped) {
      if (r.stderr) {
        const lines = r.stderr.split("\n").slice(0, 5);
        for (const line of lines) {
          console.log(`         ${line}`);
        }
      }
    }
  }

  const passed = results.filter((r) => !r.skipped && r.exitCode === 0).length;
  const failed = results.filter((r) => !r.skipped && r.exitCode !== 0).length;
  const skipped = results.filter((r) => r.skipped).length;

  console.log("=".repeat(80));
  console.log(
    `Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`
  );
  console.log("=".repeat(80));
}

/**
 * Returns true if all non-skipped commands passed.
 */
export function allPassed(results: CommandResult[]): boolean {
  return results
    .filter((r) => !r.skipped)
    .every((r) => r.exitCode === 0);
}
