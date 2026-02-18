// utils/workflowTester.ts
import fs from "fs";
import path from "path";
import { generateWorkflowYaml } from "./workflowGenerator";
import { FormValues } from "../types";

// Define all valid combinations of form values matching the actual FormValues interface
const validCombinations = {
  names: ["TestApp", "ExpoProject"],
  expoVersions: ["52", "53", "54"],
  storageTypes: ["github-release", "zoho-drive", "google-drive", "custom"],
  platforms: ["android", "ios"],
  buildTypes: ["dev", "prod-apk", "prod-aab"],
  nodeVersions: ["18", "20"],
  expoCliTypes: ["classic", "modern"],
  reactNativeCliOptions: ["true", "false"],
  fastlaneOptions: ["true", "false"],
  workflowTypes: ["manual", "push-main", "pull-request"],
  easOptions: ["true", "false"],
};

/**
 * Generate all valid combinations of workflow YAML files
 * @param outputDir Directory to save generated workflow files
 * @param limit Optional limit on combinations (for testing)
 */
export async function generateAllWorkflows(
  outputDir: string,
  limit?: number,
): Promise<string[]> {
  // Create directory if it doesn't exist
  const exampleWorkflowsDir = path.resolve(outputDir);
  if (!fs.existsSync(exampleWorkflowsDir)) {
    fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
  }

  const filePaths: string[] = [];
  let count = 0;

  for (const name of validCombinations.names) {
    for (const expoVersion of validCombinations.expoVersions) {
      for (const storageType of validCombinations.storageTypes) {
        for (const platform of validCombinations.platforms) {
          for (const buildType of validCombinations.buildTypes) {
            for (const nodeVersion of validCombinations.nodeVersions) {
              for (const expoCli of validCombinations.expoCliTypes) {
                for (const reactNativeCli of validCombinations.reactNativeCliOptions) {
                  for (const fastlane of validCombinations.fastlaneOptions) {
                    for (const workflow of validCombinations.workflowTypes) {
                      for (const eas of validCombinations.easOptions) {
                        // If a limit is provided and we've reached it, stop generating
                        if (limit && count >= limit) {
                          return filePaths;
                        }

                        const formValues: FormValues = {
                          projectName: name,
                          expoVersion,
                          storageType,
                          platform,
                          buildType,
                          nodeVersion,
                          expoCli,
                          reactNativeCli,
                          fastlane,
                          workflow,
                          eas,
                          buildTypes: [buildType],
                          tests: ["typescript", "eslint"],
                          // Map workflow type to the trigger strings generateWorkflowYaml expects
                          triggers: [workflow],
                        };

                        // Generate the YAML
                        const yamlContent = generateWorkflowYaml(formValues);

                        // Create a unique filename based on configuration
                        const filename = `workflow_${name}_${platform}_${buildType}_${expoCli}_${storageType}_${count}.yml`;
                        const filePath = path.join(
                          exampleWorkflowsDir,
                          filename,
                        );

                        // Write the file
                        fs.writeFileSync(filePath, yamlContent);
                        filePaths.push(filePath);
                        count++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return filePaths;
}

/**
 * Generate a specific workflow YAML file based on configuration
 * @param config Configuration for the workflow
 * @param outputDir Directory to save the workflow file
 */
export function generateSpecificWorkflow(
  config: FormValues,
  outputDir: string,
): string {
  const exampleWorkflowsDir = path.resolve(outputDir);
  if (!fs.existsSync(exampleWorkflowsDir)) {
    fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
  }

  // Generate the YAML
  const yamlContent = generateWorkflowYaml(config);

  // Create a unique filename based on configuration
  const filename = `workflow_${config.projectName || "test"}_${config.platform}_${config.buildType}_${config.expoCli}_${config.storageType}.yml`;
  const filePath = path.join(exampleWorkflowsDir, filename);

  // Write the file
  fs.writeFileSync(filePath, yamlContent);

  return filePath;
}

/**
 * Generate a manifest of all workflows with their configurations
 * @param outputDir Directory where workflows are saved
 * @param workflowPaths Array of workflow file paths
 */
export function generateWorkflowManifest(
  outputDir: string,
  workflowPaths: string[],
): void {
  const manifest = workflowPaths.map((filePath) => {
    const filename = path.basename(filePath);
    // Extract configuration from filename
    // workflow_TestApp_android_dev_classic_github-release_123.yml
    const parts = filename.replace(".yml", "").split("_");

    return {
      path: filePath,
      filename,
      configuration: {
        name: parts[1],
        platform: parts[2],
        buildType: parts[3],
        expoCli: parts[4],
        storageType: parts[5],
        index: parts[6],
      },
    };
  });

  fs.writeFileSync(
    path.join(outputDir, "workflow-manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
}
