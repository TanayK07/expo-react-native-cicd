#!/usr/bin/env node
// scripts/workflow-tester.ts

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { program } from "commander";
import inquirer from "inquirer";
import { FormValues } from "../app/types";

// Import directly from local paths with relative paths
import { generateWorkflowYaml } from "../app/utils/workflowGenerator";

// Define the output directory for workflows - point to the examples folder in the project root
const WORKFLOWS_DIR = path.join(process.cwd(), "..", "examples");

// Set up the CLI program
program
  .name("workflow-tester")
  .description("Generate and test React Native & Expo CI/CD workflows")
  .version("1.0.0");

// Helper function to generate all valid workflows
async function generateAllWorkflows(
  outputDir: string,
  limit?: number,
): Promise<string[]> {
  // Create directory if it doesn't exist
  const exampleWorkflowsDir = path.resolve(outputDir);
  if (!fs.existsSync(exampleWorkflowsDir)) {
    fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
  }

  // Define all valid combinations of form values
  const validCombinations = {
    storageTypes: ["github-release", "zoho-drive", "google-drive", "custom"],
    buildTypes: [
      ["dev"],
      ["prod-apk"],
      ["prod-aab"],
      ["dev", "prod-apk"],
      ["dev", "prod-apk", "prod-aab"],
    ],
    tests: [
      ["typescript"],
      ["eslint"],
      ["prettier"],
      ["typescript", "eslint"],
      ["typescript", "eslint", "prettier"],
    ],
    triggers: [
      ["push-main"],
      ["pull-request"],
      ["manual"],
      ["push-main", "pull-request"],
      ["push-main", "pull-request", "manual"],
    ],
    advancedOptions: [
      {
        iOSSupport: false,
        publishToExpo: false,
        publishToStores: false,
        jestTests: false,
        rntlTests: false,
        renderHookTests: false,
        caching: true,
        notifications: false,
      },
      {
        iOSSupport: true,
        publishToExpo: false,
        publishToStores: false,
        jestTests: false,
        rntlTests: false,
        renderHookTests: false,
        caching: true,
        notifications: false,
      },
      {
        iOSSupport: false,
        publishToExpo: true,
        publishToStores: false,
        jestTests: true,
        rntlTests: false,
        renderHookTests: false,
        caching: true,
        notifications: true,
      },
      {
        iOSSupport: true,
        publishToExpo: true,
        publishToStores: true,
        jestTests: true,
        rntlTests: true,
        renderHookTests: true,
        caching: true,
        notifications: true,
      },
    ],
  };

  const filePaths: string[] = [];
  let count = 0;

  // Generate all valid combinations
  for (const storageType of validCombinations.storageTypes) {
    for (const buildTypeArray of validCombinations.buildTypes) {
      for (const testArray of validCombinations.tests) {
        for (const triggerArray of validCombinations.triggers) {
          for (const advancedOpts of validCombinations.advancedOptions) {
            // If a limit is provided and we've reached it, stop generating
            if (limit && count >= limit) {
              return filePaths;
            }

            // Create a FormValues object
            const formValues: FormValues = {
              storageType: storageType,
              buildTypes: buildTypeArray,
              tests: testArray,
              triggers: triggerArray,
              advancedOptions: advancedOpts,
            };

            // Generate the YAML
            const yamlContent = generateWorkflowYaml(formValues);

            // Create a unique filename based on configuration
            const filename = `workflow_${storageType}_${buildTypeArray.join("-")}_${triggerArray.join("-")}_ios-${advancedOpts.iOSSupport}_${count}.yml`;
            const filePath = path.join(exampleWorkflowsDir, filename);

            // Write the file
            fs.writeFileSync(filePath, yamlContent);
            filePaths.push(filePath);
            count++;
          }
        }
      }
    }
  }

  return filePaths;
}

// Command to generate all workflows
program
  .command("generate")
  .description("Generate all valid workflow combinations")
  .option("-l, --limit <number>", "Limit the number of workflows to generate")
  .action(async (options) => {
    console.log("Generating workflow files...");
    const limit = options.limit ? parseInt(options.limit) : undefined;
    const filePaths = await generateAllWorkflows(WORKFLOWS_DIR, limit);
    console.log(
      `Generated ${filePaths.length} workflow files in ${WORKFLOWS_DIR}`,
    );
  });

// Command to generate a specific workflow
program
  .command("generate-specific")
  .description("Generate a specific workflow configuration")
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "storageType",
        message: "Storage type:",
        choices: ["github-release", "zoho-drive", "google-drive", "custom"],
        default: "github-release",
      },
      {
        type: "checkbox",
        name: "buildTypes",
        message: "Build types:",
        choices: ["dev", "prod-apk", "prod-aab"],
        default: ["dev"],
      },
      {
        type: "checkbox",
        name: "tests",
        message: "Tests to run:",
        choices: ["typescript", "eslint", "prettier"],
        default: ["typescript"],
      },
      {
        type: "checkbox",
        name: "triggers",
        message: "Workflow triggers:",
        choices: ["push-main", "pull-request", "manual"],
        default: ["manual"],
      },
      {
        type: "confirm",
        name: "iOSSupport",
        message: "Enable iOS support?",
        default: false,
      },
      {
        type: "confirm",
        name: "publishToExpo",
        message: "Enable publishing to Expo?",
        default: false,
      },
      {
        type: "confirm",
        name: "publishToStores",
        message: "Enable publishing to stores?",
        default: false,
      },
      {
        type: "confirm",
        name: "jestTests",
        message: "Enable Jest tests?",
        default: false,
      },
      {
        type: "confirm",
        name: "rntlTests",
        message: "Enable React Native Testing Library tests?",
        default: false,
      },
      {
        type: "confirm",
        name: "renderHookTests",
        message: "Enable renderHook tests?",
        default: false,
      },
      {
        type: "confirm",
        name: "caching",
        message: "Enable caching?",
        default: true,
      },
      {
        type: "confirm",
        name: "notifications",
        message: "Enable notifications?",
        default: false,
      },
    ]);

    // Format answers into FormValues
    const formValues: FormValues = {
      storageType: answers.storageType,
      buildTypes: answers.buildTypes,
      tests: answers.tests,
      triggers: answers.triggers,
      advancedOptions: {
        iOSSupport: answers.iOSSupport,
        publishToExpo: answers.publishToExpo,
        publishToStores: answers.publishToStores,
        jestTests: answers.jestTests,
        rntlTests: answers.rntlTests,
        renderHookTests: answers.renderHookTests,
        caching: answers.caching,
        notifications: answers.notifications,
      },
    };

    // Generate the YAML
    const yamlContent = generateWorkflowYaml(formValues);

    // Create a unique filename based on configuration
    const filename = `workflow_${answers.storageType}_${answers.buildTypes.join("-")}_${answers.triggers.join("-")}_ios-${answers.iOSSupport}.yml`;
    const filePath = path.join(WORKFLOWS_DIR, filename);

    // Write the file
    fs.writeFileSync(filePath, yamlContent);
    console.log(`Generated workflow file: ${filePath}`);
  });

program.parse(process.argv);
