#!/usr/bin/env ts-node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import {
  extractTestJobCommands,
  extractBuildJobCommands,
  FormValues,
} from "./command-extractor";
import { runCommands, printResults, allPassed } from "./integration-runner";

const program = new Command();

program
  .name("run-single")
  .description("Run a single integration test from a matrix config")
  .requiredOption(
    "--matrix-file <path>",
    "Path to matrix JSON file (e.g., configs/pr-matrix.json)"
  )
  .requiredOption("--config-index <number>", "Index into the matrix array", parseInt)
  .requiredOption(
    "--fixture-dir <path>",
    "Path to fixture app directory"
  )
  .option("--skip-build", "Skip EAS build commands", true)
  .option("--continue-on-error", "Run all commands even if one fails", false)
  .option("--verbose", "Show detailed output", false)
  .option(
    "--include-build-job",
    "Also extract commands from the build job (install/cache only)",
    false
  )
  .parse(process.argv);

const opts = program.opts();

// Resolve paths relative to integration-tests/ dir
const integrationDir = path.resolve(__dirname, "..");
const matrixFile = path.resolve(integrationDir, opts.matrixFile);
const fixtureDir = path.resolve(integrationDir, opts.fixtureDir);

// Validate inputs
if (!fs.existsSync(matrixFile)) {
  console.error(`Matrix file not found: ${matrixFile}`);
  process.exit(1);
}

if (!fs.existsSync(fixtureDir)) {
  console.error(`Fixture directory not found: ${fixtureDir}`);
  process.exit(1);
}

// Load matrix
const matrix: { name: string; config: FormValues }[] = JSON.parse(
  fs.readFileSync(matrixFile, "utf-8")
);

const index = opts.configIndex as number;
if (index < 0 || index >= matrix.length) {
  console.error(
    `Config index ${index} out of range (0-${matrix.length - 1})`
  );
  process.exit(1);
}

const entry = matrix[index];
console.log(`\nRunning integration test: ${entry.name}`);
console.log(`Config index: ${index}`);
console.log(`Fixture dir: ${fixtureDir}`);
console.log(`Package manager: ${entry.config.packageManager || "yarn"}`);

// Extract commands
let commands = extractTestJobCommands(entry.config);

if (opts.includeBuildJob) {
  const buildCmds = extractBuildJobCommands(entry.config);
  commands = [...commands, ...buildCmds];
}

console.log(`\nExtracted ${commands.length} commands:`);
for (const cmd of commands) {
  console.log(`  [${cmd.category}] ${cmd.stepName}`);
}

// Run commands
const results = runCommands(commands, {
  fixtureDir,
  continueOnError: opts.continueOnError,
  skipBuild: opts.skipBuild,
  verbose: opts.verbose,
});

// Print results
printResults(results);

// Exit with appropriate code
process.exit(allPassed(results) ? 0 : 1);
