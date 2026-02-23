import * as yaml from "js-yaml";
import * as path from "path";

// Import the generator from the webapp
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  generateWorkflowYaml,
} = require("../../webapp/app/utils/workflowGenerator");

// Re-export FormValues type for convenience
export interface FormValues {
  projectName?: string;
  expoVersion?: string;
  packageManager?: "yarn" | "npm" | "pnpm";
  storageType?: string;
  platform?: string;
  buildType?: string;
  nodeVersion?: string;
  expoCli?: string;
  eas?: string;
  reactNativeCli?: string;
  fastlane?: string;
  workflow?: string;
  buildTypes: string[];
  tests: string[];
  triggers: string[];
  advancedOptions?: {
    iOSSupport: boolean;
    publishToExpo: boolean;
    publishToStores: boolean;
    jestTests: boolean;
    rntlTests: boolean;
    renderHookTests: boolean;
    caching: boolean;
    notifications: boolean;
    notificationType?: "slack" | "discord" | "both";
  };
}

export interface ExtractedCommand {
  stepName: string;
  command: string;
  category:
    | "install"
    | "typecheck"
    | "lint"
    | "format"
    | "jest"
    | "rntl"
    | "hooks"
    | "cache-dir"
    | "eas-install"
    | "build"
    | "other";
  hasGHAExpressions: boolean;
}

interface WorkflowStep {
  name?: string;
  run?: string;
  uses?: string;
  id?: string;
  if?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
}

interface WorkflowJob {
  steps?: WorkflowStep[];
  needs?: string | string[];
  "runs-on"?: string;
  if?: string;
  strategy?: Record<string, unknown>;
}

interface WorkflowYaml {
  name?: string;
  on?: Record<string, unknown>;
  env?: Record<string, string>;
  jobs?: Record<string, WorkflowJob>;
}

function categorizeCommand(
  stepName: string,
  command: string
): ExtractedCommand["category"] {
  // Check step name and command content for categorization
  const lower = command.toLowerCase();
  const nameLower = stepName.toLowerCase();

  if (
    nameLower.includes("install dependencies") ||
    /^(yarn install|npm install|pnpm install)$/m.test(command.trim())
  ) {
    return "install";
  }

  if (
    nameLower.includes("typescript") ||
    lower.includes("tsc") ||
    lower.includes("typecheck") ||
    lower.includes("type-check")
  ) {
    return "typecheck";
  }

  if (nameLower.includes("eslint") || lower.includes("eslint") || lower.includes("run lint")) {
    return "lint";
  }

  if (
    nameLower.includes("prettier") ||
    lower.includes("prettier") ||
    lower.includes("format:check")
  ) {
    return "format";
  }

  if (nameLower.includes("renderhook") || lower.includes("test:hooks")) {
    return "hooks";
  }

  if (
    nameLower.includes("react native testing library") ||
    lower.includes("test:rntl")
  ) {
    return "rntl";
  }

  if (
    nameLower.includes("jest") ||
    (nameLower.includes("test") &&
      !nameLower.includes("rntl") &&
      !nameLower.includes("hook") &&
      !nameLower.includes("react native testing"))
  ) {
    if (lower.includes("test:rntl")) return "rntl";
    if (lower.includes("test:hooks")) return "hooks";
    return "jest";
  }

  if (
    nameLower.includes("cache directory") ||
    lower.includes("cache dir") ||
    lower.includes("npm config get cache") ||
    lower.includes("pnpm store path")
  ) {
    return "cache-dir";
  }

  if (
    lower.includes("eas-cli") ||
    lower.includes("yarn global add eas") ||
    lower.includes("npm install -g eas") ||
    lower.includes("pnpm add -g eas")
  ) {
    return "eas-install";
  }

  if (lower.includes("eas build") || lower.includes("eas submit")) {
    return "build";
  }

  return "other";
}

function hasGHAExpressions(command: string): boolean {
  return /\$\{\{.*?\}\}/.test(command);
}

/**
 * Extract run: commands from the test job of a generated workflow.
 * These are the commands that can be executed against fixture apps.
 */
export function extractTestJobCommands(config: FormValues): ExtractedCommand[] {
  const yamlString = generateWorkflowYaml(config);
  const parsed = yaml.load(yamlString) as WorkflowYaml;

  if (!parsed?.jobs) {
    return [];
  }

  const commands: ExtractedCommand[] = [];

  // Extract from the "test" job
  const testJob = parsed.jobs["test"];
  if (testJob?.steps) {
    for (const step of testJob.steps) {
      if (step.run) {
        const cmd: ExtractedCommand = {
          stepName: step.name || "unnamed",
          command: step.run,
          category: categorizeCommand(step.name || "", step.run),
          hasGHAExpressions: hasGHAExpressions(step.run),
        };
        commands.push(cmd);
      }
    }
  }

  return commands;
}

/**
 * Extract run: commands from the build job (install + EAS steps only).
 * Build commands themselves are skipped unless includeBuildCommands is true.
 */
export function extractBuildJobCommands(
  config: FormValues,
  options?: { includeBuildCommands?: boolean }
): ExtractedCommand[] {
  const yamlString = generateWorkflowYaml(config);
  const parsed = yaml.load(yamlString) as WorkflowYaml;

  if (!parsed?.jobs) {
    return [];
  }

  const commands: ExtractedCommand[] = [];

  // Find the build job (could be build-and-release or build-and-deploy)
  const buildJobName = Object.keys(parsed.jobs).find(
    (name) => name.startsWith("build-and-")
  );

  if (buildJobName) {
    const buildJob = parsed.jobs[buildJobName];
    if (buildJob?.steps) {
      for (const step of buildJob.steps) {
        if (step.run) {
          const cmd: ExtractedCommand = {
            stepName: step.name || "unnamed",
            command: step.run,
            category: categorizeCommand(step.name || "", step.run),
            hasGHAExpressions: hasGHAExpressions(step.run),
          };

          // Skip actual build/deploy commands unless requested
          if (
            !options?.includeBuildCommands &&
            (cmd.category === "build" || cmd.category === "other")
          ) {
            continue;
          }

          commands.push(cmd);
        }
      }
    }
  }

  return commands;
}

/**
 * Extract all executable run: commands from all jobs.
 * Filters out commands with GHA expressions by default.
 */
export function extractAllCommands(
  config: FormValues,
  options?: {
    includeGHAExpressions?: boolean;
    includeBuildCommands?: boolean;
  }
): ExtractedCommand[] {
  const testCommands = extractTestJobCommands(config);
  const buildCommands = extractBuildJobCommands(config, {
    includeBuildCommands: options?.includeBuildCommands,
  });

  let allCommands = [...testCommands, ...buildCommands];

  if (!options?.includeGHAExpressions) {
    allCommands = allCommands.filter((cmd) => !cmd.hasGHAExpressions);
  }

  return allCommands;
}

/**
 * Generate a "command signature" for deduplication.
 * Two configs with the same signature produce the same set of executable commands.
 */
export function commandSignature(config: FormValues): string {
  const commands = extractTestJobCommands(config);
  return commands
    .map((c) => `${c.category}:${c.command.trim()}`)
    .sort()
    .join("|");
}
