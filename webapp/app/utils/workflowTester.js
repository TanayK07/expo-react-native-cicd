// app/utils/workflowTester.js
const fs = require("fs");
const path = require("path");
const { generateWorkflowYaml } = require("./workflowGenerator");

// Define all valid combinations of form values
const validCombinations = {
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
 * @param {string} outputDir Directory to save generated workflow files
 * @param {number} limit Optional limit on combinations (for testing)
 * @returns {Promise<string[]>} Array of file paths
 */
async function generateAllWorkflows(outputDir, limit) {
	// Create directory if it doesn't exist
	const exampleWorkflowsDir = path.resolve(outputDir);
	if (!fs.existsSync(exampleWorkflowsDir)) {
		fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
	}

	const filePaths = [];
	let count = 0;

	// Generate all valid combinations
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

												// Create a FormValues object
												const formValues = {
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
													// Add required properties
													buildTypes: [buildType],
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
 * @param {object} config Configuration for the workflow
 * @param {string} outputDir Directory to save the workflow file
 * @returns {string} Path to the generated file
 */
function generateSpecificWorkflow(config, outputDir) {
	const exampleWorkflowsDir = path.resolve(outputDir);
	if (!fs.existsSync(exampleWorkflowsDir)) {
		fs.mkdirSync(exampleWorkflowsDir, { recursive: true });
	}

	// Generate the YAML
	const yamlContent = generateWorkflowYaml(config);

	// Create a unique filename based on configuration
	const filename = `workflow_${config.projectName || "test"}_${config.platform}_${
		config.buildType
	}_${config.expoCli}_${config.storageType}.yml`;
	const filePath = path.join(exampleWorkflowsDir, filename);

	// Write the file
	fs.writeFileSync(filePath, yamlContent);

	return filePath;
}

/**
 * Generate a manifest of all workflows with their configurations
 * @param {string} outputDir Directory where workflows are saved
 * @param {string[]} workflowPaths Array of workflow file paths
 */
function generateWorkflowManifest(outputDir, workflowPaths) {
	const manifest = workflowPaths.map((filePath) => {
		const filename = path.basename(filePath);
		// Extract configuration from filename
		// workflow_TestApp_android_development_classic_github_123.yml
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
		JSON.stringify(manifest, null, 2)
	);
}

module.exports = {
	generateAllWorkflows,
	generateSpecificWorkflow,
	generateWorkflowManifest,
};
