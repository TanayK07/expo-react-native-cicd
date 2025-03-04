#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { program } = require("commander");
const inquirer = require("inquirer");
// Import using require and adjust the path based on your project structure
const {
	generateAllWorkflows,
	generateSpecificWorkflow,
} = require("../app/utils/workflowTester");

// Define the output directory for workflows
const WORKFLOWS_DIR = path.join(process.cwd(), "example-workflows");

// Set up the CLI program
program
	.name("workflow-tester")
	.description("Generate and test React Native & Expo CI/CD workflows")
	.version("1.0.0");

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
			`Generated ${filePaths.length} workflow files in ${WORKFLOWS_DIR}`
		);
	});

// Command to generate a specific workflow
program
	.command("generate-specific")
	.description("Generate a specific workflow configuration")
	.action(async () => {
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "projectName",
				message: "Project name:",
				default: "TestApp",
			},
			{
				type: "list",
				name: "expoVersion",
				message: "Expo version:",
				choices: ["46", "47", "48", "49", "50"],
				default: "49",
			},
			{
				type: "list",
				name: "storageType",
				message: "Storage type:",
				choices: ["github", "s3", "gcs", "azure"],
				default: "github",
			},
			{
				type: "list",
				name: "platform",
				message: "Platform:",
				choices: ["android", "ios"],
				default: "android",
			},
			{
				type: "list",
				name: "buildType",
				message: "Build type:",
				choices: ["development", "production"],
				default: "development",
			},
			{
				type: "list",
				name: "nodeVersion",
				message: "Node version:",
				choices: ["16", "18", "20"],
				default: "18",
			},
			{
				type: "list",
				name: "expoCli",
				message: "Expo CLI:",
				choices: ["classic", "modern"],
				default: "classic",
			},
			{
				type: "list",
				name: "reactNativeCli",
				message: "React Native CLI:",
				choices: ["true", "false"],
				default: "false",
			},
			{
				type: "list",
				name: "fastlane",
				message: "Use Fastlane:",
				choices: ["true", "false"],
				default: "false",
			},
			{
				type: "list",
				name: "workflow",
				message: "Workflow type:",
				choices: ["manual", "scheduled", "on-push"],
				default: "manual",
			},
			{
				type: "list",
				name: "eas",
				message: "Use EAS:",
				choices: ["true", "false"],
				default: "false",
			},
		]);

		// Add required properties based on your FormValues interface
		answers.buildTypes = [answers.buildType];
		answers.tests = ["true"];
		answers.triggers =
			answers.workflow === "on-push"
				? ["push"]
				: answers.workflow === "scheduled"
					? ["schedule"]
					: [];

		const filePath = generateSpecificWorkflow(answers, WORKFLOWS_DIR);
		console.log(`Generated workflow file: ${filePath}`);
	});

// Command to test a workflow in the example repo
program
	.command("test-workflow")
	.description("Test a specific workflow in the example repo")
	.option("-f, --file <path>", "Path to the workflow file to test")
	.option(
		"-r, --repo <path>",
		"Path to the example repository",
		"./example-todo-app"
	)
	.action(async (options) => {
		// Allow user to select a workflow file if not provided
		let workflowFile = options.file;
		if (!workflowFile) {
			const files = fs
				.readdirSync(WORKFLOWS_DIR)
				.filter((file) => file.endsWith(".yml"))
				.map((file) => path.join(WORKFLOWS_DIR, file));

			if (files.length === 0) {
				console.error(
					'No workflow files found. Generate them first with the "generate" command.'
				);
				process.exit(1);
			}

			const { selectedFile } = await inquirer.prompt([
				{
					type: "list",
					name: "selectedFile",
					message: "Select a workflow file to test:",
					choices: files.map((file) => ({
						name: path.basename(file),
						value: file,
					})),
				},
			]);

			workflowFile = selectedFile;
		}

		const repoPath = path.resolve(options.repo);

		// Check if the example repo exists
		if (!fs.existsSync(repoPath)) {
			console.error(`Example repository not found at ${repoPath}`);
			process.exit(1);
		}

		// Check if GitHub workflows directory exists in the repo
		const workflowsDir = path.join(repoPath, ".github", "workflows");
		if (!fs.existsSync(workflowsDir)) {
			fs.mkdirSync(workflowsDir, { recursive: true });
		}

		// Copy the selected workflow file to the repo
		const targetPath = path.join(workflowsDir, "test-workflow.yml");
		fs.copyFileSync(workflowFile, targetPath);
		console.log(`Copied workflow file to ${targetPath}`);

		// Run the workflow using act (GitHub Actions local runner)
		console.log("Running workflow with act...");
		try {
			// Note: You need to have act installed (https://github.com/nektos/act)
			execSync("act -j build", {
				cwd: repoPath,
				stdio: "inherit",
			});
			console.log("Workflow completed successfully");
		} catch (error) {
			console.error("Workflow failed to run");
			console.error(error);
		}
	});

// Command to run GitHub Actions locally on all workflows
program
	.command("test-all")
	.description("Test all generated workflows sequentially")
	.option(
		"-r, --repo <path>",
		"Path to the example repository",
		"./example-todo-app"
	)
	.option("-l, --limit <number>", "Limit the number of workflows to test")
	.action(async (options) => {
		const repoPath = path.resolve(options.repo);

		// Check if the example repo exists
		if (!fs.existsSync(repoPath)) {
			console.error(`Example repository not found at ${repoPath}`);
			process.exit(1);
		}

		// Get all workflow files
		const workflowFiles = fs
			.readdirSync(WORKFLOWS_DIR)
			.filter((file) => file.endsWith(".yml"))
			.map((file) => path.join(WORKFLOWS_DIR, file));

		if (workflowFiles.length === 0) {
			console.error(
				'No workflow files found. Generate them first with the "generate" command.'
			);
			process.exit(1);
		}

		// Create results directory
		const resultsDir = path.join(WORKFLOWS_DIR, "results");
		if (!fs.existsSync(resultsDir)) {
			fs.mkdirSync(resultsDir, { recursive: true });
		}

		// Limit the number of workflows to test if specified
		const limit = options.limit
			? parseInt(options.limit)
			: workflowFiles.length;
		const filesToTest = workflowFiles.slice(0, limit);

		// Test each workflow
		const results = [];
		for (let i = 0; i < filesToTest.length; i++) {
			const workflowFile = filesToTest[i];
			const filename = path.basename(workflowFile);
			console.log(
				`Testing workflow ${i + 1}/${filesToTest.length}: ${filename}`
			);

			// Check if GitHub workflows directory exists in the repo
			const workflowsDir = path.join(repoPath, ".github", "workflows");
			if (!fs.existsSync(workflowsDir)) {
				fs.mkdirSync(workflowsDir, { recursive: true });
			}

			// Copy the workflow file to the repo
			const targetPath = path.join(workflowsDir, "test-workflow.yml");
			fs.copyFileSync(workflowFile, targetPath);

			// Run the workflow using act
			try {
				execSync("act -j build", {
					cwd: repoPath,
					stdio: "pipe",
				});
				results.push({ file: filename, success: true });
				console.log(`✅ Workflow ${filename} completed successfully`);
			} catch (error) {
				results.push({
					file: filename,
					success: false,
					error: error.toString(),
				});
				console.error(`❌ Workflow ${filename} failed to run`);
			}
		}

		// Save results to file
		const resultsFile = path.join(
			resultsDir,
			`test-results-${new Date().toISOString().replace(/:/g, "-")}.json`
		);
		fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

		// Print summary
		const successCount = results.filter((r) => r.success).length;
		console.log(
			`\nTest results: ${successCount}/${results.length} workflows completed successfully`
		);
		console.log(`Results saved to ${resultsFile}`);
	});

program.parse(process.argv);
