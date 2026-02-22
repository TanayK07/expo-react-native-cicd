import {
  extractTestJobCommands,
  extractBuildJobCommands,
  extractAllCommands,
  commandSignature,
  FormValues,
} from "../scripts/command-extractor";

function makeConfig(overrides: Partial<FormValues> = {}): FormValues {
  return {
    storageType: "github-release",
    buildTypes: ["dev"],
    tests: [],
    triggers: ["push-main"],
    packageManager: "yarn",
    advancedOptions: {
      iOSSupport: false,
      publishToExpo: false,
      publishToStores: false,
      jestTests: false,
      rntlTests: false,
      renderHookTests: false,
      caching: true,
      notifications: false,
    },
    ...overrides,
  };
}

describe("command-extractor", () => {
  describe("extractTestJobCommands", () => {
    it("returns empty array when no tests are selected", () => {
      const config = makeConfig({ tests: [] });
      const commands = extractTestJobCommands(config);
      expect(commands).toEqual([]);
    });

    it("extracts install and typecheck for typescript test", () => {
      const config = makeConfig({ tests: ["typescript"] });
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("cache-dir");
      expect(categories).toContain("install");
      expect(categories).toContain("typecheck");
    });

    it("extracts eslint command for eslint test", () => {
      const config = makeConfig({ tests: ["eslint"] });
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("lint");
    });

    it("extracts prettier command for prettier test", () => {
      const config = makeConfig({ tests: ["prettier"] });
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("format");
    });

    it("extracts jest command when jestTests enabled", () => {
      const config = makeConfig({
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
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("jest");
    });

    it("extracts rntl command when rntlTests enabled", () => {
      const config = makeConfig({
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: false,
          rntlTests: true,
          renderHookTests: false,
          caching: true,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("rntl");
    });

    it("extracts hooks command when renderHookTests enabled", () => {
      const config = makeConfig({
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: false,
          rntlTests: false,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("hooks");
    });

    it("uses yarn commands for yarn package manager", () => {
      const config = makeConfig({
        packageManager: "yarn",
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      const installCmd = commands.find((c) => c.category === "install");
      expect(installCmd?.command).toBe("yarn install");

      const typecheckCmd = commands.find((c) => c.category === "typecheck");
      expect(typecheckCmd?.command).toBe("yarn tsc");

      const lintCmd = commands.find((c) => c.category === "lint");
      expect(lintCmd?.command).toBe("yarn lint");

      const formatCmd = commands.find((c) => c.category === "format");
      expect(formatCmd?.command).toBe("yarn format:check");

      const jestCmd = commands.find((c) => c.category === "jest");
      expect(jestCmd?.command).toBe("yarn test");

      const rntlCmd = commands.find((c) => c.category === "rntl");
      expect(rntlCmd?.command).toBe("yarn test:rntl");

      const hooksCmd = commands.find((c) => c.category === "hooks");
      expect(hooksCmd?.command).toBe("yarn test:hooks");
    });

    it("uses npm commands for npm package manager", () => {
      const config = makeConfig({
        packageManager: "npm",
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      const installCmd = commands.find((c) => c.category === "install");
      expect(installCmd?.command).toBe("npm install");

      const typecheckCmd = commands.find((c) => c.category === "typecheck");
      expect(typecheckCmd?.command).toBe("npx tsc");

      const lintCmd = commands.find((c) => c.category === "lint");
      expect(lintCmd?.command).toBe("npm run lint");

      const formatCmd = commands.find((c) => c.category === "format");
      expect(formatCmd?.command).toBe("npm run format:check");

      const jestCmd = commands.find((c) => c.category === "jest");
      expect(jestCmd?.command).toBe("npm test");

      const rntlCmd = commands.find((c) => c.category === "rntl");
      expect(rntlCmd?.command).toBe("npm run test:rntl");

      const hooksCmd = commands.find((c) => c.category === "hooks");
      expect(hooksCmd?.command).toBe("npm run test:hooks");
    });

    it("skips cache-dir when caching is disabled", () => {
      const config = makeConfig({
        tests: ["typescript"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: false,
          rntlTests: false,
          renderHookTests: false,
          caching: false,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).not.toContain("cache-dir");
    });

    it("all test job commands have no GHA expressions", () => {
      const config = makeConfig({
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      for (const cmd of commands) {
        expect(cmd.hasGHAExpressions).toBe(false);
      }
    });

    it("extracts all commands for all-tests config", () => {
      const config = makeConfig({
        tests: ["typescript", "eslint", "prettier"],
        advancedOptions: {
          iOSSupport: false,
          publishToExpo: false,
          publishToStores: false,
          jestTests: true,
          rntlTests: true,
          renderHookTests: true,
          caching: true,
          notifications: false,
        },
      });
      const commands = extractTestJobCommands(config);

      // Should have: cache-dir, install, typecheck, lint, format, jest, rntl, hooks
      expect(commands.length).toBe(8);
    });
  });

  describe("extractBuildJobCommands", () => {
    it("extracts install and cache-dir from build job", () => {
      const config = makeConfig();
      const commands = extractBuildJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).toContain("install");
      expect(categories).toContain("cache-dir");
    });

    it("excludes build commands by default", () => {
      const config = makeConfig();
      const commands = extractBuildJobCommands(config);

      const categories = commands.map((c) => c.category);
      expect(categories).not.toContain("build");
    });

    it("includes build commands when requested", () => {
      const config = makeConfig();
      const commands = extractBuildJobCommands(config, {
        includeBuildCommands: true,
      });

      expect(commands.length).toBeGreaterThan(0);
    });
  });

  describe("commandSignature", () => {
    it("produces same signature for identical configs", () => {
      const config1 = makeConfig({ tests: ["typescript", "eslint"] });
      const config2 = makeConfig({ tests: ["typescript", "eslint"] });
      expect(commandSignature(config1)).toBe(commandSignature(config2));
    });

    it("produces different signatures for different test sets", () => {
      const config1 = makeConfig({ tests: ["typescript"] });
      const config2 = makeConfig({ tests: ["eslint"] });
      expect(commandSignature(config1)).not.toBe(commandSignature(config2));
    });

    it("produces different signatures for different package managers", () => {
      const config1 = makeConfig({
        packageManager: "yarn",
        tests: ["typescript"],
      });
      const config2 = makeConfig({
        packageManager: "npm",
        tests: ["typescript"],
      });
      expect(commandSignature(config1)).not.toBe(commandSignature(config2));
    });

    it("produces same signature regardless of non-execution axes", () => {
      const config1 = makeConfig({
        tests: ["typescript"],
        storageType: "github-release",
      });
      const config2 = makeConfig({
        tests: ["typescript"],
        storageType: "google-drive",
      });
      // These differ in storageType but not in test commands
      expect(commandSignature(config1)).toBe(commandSignature(config2));
    });
  });

  describe("extractAllCommands", () => {
    it("combines test and build job commands", () => {
      const config = makeConfig({
        tests: ["typescript"],
      });
      const commands = extractAllCommands(config);

      // Should have commands from both test and build jobs
      expect(commands.length).toBeGreaterThan(0);
    });

    it("filters GHA expressions by default", () => {
      const config = makeConfig({
        tests: ["typescript"],
      });
      const commands = extractAllCommands(config);

      for (const cmd of commands) {
        expect(cmd.hasGHAExpressions).toBe(false);
      }
    });
  });
});
