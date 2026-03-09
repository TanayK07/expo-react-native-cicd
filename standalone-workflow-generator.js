#!/usr/bin/env node

/**
 * Standalone workflow generator script
 * This script contains both the workflow generation logic and the CLI interface
 * so it doesn't depend on imports from other files
 */

const fs = require("fs");
const path = require("path");
const { program } = require("commander");

// Set up the CLI program
program
	.name("workflow-generator")
	.description("Generate example workflow files for React Native & Expo CI/CD")
	.version("1.0.0");

// Define the output directory for workflows
const ROOT_DIR = path.resolve(__dirname);
const EXAMPLES_DIR = path.join(ROOT_DIR, "examples", "Not Tested");

// Function to generate workflow YAML
function generateWorkflowYaml(values) {
	const { storageType, buildTypes, tests, triggers, advancedOptions } = values;

	// Set defaults for advanced options if not provided
	const options = advancedOptions || {
		iOSSupport: false,
		publishToExpo: false,
		publishToStores: false,
		jestTests: false,
		rntlTests: false,
		renderHookTests: false,
		caching: true,
		notifications: false,
	};

	let yaml = `name: React Native CI/CD\n\non:\n`;

	// Add triggers
	if (triggers.includes("push-main")) {
		yaml += `  push:\n    branches: [main, master]\n    paths-ignore:\n      - "**.md"\n      - "LICENSE"\n      - "docs/**"\n`;
	}

	if (triggers.includes("pull-request")) {
		yaml += `  pull_request:\n    branches: [main, master]\n`;
	}

	if (triggers.includes("manual")) {
		yaml += `  workflow_dispatch:\n    inputs:\n      buildType:\n        type: choice\n        description: "Build type to run"\n        options:\n`;

		if (buildTypes.includes("dev")) {
			yaml += `          - dev\n`;
		}
		if (buildTypes.includes("prod-apk")) {
			yaml += `          - prod-apk\n`;
		}
		if (buildTypes.includes("prod-aab")) {
			yaml += `          - prod-aab\n`;
		}

		// Add iOS options if enabled
		if (options.iOSSupport) {
			if (buildTypes.includes("dev")) {
				yaml += `          - ios-dev\n`;
			}
			yaml += `          - ios-prod\n`;
		}

		// Add publishing options
		if (options.publishToExpo) {
			yaml += `          - publish-expo\n`;
		}
		if (options.publishToStores) {
			yaml += `          - publish-stores\n`;
		}

		yaml += `          - all\n`;

		// Add platforms input if iOS is enabled
		if (options.iOSSupport) {
			yaml += `      platform:\n        type: choice\n        description: "Platform to build"\n        default: "all"\n        options:\n`;
			yaml += `          - android\n`;
			yaml += `          - ios\n`;
			yaml += `          - all\n`;
		}
	}

	// Add env variables
	yaml += `\nenv:\n  EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}\n`;

	// Add iOS environment variables if needed
	if (options.iOSSupport) {
		yaml += `  EXPO_APPLE_ID: \${{ secrets.EXPO_APPLE_ID }}\n`;
		yaml += `  EXPO_APPLE_PASSWORD: \${{ secrets.EXPO_APPLE_PASSWORD }}\n`;
		yaml += `  EXPO_TEAM_ID: \${{ secrets.EXPO_TEAM_ID }}\n`;
	}

	// Add publishing environment variables if needed
	if (options.publishToStores) {
		yaml += `  GOOGLE_PLAY_SERVICE_ACCOUNT: \${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}\n`;
	}

	// Add notification environment variables if needed
	if (options.notifications) {
		yaml += `  SLACK_WEBHOOK: \${{ secrets.SLACK_WEBHOOK }}\n`;
		yaml += `  DISCORD_WEBHOOK: \${{ secrets.DISCORD_WEBHOOK }}\n`;
	}

	if (storageType === "zoho-drive") {
		yaml += `  RCLONE_CONFIG_ZOHODRIVE_TYPE: \${{ secrets.RCLONE_CONFIG_ZOHODRIVE_TYPE }}\n`;
		yaml += `  RCLONE_CONFIG_ZOHODRIVE_TOKEN: \${{ secrets.RCLONE_CONFIG_ZOHODRIVE_TOKEN }}\n`;
		yaml += `  RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID: \${{ secrets.RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID }}\n`;
	} else if (storageType === "google-drive") {
		yaml += `  RCLONE_CONFIG_GDRIVE_TYPE: \${{ secrets.RCLONE_CONFIG_GDRIVE_TYPE }}\n`;
		yaml += `  RCLONE_CONFIG_GDRIVE_TOKEN: \${{ secrets.RCLONE_CONFIG_GDRIVE_TOKEN }}\n`;
		yaml += `  RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID: \${{ secrets.RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID }}\n`;
	} else if (storageType === "custom") {
		yaml += `  CLOUD_STORAGE_TYPE: \${{ secrets.CLOUD_STORAGE_TYPE }}\n`;
		yaml += `  CLOUD_STORAGE_TOKEN: \${{ secrets.CLOUD_STORAGE_TOKEN }}\n`;
		yaml += `  CLOUD_STORAGE_ROOT_ID: \${{ secrets.CLOUD_STORAGE_ROOT_ID }}\n`;
	}

	yaml += `  NODE_OPTIONS: --openssl-legacy-provider\n`;

	// Add jobs
	yaml += `\njobs:\n`;

	// Skip CI check
	yaml += `  check-skip:\n    runs-on: ubuntu-latest\n    if: "!contains(github.event.head_commit.message, '[skip ci]')"\n    steps:\n      - name: Skip CI check\n        run: echo "Proceeding with workflow"\n\n`;

	// Add test job if any tests are selected
	if (
		tests.length > 0 ||
		options.jestTests ||
		options.rntlTests ||
		options.renderHookTests
	) {
		yaml += `  test:\n    needs: check-skip\n    runs-on: ubuntu-latest\n    steps:\n      - name: 🏗 Checkout repository\n        uses: actions/checkout@v4\n\n`;
		yaml += `      - name: 🏗 Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: "yarn"\n\n`;

		// Add caching if enabled
		if (options.caching) {
			yaml += `      - name: 📦 Get yarn cache directory path\n        id: yarn-cache-dir-path\n        run: echo "dir=$(yarn cache dir)" >> $GITHUB_OUTPUT\n\n`;
			yaml += `      - name: 📦 Setup yarn cache\n        uses: actions/cache@v3\n        with:\n          path: \${{ steps.yarn-cache-dir-path.outputs.dir }}\n          key: \${{ runner.os }}-yarn-\${{ hashFiles('**/yarn.lock') }}\n          restore-keys: |\n            \${{ runner.os }}-yarn-\n\n`;
		}

		yaml += `      - name: 📦 Install dependencies\n        run: yarn install\n\n`;

		if (tests.includes("typescript")) {
			yaml += `      - name: 🧪 Run TypeScript check\n        run: yarn tsc\n\n`;
		}

		if (tests.includes("eslint")) {
			yaml += `      - name: 🧹 Run ESLint\n        run: yarn lint\n\n`;
		}

		if (tests.includes("prettier")) {
			yaml += `      - name: 🎨 Run Prettier check\n        run: yarn format:check\n\n`;
		}

		// Add Jest tests if selected
		if (options.jestTests) {
			yaml += `      - name: 🧪 Run Jest Tests\n        run: yarn test\n\n`;
		}

		// Add RNTL tests if selected
		if (options.rntlTests) {
			yaml += `      - name: 🧪 Run React Native Testing Library Tests\n        run: yarn test:rntl\n\n`;
		}

		// Add renderHook tests if selected
		if (options.renderHookTests) {
			yaml += `      - name: 🧪 Run renderHook Tests\n        run: yarn test:hooks\n\n`;
		}

		// Add notification for test results if enabled
		if (options.notifications) {
			yaml += `      - name: 📢 Notify test results\n        if: always()\n        uses: rtCamp/action-slack-notify@v2\n        env:\n          SLACK_WEBHOOK: \${{ env.SLACK_WEBHOOK }}\n          SLACK_COLOR: \${{ job.status == 'success' && 'good' || 'danger' }}\n          SLACK_TITLE: Test Results\n          SLACK_MESSAGE: 'Tests \${{ job.status == "success" && "passed ✅" || "failed ❌" }}'\n\n`;
		}
	}

	// Add build job
	let buildJobName =
		storageType === "github-release" ? "build-and-release" : "build-and-deploy";

	yaml += `  ${buildJobName}:\n`;
	if (
		tests.length > 0 ||
		options.jestTests ||
		options.rntlTests ||
		options.renderHookTests
	) {
		yaml += `    needs: test\n`;
	} else {
		yaml += `    needs: check-skip\n`;
	}

	yaml += `    if: (github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')) || github.event_name == 'workflow_dispatch'\n`;

	// Add matrix strategy if iOS is enabled
	if (options.iOSSupport) {
		yaml += `    strategy:\n      matrix:\n        platform: [android]\n`;
		yaml += `        include:\n          - platform: ios\n            runs-on: macos-latest\n`;
		yaml += `    runs-on: \${{ matrix.platform == 'ios' && 'macos-latest' || 'ubuntu-latest' }}\n`;
	} else {
		yaml += `    runs-on: ubuntu-latest\n`;
	}

	yaml += `    steps:\n`;
	yaml += `      - name: 🏗 Checkout repository\n        uses: actions/checkout@v4\n\n`;
	yaml += `      - name: 🏗 Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: "yarn"\n\n`;

	// Add caching if enabled
	if (options.caching) {
		yaml += `      - name: 📦 Get yarn cache directory path\n        id: yarn-cache-dir-path\n        run: echo "dir=$(yarn cache dir)" >> $GITHUB_OUTPUT\n\n`;
		yaml += `      - name: 📦 Setup yarn cache\n        uses: actions/cache@v3\n        with:\n          path: \${{ steps.yarn-cache-dir-path.outputs.dir }}\n          key: \${{ runner.os }}-yarn-\${{ hashFiles('**/yarn.lock') }}\n          restore-keys: |\n            \${{ runner.os }}-yarn-\n\n`;
	}

	yaml += `      - name: 📦 Install dependencies\n        run: |\n          yarn install\n          yarn global add eas-cli@latest\n\n`;

	yaml += `      - name: 🔄 Verify EAS CLI installation\n        run: |\n          echo "EAS CLI version:"\n          eas --version\n\n`;

	// Add build steps based on selected build types and platforms
	if (buildTypes.includes("dev")) {
		yaml += `      - name: 📱 Build Development APK\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'dev' || github.event_name == 'push'`;

		// Add platform condition if iOS is enabled
		if (options.iOSSupport) {
			yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
		}

		yaml += `\n        run: |\n          # Build with increased memory limit\n          export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"\n          eas build --platform android --profile development --local --non-interactive --output=./app-dev.apk\n        env:\n          NODE_ENV: development\n\n`;
	}

	// More build steps would be added here...
	// (This is a simplified version of the full generator)

	// Always include GitHub artifact upload
	yaml += `      - name: 📦 Upload build artifacts to GitHub\n        uses: actions/upload-artifact@v4\n        with:\n          name: app-builds\n          path: |\n`;

	if (buildTypes.includes("dev")) {
		yaml += `            ./app-dev.apk\n`;
	}
	if (buildTypes.includes("prod-apk")) {
		yaml += `            ./app-prod.apk\n`;
	}
	if (buildTypes.includes("prod-aab")) {
		yaml += `            ./app-prod.aab\n`;
	}

	// Add iOS artifacts if iOS is enabled
	if (options.iOSSupport) {
		if (buildTypes.includes("dev")) {
			yaml += `            ./app-ios-dev.app\n`;
		}
		yaml += `            ./app-ios-prod.ipa\n`;
	}

	yaml += `          retention-days: 7\n`;

	return yaml;
}

// Helper function to generate all valid workflows
async function generateAllWorkflows(outputDir, limit) {
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
		],
	};

	const filePaths = [];
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
						const formValues = {
							storageType: storageType,
							buildTypes: buildTypeArray,
							tests: testArray,
							triggers: triggerArray,
							advancedOptions: advancedOpts,
						};

						try {
							// Generate the YAML
							const yamlContent = generateWorkflowYaml(formValues);

							// Create a unique filename based on configuration
							const filename = `workflow_${storageType}_${buildTypeArray.join(
								"-"
							)}_${triggerArray.join("-")}_ios-${
								advancedOpts.iOSSupport
							}_${count}.yml`;
							const filePath = path.join(exampleWorkflowsDir, filename);

							// Write the file
							fs.writeFileSync(filePath, yamlContent);
							filePaths.push(filePath);
							count++;

							console.log(`Generated workflow: ${filename}`);
						} catch (error) {
							console.error(
								`Error generating workflow for combination ${count}:`,
								error
							);
						}
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
		console.log(`Generating workflow files in ${EXAMPLES_DIR}...`);
		const limit = options.limit ? parseInt(options.limit) : undefined;

		try {
			const filePaths = await generateAllWorkflows(EXAMPLES_DIR, limit);
			console.log(
				`\nGenerated ${filePaths.length} workflow files in ${EXAMPLES_DIR}`
			);
		} catch (error) {
			console.error("Error generating workflows:", error);
		}
	});

program.parse(process.argv);
