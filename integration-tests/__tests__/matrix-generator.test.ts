import {
  generatePrMatrix,
  generateNightlyMatrix,
  generateEasMatrix,
  MatrixEntry,
} from "../scripts/matrix-generator";

describe("matrix-generator", () => {
  describe("generatePrMatrix", () => {
    let matrix: MatrixEntry[];

    beforeAll(() => {
      matrix = generatePrMatrix();
    });

    it("generates exactly 20 entries", () => {
      expect(matrix).toHaveLength(20);
    });

    it("every entry has a name, config, and fixture", () => {
      for (const entry of matrix) {
        expect(entry.name).toBeTruthy();
        expect(entry.config).toBeDefined();
        expect(entry.fixture).toMatch(/^(yarn|npm|pnpm)-app$/);
      }
    });

    it("has yarn, npm, and pnpm entries", () => {
      const pkgManagers = matrix.map(
        (e) => e.config.packageManager || "yarn"
      );
      expect(pkgManagers).toContain("yarn");
      expect(pkgManagers).toContain("npm");
      expect(pkgManagers).toContain("pnpm");
    });

    it("has entries with no tests", () => {
      const noTestEntries = matrix.filter(
        (e) =>
          e.config.tests.length === 0 &&
          !e.config.advancedOptions?.jestTests &&
          !e.config.advancedOptions?.rntlTests &&
          !e.config.advancedOptions?.renderHookTests
      );
      expect(noTestEntries.length).toBeGreaterThanOrEqual(2); // at least one per pkg mgr
    });

    it("has entries with all tests", () => {
      const allTestEntries = matrix.filter(
        (e) =>
          e.config.tests.includes("typescript") &&
          e.config.tests.includes("eslint") &&
          e.config.tests.includes("prettier") &&
          e.config.advancedOptions?.jestTests &&
          e.config.advancedOptions?.rntlTests &&
          e.config.advancedOptions?.renderHookTests
      );
      expect(allTestEntries.length).toBeGreaterThanOrEqual(2);
    });

    it("has entries with caching disabled", () => {
      const noCacheEntries = matrix.filter(
        (e) => e.config.advancedOptions?.caching === false
      );
      expect(noCacheEntries.length).toBeGreaterThanOrEqual(2);
    });

    it("fixture matches package manager", () => {
      for (const entry of matrix) {
        if (entry.config.packageManager === "npm") {
          expect(entry.fixture).toBe("npm-app");
        } else if (entry.config.packageManager === "pnpm") {
          expect(entry.fixture).toBe("pnpm-app");
        } else {
          expect(entry.fixture).toBe("yarn-app");
        }
      }
    });

    it("all entry names are unique", () => {
      const names = matrix.map((e) => e.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe("generateNightlyMatrix", () => {
    let matrix: MatrixEntry[];

    beforeAll(() => {
      matrix = generateNightlyMatrix();
    });

    it("generates more than 100 entries", () => {
      expect(matrix.length).toBeGreaterThan(100);
    });

    it("generates less than 500 entries (deduplicated)", () => {
      expect(matrix.length).toBeLessThan(500);
    });

    it("all entry names are unique", () => {
      const names = matrix.map((e) => e.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it("has all three package managers", () => {
      const pkgManagers = new Set(
        matrix.map((e) => e.config.packageManager || "yarn")
      );
      expect(pkgManagers.has("yarn")).toBe(true);
      expect(pkgManagers.has("npm")).toBe(true);
      expect(pkgManagers.has("pnpm")).toBe(true);
    });

    it("has entries with each individual test type", () => {
      const hasTypescript = matrix.some((e) =>
        e.config.tests.includes("typescript")
      );
      const hasEslint = matrix.some((e) =>
        e.config.tests.includes("eslint")
      );
      const hasPrettier = matrix.some((e) =>
        e.config.tests.includes("prettier")
      );
      const hasJest = matrix.some(
        (e) => e.config.advancedOptions?.jestTests
      );
      const hasRntl = matrix.some(
        (e) => e.config.advancedOptions?.rntlTests
      );
      const hasHooks = matrix.some(
        (e) => e.config.advancedOptions?.renderHookTests
      );

      expect(hasTypescript).toBe(true);
      expect(hasEslint).toBe(true);
      expect(hasPrettier).toBe(true);
      expect(hasJest).toBe(true);
      expect(hasRntl).toBe(true);
      expect(hasHooks).toBe(true);
    });

    it("has entries with caching disabled", () => {
      const noCacheEntries = matrix.filter(
        (e) => e.config.advancedOptions?.caching === false
      );
      expect(noCacheEntries.length).toBeGreaterThan(0);
    });

    it("fixture matches package manager for all entries", () => {
      for (const entry of matrix) {
        if (entry.config.packageManager === "npm") {
          expect(entry.fixture).toBe("npm-app");
        } else if (entry.config.packageManager === "pnpm") {
          expect(entry.fixture).toBe("pnpm-app");
        } else {
          expect(entry.fixture).toBe("yarn-app");
        }
      }
    });
  });

  describe("generateEasMatrix", () => {
    let matrix: MatrixEntry[];

    beforeAll(() => {
      matrix = generateEasMatrix();
    });

    it("generates exactly 9 entries", () => {
      expect(matrix).toHaveLength(9);
    });

    it("has 3 entries per package manager", () => {
      const yarnEntries = matrix.filter(
        (e) => e.config.packageManager === "yarn" || !e.config.packageManager
      );
      const npmEntries = matrix.filter(
        (e) => e.config.packageManager === "npm"
      );
      const pnpmEntries = matrix.filter(
        (e) => e.config.packageManager === "pnpm"
      );
      expect(yarnEntries).toHaveLength(3);
      expect(npmEntries).toHaveLength(3);
      expect(pnpmEntries).toHaveLength(3);
    });

    it("covers dev, prod-apk, and prod-aab build types", () => {
      const buildTypes = new Set(
        matrix.flatMap((e) => e.config.buildTypes)
      );
      expect(buildTypes.has("dev")).toBe(true);
      expect(buildTypes.has("prod-apk")).toBe(true);
      expect(buildTypes.has("prod-aab")).toBe(true);
    });

    it("all entry names are unique", () => {
      const names = matrix.map((e) => e.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });
});
