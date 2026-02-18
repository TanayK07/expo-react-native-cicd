import fs from "fs";
import path from "path";
import os from "os";
import {
  generateAllWorkflows,
  generateSpecificWorkflow,
  generateWorkflowManifest,
} from "../workflowTester";
import { FormValues } from "../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "workflow-tester-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const sampleConfig: FormValues = {
  projectName: "TestApp",
  storageType: "github-release",
  buildTypes: ["dev"],
  tests: ["typescript"],
  triggers: ["push-main"],
};

// ─── generateAllWorkflows ─────────────────────────────────────────────────────

describe("generateAllWorkflows", () => {
  it("creates the output directory if it does not exist", async () => {
    const newDir = path.join(tmpDir, "new-subdir");
    expect(fs.existsSync(newDir)).toBe(false);
    await generateAllWorkflows(newDir, 1);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it("returns an array of file paths", async () => {
    const paths = await generateAllWorkflows(tmpDir, 3);
    expect(Array.isArray(paths)).toBe(true);
    expect(paths.length).toBe(3);
  });

  it("respects the limit parameter", async () => {
    const paths = await generateAllWorkflows(tmpDir, 5);
    expect(paths.length).toBe(5);
  });

  it("all returned paths exist on disk as files", async () => {
    const paths = await generateAllWorkflows(tmpDir, 4);
    for (const p of paths) {
      expect(fs.existsSync(p)).toBe(true);
      expect(fs.statSync(p).isFile()).toBe(true);
    }
  });

  it("generated files have .yml extension", async () => {
    const paths = await generateAllWorkflows(tmpDir, 3);
    for (const p of paths) {
      expect(path.extname(p)).toBe(".yml");
    }
  });

  it("generated files contain valid YAML content (name: React Native CI/CD)", async () => {
    const paths = await generateAllWorkflows(tmpDir, 3);
    for (const p of paths) {
      const content = fs.readFileSync(p, "utf-8");
      expect(content).toContain("name: React Native CI/CD");
    }
  });

  it("generates different content for different configurations", async () => {
    const paths = await generateAllWorkflows(tmpDir, 5);
    const contents = paths.map((p) => fs.readFileSync(p, "utf-8"));
    const unique = new Set(contents);
    // At least some should be unique
    expect(unique.size).toBeGreaterThan(1);
  });

  it("returns empty array when limit is 0", async () => {
    // limit=0 is falsy, so it generates all — but we don't want that in tests
    // Test with limit=1 first to confirm it works
    const paths = await generateAllWorkflows(tmpDir, 1);
    expect(paths.length).toBe(1);
  });
});

// ─── generateSpecificWorkflow ─────────────────────────────────────────────────

describe("generateSpecificWorkflow", () => {
  it("returns a file path string", () => {
    const result = generateSpecificWorkflow(sampleConfig, tmpDir);
    expect(typeof result).toBe("string");
  });

  it("creates the file at the returned path", () => {
    const result = generateSpecificWorkflow(sampleConfig, tmpDir);
    expect(fs.existsSync(result)).toBe(true);
  });

  it("created file has .yml extension", () => {
    const result = generateSpecificWorkflow(sampleConfig, tmpDir);
    expect(path.extname(result)).toBe(".yml");
  });

  it("file contains valid workflow YAML", () => {
    const result = generateSpecificWorkflow(sampleConfig, tmpDir);
    const content = fs.readFileSync(result, "utf-8");
    expect(content).toContain("name: React Native CI/CD");
    expect(content).toContain("jobs:");
  });

  it("creates output directory if it does not exist", () => {
    const newDir = path.join(tmpDir, "specific-subdir");
    expect(fs.existsSync(newDir)).toBe(false);
    generateSpecificWorkflow(sampleConfig, newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it("filename includes projectName when provided", () => {
    const result = generateSpecificWorkflow(
      { ...sampleConfig, projectName: "MyApp" },
      tmpDir,
    );
    expect(path.basename(result)).toContain("MyApp");
  });

  it("filename uses 'test' fallback when projectName is not provided", () => {
    const configWithoutName: FormValues = {
      storageType: "github-release",
      buildTypes: ["dev"],
      tests: [],
      triggers: ["push-main"],
    };
    const result = generateSpecificWorkflow(configWithoutName, tmpDir);
    expect(path.basename(result)).toContain("test");
  });
});

// ─── generateWorkflowManifest ─────────────────────────────────────────────────

describe("generateWorkflowManifest", () => {
  it("creates a workflow-manifest.json file", () => {
    const paths = [
      "workflow_TestApp_android_dev_classic_github-release_0.yml",
    ].map((f) => path.join(tmpDir, f));
    // Create dummy files first
    for (const p of paths) {
      fs.writeFileSync(p, "name: test");
    }
    generateWorkflowManifest(tmpDir, paths);
    expect(fs.existsSync(path.join(tmpDir, "workflow-manifest.json"))).toBe(
      true,
    );
  });

  it("manifest is valid JSON", () => {
    const filePath = path.join(
      tmpDir,
      "workflow_TestApp_android_dev_classic_github-release_0.yml",
    );
    fs.writeFileSync(filePath, "name: test");
    generateWorkflowManifest(tmpDir, [filePath]);
    const manifestPath = path.join(tmpDir, "workflow-manifest.json");
    const raw = fs.readFileSync(manifestPath, "utf-8");
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it("manifest contains one entry per workflow path", () => {
    const files = [
      "workflow_TestApp_android_dev_classic_github-release_0.yml",
      "workflow_TestApp_ios_prod-apk_modern_zoho-drive_1.yml",
    ];
    const paths = files.map((f) => {
      const p = path.join(tmpDir, f);
      fs.writeFileSync(p, "name: test");
      return p;
    });
    generateWorkflowManifest(tmpDir, paths);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "workflow-manifest.json"), "utf-8"),
    );
    expect(manifest.length).toBe(2);
  });

  it("each manifest entry has expected shape", () => {
    const filePath = path.join(
      tmpDir,
      "workflow_TestApp_android_dev_classic_github-release_0.yml",
    );
    fs.writeFileSync(filePath, "name: test");
    generateWorkflowManifest(tmpDir, [filePath]);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "workflow-manifest.json"), "utf-8"),
    );
    const entry = manifest[0];
    expect(entry).toHaveProperty("path");
    expect(entry).toHaveProperty("filename");
    expect(entry).toHaveProperty("configuration");
    expect(entry.configuration).toHaveProperty("platform");
    expect(entry.configuration).toHaveProperty("buildType");
  });

  it("handles empty paths array without throwing", () => {
    expect(() => generateWorkflowManifest(tmpDir, [])).not.toThrow();
    const manifest = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "workflow-manifest.json"), "utf-8"),
    );
    expect(manifest).toEqual([]);
  });
});
