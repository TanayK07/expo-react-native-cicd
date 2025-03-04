import { FormValues } from "../types";

export const generateWorkflowYaml = (values: FormValues): string => {
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

	yaml += `      - name: 📱 Setup EAS build cache\n        uses: actions/cache@v3\n        with:\n          path: ~/.eas-build-local\n          key: \${{ runner.os }}-eas-build-local-\${{ hashFiles('**/package.json') }}\n          restore-keys: |\n            \${{ runner.os }}-eas-build-local-\n\n`;
	yaml += `      - name: 🔄 Verify EAS CLI installation\n        run: |\n          echo "EAS CLI version:"\n          eas --version\n\n`;

	yaml += `      - name: 📋 Fix package.json main entry\n        run: |\n          # Check if jq is installed, if not install it\n          if ! command -v jq &> /dev/null; then\n            echo "Installing jq..."\n            sudo apt-get update && sudo apt-get install -y jq\n          fi\n\n          # Fix the main entry in package.json\n          if [ -f ./package.json ]; then\n            # Create a backup\n            cp package.json package.json.bak\n            # Update the package.json\n            jq '.main = "node_modules/expo/AppEntry.js"' package.json > package.json.tmp && mv package.json.tmp package.json\n            echo "Updated package.json main entry"\n            cat package.json | grep "main"\n          else\n            echo "package.json not found"\n            exit 1\n          fi\n\n`;

	yaml += `      - name: 📋 Update metro.config.js for SVG support\n        run: |\n          if [ -f ./metro.config.js ]; then\n            echo "Creating backup of metro.config.js"\n            cp ./metro.config.js ./metro.config.js.backup\n            echo "Updating metro.config.js to CommonJS format"\n            cat > ./metro.config.js << 'EOFMARKER'\n          /* eslint-disable @typescript-eslint/no-var-requires */\n          const { getDefaultConfig } = require('expo/metro-config');\n\n          const config = getDefaultConfig(__dirname);\n\n          const { transformer, resolver } = config;\n\n          config.transformer = {\n            ...transformer,\n            babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),\n          };\n\n          config.resolver = {\n            ...resolver,\n            assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),\n            sourceExts: [...resolver.sourceExts, 'svg'],\n          };\n\n          module.exports = config;\n          EOFMARKER\n            echo "metro.config.js updated to CommonJS format"\n          else\n            echo "metro.config.js not found"\n          fi\n\n`;

	// Add build steps based on selected build types and platforms
	if (buildTypes.includes("dev")) {
		yaml += `      - name: 📱 Build Development APK\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'dev' || github.event_name == 'push'`;

		// Add platform condition if iOS is enabled
		if (options.iOSSupport) {
			yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
		}

		yaml += `\n        run: |\n          # Build with increased memory limit\n          export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"\n          eas build --platform android --profile development --local --non-interactive --output=./app-dev.apk\n        env:\n          NODE_ENV: development\n\n`;
	}

	if (buildTypes.includes("prod-apk")) {
		yaml += `      - name: 📱 Build Production APK\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-apk' || github.event_name == 'push'`;

		// Add platform condition if iOS is enabled
		if (options.iOSSupport) {
			yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
		}

		yaml += `\n        run: |\n          export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"\n          eas build --platform android --profile production-apk --local --non-interactive --output=./app-prod.apk\n        env:\n          NODE_ENV: production\n\n`;
	}

	if (buildTypes.includes("prod-aab")) {
		yaml += `      - name: 📱 Build Production AAB\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-aab' || github.event_name == 'push'`;

		// Add platform condition if iOS is enabled
		if (options.iOSSupport) {
			yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
		}

		yaml += `\n        run: |\n          export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"\n          eas build --platform android --profile production --local --non-interactive --output=./app-prod.aab\n        env:\n          NODE_ENV: production\n\n`;
	}

	// Add iOS build steps if enabled
	if (options.iOSSupport) {
		// iOS Development Build
		if (buildTypes.includes("dev")) {
			yaml += `      - name: 📱 Build iOS Development\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-dev') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"\n          eas build --platform ios --profile development --local --non-interactive --output=./app-ios-dev.app\n        env:\n          NODE_ENV: development\n\n`;
		}

		// iOS Production Build
		yaml += `      - name: 📱 Build iOS Production\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-prod') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          export NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"\n          eas build --platform ios --profile production --local --non-interactive --output=./app-ios-prod.ipa\n        env:\n          NODE_ENV: production\n\n`;
	}

	// Add publishing steps if enabled
	if (options.publishToExpo) {
		yaml += `      - name: 🚀 Publish to Expo\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'publish-expo'\n        run: |\n          eas update --auto\n        env:\n          EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}\n\n`;
	}

	if (options.publishToStores) {
		yaml += `      - name: 🚀 Submit to Play Store\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'publish-stores') && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')\n        run: |\n          eas submit -p android --path ./app-prod.aab --non-interactive\n        env:\n          EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}\n          GOOGLE_PLAY_SERVICE_ACCOUNT: \${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}\n\n`;

		if (options.iOSSupport) {
			yaml += `      - name: 🚀 Submit to App Store\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'publish-stores') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          eas submit -p ios --path ./app-ios-prod.ipa --non-interactive\n        env:\n          EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}\n          EXPO_APPLE_ID: \${{ secrets.EXPO_APPLE_ID }}\n          EXPO_APPLE_PASSWORD: \${{ secrets.EXPO_APPLE_PASSWORD }}\n          EXPO_TEAM_ID: \${{ secrets.EXPO_TEAM_ID }}\n\n`;
		}
	}

	// Add deployment steps based on storage type
	if (storageType === "github-release") {
		yaml += `      - name: 🏷️ Generate build information\n        id: build-info\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          echo "version=$VERSION" >> $GITHUB_OUTPUT\n          echo "build_number=$BUILD_NUMBER" >> $GITHUB_OUTPUT\n          # Generate changelog from commit messages since last tag\n          if git describe --tags --abbrev=0 > /dev/null 2>&1; then\n            LAST_TAG=$(git describe --tags --abbrev=0)\n            git log $LAST_TAG..HEAD --pretty=format:"- %s" > changelog.md\n          else\n            git log --pretty=format:"- %s" -n 10 > changelog.md\n          fi\n\n`;

		yaml += `      - name: 📝 Create GitHub Release\n        uses: softprops/action-gh-release@v1\n        with:\n          draft: true\n          name: "Release v\${{ steps.build-info.outputs.version }}-\${{ steps.build-info.outputs.build_number }}"\n          tag_name: "v\${{ steps.build-info.outputs.version }}-\${{ steps.build-info.outputs.build_number }}"\n          files: |\n`;

		if (buildTypes.includes("dev")) {
			yaml += `            ./app-dev.apk\n`;
		}
		if (buildTypes.includes("prod-apk")) {
			yaml += `            ./app-prod.apk\n`;
		}
		if (buildTypes.includes("prod-aab")) {
			yaml += `            ./app-prod.aab\n`;
		}

		// Add iOS files to release if iOS is enabled
		if (options.iOSSupport) {
			if (buildTypes.includes("dev")) {
				yaml += `            ./app-ios-dev.app\n`;
			}
			yaml += `            ./app-ios-prod.ipa\n`;
		}

		yaml += `          body_path: changelog.md\n        env:\n          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}\n`;
	} else if (
		storageType &&
		["zoho-drive", "google-drive", "custom"].includes(storageType)
	) {
		yaml += `      - name: 🏗 Setup rclone\n        uses: AnimMouse/setup-rclone@v1\n        with:\n          version: latest\n\n`;

		if (storageType === "zoho-drive") {
			yaml += `      - name: 📤 Configure rclone\n        run: |\n          # Clean up any existing rclone config\n          rm -rf ~/.config/rclone\n\n          # Create rclone config directory\n          mkdir -p ~/.config/rclone\n\n          # Create rclone config file matching your existing configuration structure\n          cat > ~/.config/rclone/rclone.conf << EOF\n          [zohodrive]\n          type = \${RCLONE_CONFIG_ZOHODRIVE_TYPE}\n          region = com\n          token = \${RCLONE_CONFIG_ZOHODRIVE_TOKEN}\n          root_folder_id = \${RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID}\n          EOF\n\n          # Set proper permissions\n          chmod 600 ~/.config/rclone/rclone.conf\n\n          # Test configuration\n          echo "Testing rclone configuration..."\n          rclone ls zohodrive: --max-depth 1\n\n`;

			// Upload Android build files
			if (buildTypes.includes("dev")) {
				yaml += `      - name: 📤 Upload Development APK to Zoho Drive\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'dev' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "zohodrive:$FOLDER_PATH"\n\n          # Copy APK file\n          echo "Uploading development APK..."\n          rclone copy ./app-dev.apk "zohodrive:$FOLDER_PATH/app-dev-$VERSION-$BUILD_NUMBER.apk" -v\n\n`;
			}

			if (buildTypes.includes("prod-apk")) {
				yaml += `      - name: 📤 Upload Production APK to Zoho Drive\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-apk' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          echo "Uploading production APK..."\n          rclone copy ./app-prod.apk "zohodrive:$FOLDER_PATH/app-prod-$VERSION-$BUILD_NUMBER.apk" -v\n\n`;
			}

			if (buildTypes.includes("prod-aab")) {
				yaml += `      - name: 📤 Upload Production AAB to Zoho Drive\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-aab' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          echo "Uploading production AAB..."\n          rclone copy ./app-prod.aab "zohodrive:$FOLDER_PATH/app-prod-$VERSION-$BUILD_NUMBER.aab" -v\n\n`;
			}

			// Upload iOS files if iOS is enabled
			if (options.iOSSupport) {
				if (buildTypes.includes("dev")) {
					yaml += `      - name: 📤 Upload iOS Development App to Zoho Drive\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-dev') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first if it doesn't exist\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "zohodrive:$FOLDER_PATH"\n\n          # Copy App file\n          echo "Uploading iOS development app..."\n          rclone copy ./app-ios-dev.app "zohodrive:$FOLDER_PATH/app-ios-dev-$VERSION-$BUILD_NUMBER.app" -v\n\n`;
				}

				yaml += `      - name: 📤 Upload iOS Production IPA to Zoho Drive\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-prod') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first if it doesn't exist\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "zohodrive:$FOLDER_PATH"\n\n          # Copy IPA file\n          echo "Uploading iOS production IPA..."\n          rclone copy ./app-ios-prod.ipa "zohodrive:$FOLDER_PATH/app-ios-prod-$VERSION-$BUILD_NUMBER.ipa" -v\n\n`;
			}
		} else if (storageType === "google-drive") {
			// Google Drive configuration
			yaml += `      - name: 📤 Configure rclone\n        run: |\n          # Clean up any existing rclone config\n          rm -rf ~/.config/rclone\n\n          # Create rclone config directory\n          mkdir -p ~/.config/rclone\n\n          # Create rclone config file for Google Drive\n          cat > ~/.config/rclone/rclone.conf << EOF\n          [gdrive]\n          type = \${RCLONE_CONFIG_GDRIVE_TYPE}\n          token = \${RCLONE_CONFIG_GDRIVE_TOKEN}\n          root_folder_id = \${RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID}\n          EOF\n\n          # Set proper permissions\n          chmod 600 ~/.config/rclone/rclone.conf\n\n          # Test configuration\n          echo "Testing rclone configuration..."\n          rclone ls gdrive: --max-depth 1\n\n`;

			// Upload Android build files to Google Drive
			// Upload Android build files to Google Drive
			if (buildTypes.includes("dev")) {
				yaml += `      - name: 📤 Upload Development APK to Google Drive\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'dev' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "gdrive:$FOLDER_PATH"\n\n          # Copy APK file\n          echo "Uploading development APK..."\n          rclone copy ./app-dev.apk "gdrive:$FOLDER_PATH/app-dev-$VERSION-$BUILD_NUMBER.apk" -v\n\n`;
			}

			if (buildTypes.includes("prod-apk")) {
				yaml += `      - name: 📤 Upload Production APK to Google Drive\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-apk' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          echo "Uploading production APK..."\n          rclone copy ./app-prod.apk "gdrive:$FOLDER_PATH/app-prod-$VERSION-$BUILD_NUMBER.apk" -v\n\n`;
			}

			if (buildTypes.includes("prod-aab")) {
				yaml += `      - name: 📤 Upload Production AAB to Google Drive\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-aab' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          echo "Uploading production AAB..."\n          rclone copy ./app-prod.aab "gdrive:$FOLDER_PATH/app-prod-$VERSION-$BUILD_NUMBER.aab" -v\n\n`;
			}

			// Upload iOS files if iOS is enabled
			if (options.iOSSupport) {
				if (buildTypes.includes("dev")) {
					yaml += `      - name: 📤 Upload iOS Development App to Google Drive\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-dev') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first if it doesn't exist\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "gdrive:$FOLDER_PATH"\n\n          # Copy App file\n          echo "Uploading iOS development app..."\n          rclone copy ./app-ios-dev.app "gdrive:$FOLDER_PATH/app-ios-dev-$VERSION-$BUILD_NUMBER.app" -v\n\n`;
				}

				yaml += `      - name: 📤 Upload iOS Production IPA to Google Drive\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-prod') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first if it doesn't exist\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "gdrive:$FOLDER_PATH"\n\n          # Copy IPA file\n          echo "Uploading iOS production IPA..."\n          rclone copy ./app-ios-prod.ipa "gdrive:$FOLDER_PATH/app-ios-prod-$VERSION-$BUILD_NUMBER.ipa" -v\n\n`;
			}
		} else if (storageType === "custom") {
			// Custom cloud storage configuration
			yaml += `      - name: 📤 Configure cloud storage\n        run: |\n          # Clean up any existing rclone config\n          rm -rf ~/.config/rclone\n\n          # Create rclone config directory\n          mkdir -p ~/.config/rclone\n\n          # Create rclone config file\n          cat > ~/.config/rclone/rclone.conf << EOF\n          [cloud]\n          type = \${CLOUD_STORAGE_TYPE}\n          region = com\n          token = \${CLOUD_STORAGE_TOKEN}\n          root_folder_id = \${CLOUD_STORAGE_ROOT_ID}\n          EOF\n\n          # Set proper permissions\n          chmod 600 ~/.config/rclone/rclone.conf\n\n          # Test configuration\n          echo "Testing cloud storage configuration..."\n          rclone ls cloud: --max-depth 1\n\n`;

			// Upload build files to custom cloud storage
			if (buildTypes.includes("dev")) {
				yaml += `      - name: 📤 Upload Development APK to cloud storage\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'dev' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "cloud:$FOLDER_PATH"\n\n          # Copy APK file\n          echo "Uploading development APK..."\n          rclone copy ./app-dev.apk "cloud:$FOLDER_PATH/app-dev-$VERSION-$BUILD_NUMBER.apk" -v\n\n`;
			}

			if (buildTypes.includes("prod-apk")) {
				yaml += `      - name: 📤 Upload Production APK to cloud storage\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-apk' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          echo "Uploading production APK..."\n          rclone copy ./app-prod.apk "cloud:$FOLDER_PATH/app-prod-$VERSION-$BUILD_NUMBER.apk" -v\n\n`;
			}

			if (buildTypes.includes("prod-aab")) {
				yaml += `      - name: 📤 Upload Production AAB to cloud storage\n        if: github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'prod-aab' || github.event_name == 'push'`;

				if (options.iOSSupport) {
					yaml += ` && (matrix.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'android')`;
				}

				yaml += `\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          echo "Uploading production AAB..."\n          rclone copy ./app-prod.aab "cloud:$FOLDER_PATH/app-prod-$VERSION-$BUILD_NUMBER.aab" -v\n\n`;
			}

			// Upload iOS files if iOS is enabled
			if (options.iOSSupport) {
				if (buildTypes.includes("dev")) {
					yaml += `      - name: 📤 Upload iOS Development App to cloud storage\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-dev') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first if it doesn't exist\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "cloud:$FOLDER_PATH"\n\n          # Copy App file\n          echo "Uploading iOS development app..."\n          rclone copy ./app-ios-dev.app "cloud:$FOLDER_PATH/app-ios-dev-$VERSION-$BUILD_NUMBER.app" -v\n\n`;
				}

				yaml += `      - name: 📤 Upload iOS Production IPA to cloud storage\n        if: (github.event.inputs.buildType == 'all' || github.event.inputs.buildType == 'ios-prod') && (matrix.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == 'ios')\n        run: |\n          VERSION=$(node -p "require('./app.json').expo.version")\n          BUILD_NUMBER=$(date +%Y%m%d%H%M)\n          FOLDER_PATH="App Builds/$VERSION-$BUILD_NUMBER"\n\n          # Create directory first if it doesn't exist\n          echo "Creating folder: $FOLDER_PATH"\n          rclone mkdir "cloud:$FOLDER_PATH"\n\n          # Copy IPA file\n          echo "Uploading iOS production IPA..."\n          rclone copy ./app-ios-prod.ipa "cloud:$FOLDER_PATH/app-ios-prod-$VERSION-$BUILD_NUMBER.ipa" -v\n\n`;
			}
		}
	}

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

	// Add notification for build results if enabled
	if (options.notifications) {
		yaml += `\n      - name: 📢 Notify build completion\n        if: always()\n        uses: rtCamp/action-slack-notify@v2\n        env:\n          SLACK_WEBHOOK: \${{ env.SLACK_WEBHOOK }}\n          SLACK_COLOR: \${{ job.status == 'success' && 'good' || 'danger' }}\n          SLACK_TITLE: Build Results\n          SLACK_MESSAGE: 'Build \${{ job.status == "success" && "completed successfully ✅" || "failed ❌" }}'\n`;
	}

	return yaml;
};
