import { generateWorkflowYaml } from "../workflowGenerator";
import { FormValues, AdvancedOptions } from "../../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const defaultAdvancedOptions: AdvancedOptions = {
  iOSSupport: false,
  publishToExpo: false,
  publishToStores: false,
  jestTests: false,
  rntlTests: false,
  renderHookTests: false,
  caching: true,
  notifications: false,
};

function makeForm(overrides: Partial<FormValues> = {}): FormValues {
  return {
    storageType: "github-release",
    buildTypes: ["dev"],
    tests: [],
    triggers: ["push-main"],
    advancedOptions: { ...defaultAdvancedOptions },
    ...overrides,
  };
}

// ─── 1. YAML Structure Basics ────────────────────────────────────────────────

describe("generateWorkflowYaml — basic YAML structure", () => {
  it("returns a non-empty string", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(typeof yaml).toBe("string");
    expect(yaml.length).toBeGreaterThan(0);
  });

  it("always starts with the workflow name", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toMatch(/^name: React Native CI\/CD/);
  });

  it("always contains an `on:` section", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("\non:\n");
  });

  it("always contains an `env:` section with EXPO_TOKEN", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("env:");
    expect(yaml).toContain("EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}");
  });

  it("always contains a `jobs:` section", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("\njobs:\n");
  });

  it("always includes the check-skip job", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("check-skip:");
    expect(yaml).toContain("[skip ci]");
  });

  it("always includes NODE_OPTIONS env var", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("NODE_OPTIONS: --openssl-legacy-provider");
  });
});

// ─── 2. Triggers ─────────────────────────────────────────────────────────────

describe("generateWorkflowYaml — triggers", () => {
  it("generates push trigger for push-main", () => {
    const yaml = generateWorkflowYaml(makeForm({ triggers: ["push-main"] }));
    expect(yaml).toContain("push:");
    expect(yaml).toContain("branches: [main, master]");
  });

  it("generates pull_request trigger for pull-request", () => {
    const yaml = generateWorkflowYaml(makeForm({ triggers: ["pull-request"] }));
    expect(yaml).toContain("pull_request:");
    expect(yaml).toContain("branches: [main, master]");
  });

  it("generates workflow_dispatch for manual trigger", () => {
    const yaml = generateWorkflowYaml(makeForm({ triggers: ["manual"] }));
    expect(yaml).toContain("workflow_dispatch:");
    expect(yaml).toContain("buildType:");
    expect(yaml).toContain("type: choice");
  });

  it("includes dev option in manual dispatch when dev buildType selected", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ triggers: ["manual"], buildTypes: ["dev"] }),
    );
    expect(yaml).toContain("- dev\n");
  });

  it("includes prod-apk option in manual dispatch when prod-apk buildType selected", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ triggers: ["manual"], buildTypes: ["prod-apk"] }),
    );
    expect(yaml).toContain("- prod-apk\n");
  });

  it("includes prod-aab option in manual dispatch when prod-aab buildType selected", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ triggers: ["manual"], buildTypes: ["prod-aab"] }),
    );
    expect(yaml).toContain("- prod-aab\n");
  });

  it("always appends `- all` option in manual dispatch", () => {
    const yaml = generateWorkflowYaml(makeForm({ triggers: ["manual"] }));
    expect(yaml).toContain("- all\n");
  });

  it("includes multiple triggers simultaneously", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ triggers: ["push-main", "pull-request", "manual"] }),
    );
    expect(yaml).toContain("push:");
    expect(yaml).toContain("pull_request:");
    expect(yaml).toContain("workflow_dispatch:");
  });

  it("adds platform choice in manual dispatch when iOS support enabled", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        triggers: ["manual"],
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: true },
      }),
    );
    expect(yaml).toContain("platform:");
    expect(yaml).toContain("- android\n");
    expect(yaml).toContain("- ios\n");
  });
});

// ─── 3. Storage Types ─────────────────────────────────────────────────────────

describe("generateWorkflowYaml — storage types", () => {
  it("names build job `build-and-release` for github-release storage", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ storageType: "github-release" }),
    );
    expect(yaml).toContain("build-and-release:");
    expect(yaml).not.toContain("build-and-deploy:");
  });

  it("names build job `build-and-deploy` for non-github-release storage", () => {
    const yaml = generateWorkflowYaml(makeForm({ storageType: "zoho-drive" }));
    expect(yaml).toContain("build-and-deploy:");
    expect(yaml).not.toContain("build-and-release:");
  });

  it("injects ZOHO env vars for zoho-drive storage", () => {
    const yaml = generateWorkflowYaml(makeForm({ storageType: "zoho-drive" }));
    expect(yaml).toContain("RCLONE_CONFIG_ZOHODRIVE_TYPE:");
    expect(yaml).toContain("RCLONE_CONFIG_ZOHODRIVE_TOKEN:");
    expect(yaml).toContain("RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID:");
  });

  it("injects GDRIVE env vars for google-drive storage", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ storageType: "google-drive" }),
    );
    expect(yaml).toContain("RCLONE_CONFIG_GDRIVE_TYPE:");
    expect(yaml).toContain("RCLONE_CONFIG_GDRIVE_TOKEN:");
    expect(yaml).toContain("RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID:");
  });

  it("injects CLOUD_STORAGE env vars for custom storage", () => {
    const yaml = generateWorkflowYaml(makeForm({ storageType: "custom" }));
    expect(yaml).toContain("CLOUD_STORAGE_TYPE:");
    expect(yaml).toContain("CLOUD_STORAGE_TOKEN:");
    expect(yaml).toContain("CLOUD_STORAGE_ROOT_ID:");
  });

  it("creates GitHub Release step for github-release storage", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ storageType: "github-release" }),
    );
    expect(yaml).toContain("softprops/action-gh-release");
    expect(yaml).toContain("GITHUB_TOKEN:");
  });

  it("includes rclone setup step for zoho-drive", () => {
    const yaml = generateWorkflowYaml(makeForm({ storageType: "zoho-drive" }));
    expect(yaml).toContain("AnimMouse/setup-rclone");
  });

  it("includes rclone setup step for google-drive", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ storageType: "google-drive" }),
    );
    expect(yaml).toContain("AnimMouse/setup-rclone");
  });

  it("includes rclone setup step for custom storage", () => {
    const yaml = generateWorkflowYaml(makeForm({ storageType: "custom" }));
    expect(yaml).toContain("AnimMouse/setup-rclone");
  });

  it("does NOT inject any rclone env vars for github-release storage", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ storageType: "github-release" }),
    );
    expect(yaml).not.toContain("RCLONE_CONFIG_ZOHODRIVE");
    expect(yaml).not.toContain("RCLONE_CONFIG_GDRIVE");
    expect(yaml).not.toContain("CLOUD_STORAGE_TYPE:");
  });

  it("always uploads artifacts to GitHub regardless of storage type", () => {
    for (const storageType of [
      "github-release",
      "zoho-drive",
      "google-drive",
      "custom",
    ]) {
      const yaml = generateWorkflowYaml(makeForm({ storageType }));
      expect(yaml).toContain("actions/upload-artifact@v4");
      expect(yaml).toContain("retention-days: 7");
    }
  });
});

// ─── 4. Build Types ───────────────────────────────────────────────────────────

describe("generateWorkflowYaml — build types", () => {
  it("includes dev APK build step when dev is selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["dev"] }));
    expect(yaml).toContain("Build Development APK");
    expect(yaml).toContain("--profile development");
    expect(yaml).toContain("--output=./app-dev.apk");
  });

  it("includes prod APK build step when prod-apk is selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["prod-apk"] }));
    expect(yaml).toContain("Build Production APK");
    expect(yaml).toContain("--profile production-apk");
    expect(yaml).toContain("--output=./app-prod.apk");
  });

  it("includes prod AAB build step when prod-aab is selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["prod-aab"] }));
    expect(yaml).toContain("Build Production AAB");
    expect(yaml).toContain("--profile production");
    expect(yaml).toContain("--output=./app-prod.aab");
  });

  it("includes all three build steps when all build types selected", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ buildTypes: ["dev", "prod-apk", "prod-aab"] }),
    );
    expect(yaml).toContain("Build Development APK");
    expect(yaml).toContain("Build Production APK");
    expect(yaml).toContain("Build Production AAB");
  });

  it("includes dev APK artifact path when dev selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["dev"] }));
    expect(yaml).toContain("./app-dev.apk");
  });

  it("includes prod APK artifact path when prod-apk selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["prod-apk"] }));
    expect(yaml).toContain("./app-prod.apk");
  });

  it("includes prod AAB artifact path when prod-aab selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["prod-aab"] }));
    expect(yaml).toContain("./app-prod.aab");
  });

  it("uses --platform android for all Android build steps", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ buildTypes: ["dev", "prod-apk", "prod-aab"] }),
    );
    const androidBuilds = yaml
      .split("\n")
      .filter(
        (line) =>
          line.includes("eas build") && line.includes("--platform android"),
      );
    expect(androidBuilds.length).toBeGreaterThanOrEqual(3);
  });

  it("sets NODE_ENV=development for dev build", () => {
    const yaml = generateWorkflowYaml(makeForm({ buildTypes: ["dev"] }));
    expect(yaml).toContain("NODE_ENV: development");
  });

  it("sets NODE_ENV=production for prod builds", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ buildTypes: ["prod-apk", "prod-aab"] }),
    );
    expect(yaml).toContain("NODE_ENV: production");
  });

  it("always includes memory limit in build commands", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ buildTypes: ["dev", "prod-apk", "prod-aab"] }),
    );
    expect(yaml).toContain("--max_old_space_size=4096");
  });
});

// ─── 5. Test Job Generation ───────────────────────────────────────────────────

describe("generateWorkflowYaml — test job", () => {
  it("includes a test job when typescript test is selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ tests: ["typescript"] }));
    expect(yaml).toContain("  test:");
    expect(yaml).toContain("yarn tsc");
  });

  it("includes eslint step when eslint test is selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ tests: ["eslint"] }));
    expect(yaml).toContain("yarn lint");
  });

  it("includes prettier step when prettier test is selected", () => {
    const yaml = generateWorkflowYaml(makeForm({ tests: ["prettier"] }));
    expect(yaml).toContain("yarn format:check");
  });

  it("omits test job when no tests selected and no advanced test options", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        tests: [],
        advancedOptions: {
          ...defaultAdvancedOptions,
          jestTests: false,
          rntlTests: false,
          renderHookTests: false,
        },
      }),
    );
    expect(yaml).not.toContain("  test:");
  });

  it("test job needs check-skip when tests are present", () => {
    const yaml = generateWorkflowYaml(makeForm({ tests: ["typescript"] }));
    // In the test job block the `needs: check-skip` should appear
    expect(yaml).toMatch(/test:\s+needs: check-skip/);
  });

  it("build job needs test when tests are present", () => {
    const yaml = generateWorkflowYaml(makeForm({ tests: ["typescript"] }));
    expect(yaml).toMatch(/needs: test/);
  });

  it("build job needs check-skip when no tests", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        tests: [],
        advancedOptions: {
          ...defaultAdvancedOptions,
          jestTests: false,
          rntlTests: false,
          renderHookTests: false,
        },
      }),
    );
    // Build job should depend on check-skip, not test
    const buildJobSection = yaml.split("build-and-")[1] || "";
    expect(buildJobSection).toContain("needs: check-skip");
  });

  it("includes all test steps when all test types selected", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ tests: ["typescript", "eslint", "prettier"] }),
    );
    expect(yaml).toContain("yarn tsc");
    expect(yaml).toContain("yarn lint");
    expect(yaml).toContain("yarn format:check");
  });
});

// ─── 6. Advanced Options ──────────────────────────────────────────────────────

describe("generateWorkflowYaml — advanced options", () => {
  it("adds iOS env vars when iOSSupport is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: true },
      }),
    );
    expect(yaml).toContain("EXPO_APPLE_ID:");
    expect(yaml).toContain("EXPO_APPLE_PASSWORD:");
    expect(yaml).toContain("EXPO_TEAM_ID:");
  });

  it("does NOT add iOS env vars when iOSSupport is false", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: false },
      }),
    );
    expect(yaml).not.toContain("EXPO_APPLE_ID:");
  });

  it("adds matrix strategy for iOS support", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: true },
      }),
    );
    expect(yaml).toContain("strategy:");
    expect(yaml).toContain("matrix:");
    expect(yaml).toContain("macos-latest");
  });

  it("does NOT add matrix strategy without iOS support", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: false },
      }),
    );
    expect(yaml).not.toContain("strategy:");
    expect(yaml).not.toContain("matrix:");
  });

  it("adds iOS build steps when iOSSupport is true and dev is selected", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        buildTypes: ["dev"],
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: true },
      }),
    );
    expect(yaml).toContain("Build iOS Development");
    expect(yaml).toContain("--platform ios --profile development");
  });

  it("adds iOS production build step when iOSSupport is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        buildTypes: ["prod-apk"],
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: true },
      }),
    );
    expect(yaml).toContain("Build iOS Production");
    expect(yaml).toContain("--platform ios --profile production");
  });

  it("includes yarn cache steps when caching is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        tests: ["typescript"],
        advancedOptions: { ...defaultAdvancedOptions, caching: true },
      }),
    );
    expect(yaml).toContain("Setup yarn cache");
    expect(yaml).toContain("actions/cache@v3");
    expect(yaml).toContain("yarn.lock");
  });

  it("does NOT include yarn cache steps when caching is false", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        tests: ["typescript"],
        advancedOptions: { ...defaultAdvancedOptions, caching: false },
      }),
    );
    expect(yaml).not.toContain("Setup yarn cache");
  });

  it("includes Slack notification steps when notificationType is slack", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, notifications: true, notificationType: 'slack' },
      }),
    );
    expect(yaml).toContain("SLACK_WEBHOOK:");
    expect(yaml).toContain("rtCamp/action-slack-notify");
    expect(yaml).not.toContain("DISCORD_WEBHOOK:");
    expect(yaml).not.toContain("Ilshidur/action-discord");
  });

  it("includes Discord notification steps when notificationType is discord", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, notifications: true, notificationType: 'discord' },
      }),
    );
    expect(yaml).toContain("DISCORD_WEBHOOK:");
    expect(yaml).toContain("Ilshidur/action-discord@0.3.2");
    expect(yaml).not.toContain("SLACK_WEBHOOK:");
    expect(yaml).not.toContain("rtCamp/action-slack-notify");
  });

  it("includes both Slack and Discord when notificationType is both", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, notifications: true, notificationType: 'both' },
      }),
    );
    expect(yaml).toContain("SLACK_WEBHOOK:");
    expect(yaml).toContain("DISCORD_WEBHOOK:");
    expect(yaml).toContain("rtCamp/action-slack-notify");
    expect(yaml).toContain("Ilshidur/action-discord@0.3.2");
  });

  it("defaults to both when notificationType is undefined", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, notifications: true },
      }),
    );
    expect(yaml).toContain("SLACK_WEBHOOK:");
    expect(yaml).toContain("DISCORD_WEBHOOK:");
    expect(yaml).toContain("rtCamp/action-slack-notify");
    expect(yaml).toContain("Ilshidur/action-discord@0.3.2");
  });

  it("does NOT include notification steps when notifications is false", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, notifications: false },
      }),
    );
    expect(yaml).not.toContain("rtCamp/action-slack-notify");
    expect(yaml).not.toContain("Ilshidur/action-discord");
  });

  it("includes Jest test step when jestTests is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, jestTests: true },
      }),
    );
    expect(yaml).toContain("Run Jest Tests");
    expect(yaml).toContain("yarn test\n");
  });

  it("includes RNTL test step when rntlTests is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, rntlTests: true },
      }),
    );
    expect(yaml).toContain("Run React Native Testing Library Tests");
    expect(yaml).toContain("yarn test:rntl");
  });

  it("includes renderHook test step when renderHookTests is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, renderHookTests: true },
      }),
    );
    expect(yaml).toContain("Run renderHook Tests");
    expect(yaml).toContain("yarn test:hooks");
  });

  it("adds Expo publish step when publishToExpo is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        triggers: ["manual"],
        advancedOptions: { ...defaultAdvancedOptions, publishToExpo: true },
      }),
    );
    expect(yaml).toContain("Publish to Expo");
    expect(yaml).toContain("eas update --auto");
  });

  it("adds Play Store submit step when publishToStores is true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        triggers: ["manual"],
        advancedOptions: { ...defaultAdvancedOptions, publishToStores: true },
      }),
    );
    expect(yaml).toContain("Submit to Play Store");
    expect(yaml).toContain("eas submit -p android");
    expect(yaml).toContain("GOOGLE_PLAY_SERVICE_ACCOUNT:");
  });

  it("adds App Store submit step when both publishToStores and iOSSupport are true", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        triggers: ["manual"],
        advancedOptions: {
          ...defaultAdvancedOptions,
          publishToStores: true,
          iOSSupport: true,
        },
      }),
    );
    expect(yaml).toContain("Submit to App Store");
    expect(yaml).toContain("eas submit -p ios");
  });
});

// ─── 7. Default advancedOptions ───────────────────────────────────────────────

describe("generateWorkflowYaml — default advancedOptions", () => {
  it("does not throw when advancedOptions is undefined", () => {
    expect(() =>
      generateWorkflowYaml(makeForm({ advancedOptions: undefined })),
    ).not.toThrow();
  });

  it("applies caching by default (caching defaults to true)", () => {
    const yaml = generateWorkflowYaml(
      makeForm({ advancedOptions: undefined, buildTypes: ["dev"] }),
    );
    // caching defaults to true, so cache steps should appear
    expect(yaml).toContain("Setup yarn cache");
  });

  it("does not apply iOS env vars by default", () => {
    const yaml = generateWorkflowYaml(makeForm({ advancedOptions: undefined }));
    expect(yaml).not.toContain("EXPO_APPLE_ID:");
  });
});

// ─── 8. Edge Cases ────────────────────────────────────────────────────────────

describe("generateWorkflowYaml — edge cases", () => {
  it("handles empty buildTypes array without throwing", () => {
    expect(() =>
      generateWorkflowYaml(makeForm({ buildTypes: [] })),
    ).not.toThrow();
  });

  it("handles empty tests array without throwing", () => {
    expect(() => generateWorkflowYaml(makeForm({ tests: [] }))).not.toThrow();
  });

  it("handles empty triggers array without throwing", () => {
    expect(() =>
      generateWorkflowYaml(makeForm({ triggers: [] })),
    ).not.toThrow();
  });

  it("always fixes package.json main entry in build job", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("Fix package.json main entry");
    expect(yaml).toContain("node_modules/expo/AppEntry.js");
  });

  it("always updates metro.config.js in build job", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("Update metro.config.js for SVG support");
  });

  it("always installs EAS CLI in build job", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("yarn global add eas-cli@latest");
  });

  it("always verifies EAS CLI installation", () => {
    const yaml = generateWorkflowYaml(makeForm());
    expect(yaml).toContain("Verify EAS CLI installation");
    expect(yaml).toContain("eas --version");
  });

  it("build job uses ubuntu-latest by default (no iOS)", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: false },
      }),
    );
    // No matrix, so the runs-on should be ubuntu-latest (not conditional)
    expect(yaml).toContain("runs-on: ubuntu-latest");
    expect(yaml).not.toContain("matrix.platform");
  });

  it("build job uses conditional runner when iOS is enabled", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        advancedOptions: { ...defaultAdvancedOptions, iOSSupport: true },
      }),
    );
    expect(yaml).toContain("matrix.platform");
  });
});

// ─── 9. Snapshot Tests ────────────────────────────────────────────────────────

describe("generateWorkflowYaml — snapshots", () => {
  it("matches snapshot for minimal config (push-main, dev APK, github-release)", () => {
    const yaml = generateWorkflowYaml(
      makeForm({
        storageType: "github-release",
        buildTypes: ["dev"],
        tests: [],
        triggers: ["push-main"],
        advancedOptions: { ...defaultAdvancedOptions, caching: false },
      }),
    );
    expect(yaml).toMatchSnapshot();
  });

  it("matches snapshot for full config (all triggers, all builds, zoho-drive, all tests)", () => {
    const yaml = generateWorkflowYaml({
      storageType: "zoho-drive",
      buildTypes: ["dev", "prod-apk", "prod-aab"],
      tests: ["typescript", "eslint", "prettier"],
      triggers: ["push-main", "pull-request", "manual"],
      advancedOptions: {
        iOSSupport: false,
        publishToExpo: false,
        publishToStores: false,
        jestTests: true,
        rntlTests: false,
        renderHookTests: false,
        caching: true,
        notifications: false,
      },
    });
    expect(yaml).toMatchSnapshot();
  });

  it("matches snapshot for iOS + google-drive config", () => {
    const yaml = generateWorkflowYaml({
      storageType: "google-drive",
      buildTypes: ["dev", "prod-aab"],
      tests: ["typescript"],
      triggers: ["manual"],
      advancedOptions: {
        iOSSupport: true,
        publishToExpo: false,
        publishToStores: false,
        jestTests: false,
        rntlTests: false,
        renderHookTests: false,
        caching: true,
        notifications: false,
      },
    });
    expect(yaml).toMatchSnapshot();
  });
});
