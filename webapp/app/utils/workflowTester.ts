// utils/workflowTester.ts
import fs from "fs";
import path from "path";
import { generateWorkflowYaml } from "./workflowGenerator";
import { FormValues } from "../types";

// First, let's check what properties are in your FormValues interface
// You'll need to adjust the validCombinations and code below based on your actual FormValues interface

// Define all valid combinations of form values
// Adjust these properties to match your FormValues interface
const validCombinations = {
	// If your FormValues uses 'name' instead of 'projectName', change this line
	names: ["TestApp", "ExpoProject"],
	expoVersions: ["46", "47", "48", "49", "50"],
	storageTypes: ["github", "s3", "gcs", "azure"],
	platforms: ["android", "ios"],
	buildTypes: ["development", "production"],
	nodeVersions: ["16", "18", "20"],
	expoCliTypes: ["classic", "modern"],
	reactNativeCliOptions: ["true", "false"],
	fastlaneOptions: ["true", "false"],
	workflowTypes: ["manual", "scheduled", "on-push"],
	easOptions: ["true", "false"],
};

/**
 * Generate all valid combinations of workflow YAML files
 * @param outputDir Directory to save generated workflow files
 * @param limit Optional limit on combinations (for testing)
 */
export async function generateAllWorkflows(
	outputDir: string,
	limit?: number
): Promise<string[]> {
	// Create directory if it doesn't exist
	const exampleWorkflowsDir = path.resolve(outputDir);
	if (!fs.existsSync(exampleWorkflowsDir)) {
		fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
	}

	const filePaths: string[] = [];
	let count = 0;

	// Generate all valid combinations
	// Adjust the property names below to match your FormValues interface
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

												// Create a FormValues object with your specific structure
												// Change the property names to match your FormValues interface
												const formValues: FormValues = {
													// Adjust these property names based on your actual FormValues interface
													// If your interface uses 'name' instead of 'projectName', make that change
													projectName: name, // Changed from 'name' to 'projectName' to match FormValues interface
													expoVersion,
													storageType: storageType as any,
													platform: platform as any,
													buildType: buildType as any,
													nodeVersion,
													expoCli: expoCli as any,
													reactNativeCli,
													fastlane,
													workflow: workflow as any,
													eas,
													// Add missing properties required by FormValues interface
													buildTypes: [buildType as any],
													tests: ["true"],
													triggers:
														workflow === "on-push"
															? ["push"]
															: workflow === "scheduled"
																? ["schedule"]
																: [],
												};

												// Generate the YAML
												const yamlContent = generateWorkflowYaml(formValues);

												// Create a unique filename based on configuration
												const filename = `workflow_${name}_${platform}_${buildType}_${expoCli}_${storageType}_${count}.yml`;
												const filePath = path.join(
													exampleWorkflowsDir,
													filename
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
	outputDir: string
): string {
	const exampleWorkflowsDir = path.resolve(outputDir);
	if (!fs.existsSync(exampleWorkflowsDir)) {
		fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
	}

	// Generate the YAML
	const yamlContent = generateWorkflowYaml(config);

	// Create a unique filename based on configuration
	// Update these property references to match your FormValues interface
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
	workflowPaths: string[]
): void {
	const manifest = workflowPaths.map((filePath) => {
		const filename = path.basename(filePath);
		// Extract configuration from filename
		// workflow_TestApp_android_development_classic_github_123.yml
		const parts = filename.replace(".yml", "").split("_");

		return {
			path: filePath,
			filename,
			configuration: {
				name: parts[1], // or projectName, depending on your interface
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
		JSON.stringify(manifest, null, 2)
	);
}
