"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Prism, SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import MermaidDiagram from "../components/MermaidDiagram";
import { useSearchParams } from "next/navigation";

export default function Documentation() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("overview");
  const SyntaxHighlighter = Prism as any as React.FC<SyntaxHighlighterProps>;

  useEffect(() => {
    // Read from URL query parameter if present
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "overview",
        "architecture",
        "setup",
        "secrets",
        "storage",
        "faq",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 max-w-full xl:max-w-7xl 2xl:max-w-screen-2xl">
      <section className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Expo React Native CI/CD Documentation
        </h1>
        <p className="text-xl mb-6 text-gray-800 dark:text-gray-200">
          A comprehensive guide to setting up automated builds and deployments
        </p>
        <Link
          href="/"
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          ← Back to Workflow Generator
        </Link>
      </section>

      {/* Documentation Navigation */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "overview"
                ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "architecture"
                ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "setup"
                ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Setup Guide
          </button>
          <button
            onClick={() => setActiveTab("secrets")}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "secrets"
                ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Secret Configuration
          </button>
          <button
            onClick={() => setActiveTab("storage")}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "storage"
                ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Storage Options
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "faq"
                ? "text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            FAQ
          </button>
        </div>
      </div>

      {/* Documentation Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Free React Native & Expo CI/CD Builder
            </h2>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Save hundreds of dollars monthly on Expo EAS build costs by
              leveraging GitHub Actions to build your React Native and Expo
              applications. Our workflow generator creates custom GitHub Actions
              workflows tailored to your specific needs, enabling you to:
            </p>

            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Build development and production versions of your app</li>
              <li>Run automated tests before building</li>
              <li>Generate APK, AAB, and iOS builds</li>
              <li>Deploy to multiple storage destinations</li>
              <li>Publish to app stores and Expo</li>
              <li>Receive notifications on build status</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Key Benefits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  💰 Cost Savings
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Avoid Expo EAS build plans costing $15-100/month by using
                  GitHub Actions' free tier minutes.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  ⚡ Local EAS Builds
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Run EAS builds locally on GitHub runners, maintaining all the
                  benefits of the EAS build system.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  🔄 Complete CI/CD Pipeline
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  From code testing to app distribution in one workflow,
                  triggered manually or automatically.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  📱 Multiple Build Formats
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Build development APKs, production APKs, and AABs for Google
                  Play Store submission.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              How It Works
            </h3>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              The workflow leverages GitHub Actions to execute the following
              steps:
            </p>

            <ol className="list-decimal pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Check out your repository code</li>
              <li>Set up Node.js and the Expo EAS CLI</li>
              <li>
                Run any configured tests (TypeScript, ESLint, Prettier, Jest,
                etc.)
              </li>
              <li>Build your app using EAS CLI in local mode</li>
              <li>
                Upload build artifacts to your selected storage destination
              </li>
              <li>Optionally publish to app stores or Expo</li>
              <li>Send notifications about build results</li>
            </ol>

            <p className="text-gray-700 dark:text-gray-300">
              All of this is configured through our simple workflow generator,
              which creates a custom GitHub Actions workflow file that you can
              add to your repository.
            </p>
          </div>
        )}

        {activeTab === "architecture" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Workflow Architecture
            </h2>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Understanding the architecture of our CI/CD workflow helps you
              customize it for your specific needs and troubleshoot any issues
              that arise.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Workflow Structure
            </h3>

            <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="mb-6">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Triggers
                </h4>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>
                    <strong>Push to main/master:</strong> Automatically run on
                    code pushes to main branches
                  </li>
                  <li>
                    <strong>Pull requests:</strong> Run on PRs to verify changes
                  </li>
                  <li>
                    <strong>Manual dispatch:</strong> Trigger builds manually
                    with customizable parameters
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Jobs
                </h4>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>
                    <strong>check-skip:</strong> Checks if the CI should be
                    skipped based on commit message
                  </li>
                  <li>
                    <strong>test:</strong> Runs all configured tests
                  </li>
                  <li>
                    <strong>build-and-deploy/build-and-release:</strong> Builds
                    the app and uploads artifacts
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Build Matrix (with iOS support)
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  When iOS support is enabled, the workflow uses a matrix
                  strategy to build for both platforms:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>
                    Android builds run on{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                      ubuntu-latest
                    </code>{" "}
                    runners
                  </li>
                  <li>
                    iOS builds run on{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                      macos-latest
                    </code>{" "}
                    runners
                  </li>
                </ul>
              </div>
            </div>

            {/* Replace this section in your architecture tab */}
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Flow Diagram
            </h3>
            <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-white dark:bg-gray-800 p-4">
                <MermaidDiagram
                  chart={`flowchart LR
        %% Define minimalistic node styles
        classDef default fill:#EBF5FF,stroke:#3B82F6,color:#1E40AF,rounded,padding:6px;
        classDef decision fill:white,stroke:#3B82F6,color:#1E40AF,rounded;
        classDef endpoint fill:white,stroke:#3B82F6,color:#1E40AF;
        classDef error fill:#FEF2F2,stroke:#EF4444,color:#991B1B;
        
        A[Start] --> B{Skip?}
        B -->|No| C[Tests]
        B -->|Yes| J[End]
        C -->|Pass| D[Setup]
        C -->|Fail| K[Notify]
        D --> E[Build]
        E --> F[Artifacts]
        F --> G[Upload]
        G --> H{Publish?}
        H -->|Yes| I[Submit]
        H -->|No| J
        I --> J
        K --> J
        
        %% Apply the classes
        class B,H decision;
        class J endpoint;
        class K error;`}
                  className="max-w-full mx-auto"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              EAS Local Build Process
            </h3>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              The core of this workflow is running EAS builds locally on GitHub
              Actions runners instead of using Expo's build service. Here's how
              it works:
            </p>

            <ol className="list-decimal pl-6 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Install the EAS CLI on the GitHub runner</li>
              <li>Configure the environment with necessary secrets</li>
              <li>Fix package.json main entry to ensure compatibility</li>
              <li>Update metro.config.js to support SVG files</li>
              <li>
                Run EAS build with the{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                  --local
                </code>{" "}
                flag to build on the runner instead of Expo's servers
              </li>
              <li>Output the build artifacts to a specified location</li>
              <li>Upload the artifacts to storage</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
              <h4 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">
                Limitations
              </h4>
              <ul className="list-disc pl-6 text-yellow-800 dark:text-yellow-300 space-y-1">
                <li>
                  GitHub Actions free tier has limited minutes (2000/month for
                  private repos)
                </li>
                <li>
                  iOS builds require macOS runners, which consume minutes faster
                </li>
                <li>
                  Complex builds might timeout on the default runner timeout (6
                  hours)
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "setup" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Setup Guide
            </h2>

            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Follow these steps to set up the CI/CD workflow for your React
              Native or Expo project:
            </p>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 text-sm font-bold">
                    1
                  </span>
                  Generate Your Workflow File
                </h3>
                <ol className="list-decimal pl-8 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    Go to the{" "}
                    <Link
                      href="/"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Workflow Generator
                    </Link>{" "}
                    page
                  </li>
                  <li>
                    Configure your workflow options:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        Storage type (GitHub Release, Zoho Drive, Google Drive,
                        Custom)
                      </li>
                      <li>
                        Build types (Development APK, Production APK, Production
                        AAB)
                      </li>
                      <li>Tests to run (TypeScript, ESLint, Prettier)</li>
                      <li>Workflow triggers (Push to main, PR, Manual)</li>
                      <li>
                        Advanced options (iOS support, publishing,
                        notifications)
                      </li>
                    </ul>
                  </li>
                  <li>
                    Click "Generate Workflow" to create your custom workflow
                    file
                  </li>
                  <li>Copy the generated YAML content</li>
                </ol>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 text-sm font-bold">
                    2
                  </span>
                  Add the Workflow to Your Repository
                </h3>
                <ol className="list-decimal pl-8 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    In your React Native/Expo project repository, create the
                    directory{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                      .github/workflows/
                    </code>{" "}
                    if it doesn't exist
                  </li>
                  <li>
                    Create a new file named{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                      react-native-cicd.yml
                    </code>{" "}
                    in this directory
                  </li>
                  <li>Paste the generated workflow YAML into this file</li>
                  <li>Commit and push the changes to your repository</li>
                </ol>
                <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded p-3">
                  <code className="text-sm text-gray-700 dark:text-gray-300">
                    mkdir -p .github/workflows
                    <br />
                    touch .github/workflows/react-native-cicd.yml
                  </code>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 text-sm font-bold">
                    3
                  </span>
                  Configure Repository Secrets
                </h3>
                <ol className="list-decimal pl-8 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Go to your GitHub repository</li>
                  <li>
                    Navigate to Settings &gt; Secrets and variables &gt; Actions
                  </li>
                  <li>
                    Add the required secrets for your configuration:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                          EXPO_TOKEN
                        </code>{" "}
                        - Required for all workflows
                      </li>
                      <li>
                        Storage-specific secrets (depends on your selection)
                      </li>
                      <li>iOS-specific secrets (if iOS support is enabled)</li>
                      <li>Publishing secrets (if publishing is enabled)</li>
                    </ul>
                  </li>
                </ol>
                <p className="mt-3 text-gray-700 dark:text-gray-300">
                  See the{" "}
                  <button
                    onClick={() => setActiveTab("secrets")}
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Secret Configuration
                  </button>{" "}
                  section for detailed information on each secret.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 text-sm font-bold">
                    4
                  </span>
                  Update Your EAS Configuration
                </h3>
                <p className="mb-3 text-gray-700 dark:text-gray-300">
                  Ensure your project has a proper{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                    eas.json
                  </code>{" "}
                  file with the correct build profiles:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
                  <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 text-sm font-medium">
                    eas.json
                  </div>
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: 0 }}
                  >
                    {`{
  "cli": {
    "version": ">= 3.14.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production-apk": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}`}
                  </SyntaxHighlighter>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-8 h-8 flex items-center justify-center rounded-full mr-2 text-sm font-bold">
                    5
                  </span>
                  Trigger Your Workflow
                </h3>
                <p className="mb-3 text-gray-700 dark:text-gray-300">
                  Depending on the triggers you configured, your workflow will
                  run automatically on:
                </p>
                <ul className="list-disc pl-8 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Pushes to the main/master branch</li>
                  <li>New pull requests</li>
                </ul>
                <p className="mt-3 text-gray-700 dark:text-gray-300">
                  For manual triggers:
                </p>
                <ol className="list-decimal pl-8 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Go to the Actions tab in your GitHub repository</li>
                  <li>Select the "React Native CI/CD" workflow</li>
                  <li>Click "Run workflow"</li>
                  <li>Select the branch and configure any input parameters</li>
                  <li>Click "Run workflow" to start the build</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeTab === "secrets" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Secret Configuration
            </h2>

            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Your workflow requires various secrets to access services and
              APIs. Here's a comprehensive guide to all secrets you might need
              to configure based on your selected options.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Core Secrets
            </h3>

            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Secret Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      EXPO_TOKEN
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      Authentication token for Expo services, required for all
                      workflows
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      ExponentTokenXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                How to Get an Expo Token
              </h4>
              <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                <li>
                  Install the Expo CLI:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                    npm install -g expo-cli
                  </code>
                </li>
                <li>
                  Login to your Expo account:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                    expo login
                  </code>
                </li>
                <li>
                  Generate a token:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                    expo fetch:ios:certs
                  </code>{" "}
                  (you don't need to actually fetch certs)
                </li>
                <li>When prompted, choose to create a new access token</li>
                <li>
                  Copy the token and add it to your GitHub repository secrets
                </li>
              </ol>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              iOS-Specific Secrets
            </h3>

            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Secret Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      EXPO_APPLE_ID
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      Apple ID email address for App Store Connect
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      developer@example.com
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      EXPO_APPLE_PASSWORD
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      App-specific password for your Apple ID (not your main
                      password)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      xxxx-xxxx-xxxx-xxxx
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      EXPO_TEAM_ID
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      Apple Developer Team ID
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      A1BC23DEF4
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Storage-Specific Secrets
            </h3>

            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                GitHub Release (No Additional Secrets)
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                When using GitHub Releases as your storage option, no additional
                secrets are required beyond the core secrets. The workflow uses
                the automatically provided{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                  GITHUB_TOKEN
                </code>{" "}
                secret.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                Zoho Drive
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Secret Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        RCLONE_CONFIG_ZOHODRIVE_TYPE
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        Type of the rclone configuration
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        zoho
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        RCLONE_CONFIG_ZOHODRIVE_TOKEN
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        OAuth token for Zoho Drive
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {`{"token": {"access_token": "xxxx", "token_type": "bearer", "refresh_token": "xxxx", "expiry": "2023-01-01T00:00:00Z"}}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        ID of the Zoho Drive folder
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        12345abcdef
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                Google Drive
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Secret Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        RCLONE_CONFIG_GDRIVE_TYPE
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        Type of the rclone configuration
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        drive
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        RCLONE_CONFIG_GDRIVE_TOKEN
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        OAuth token for Google Drive
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {`{"access_token":"xxxx","token_type":"Bearer","refresh_token":"xxxx","expiry":"2023-01-01T00:00:00Z"}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        ID of the Google Drive folder
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        1ABC_defGHIjklMNop-qrsTU
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Publishing Secrets
            </h3>

            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                Google Play Store
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Secret Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        GOOGLE_PLAY_SERVICE_ACCOUNT
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        JSON key file content for Google Play service account
                        with permissions to upload apps
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2">
                  Example (formatted for visibility, should be one line when
                  used):
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                  <code className="text-gray-800 dark:text-gray-300 text-xs">
                    {`{"type":"service_account","project_id":"your-project-id","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"}`}
                  </code>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Notification Secrets
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Secret Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      SLACK_WEBHOOK
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      Webhook URL for Slack notifications
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      DISCORD_WEBHOOK
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      Webhook URL for Discord notifications
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "storage" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Storage Options
            </h2>

            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Our workflow supports multiple storage destinations for your build
              artifacts. Choose the option that best fits your team's workflow
              and infrastructure.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  GitHub Release
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Create GitHub releases with your builds attached as
                      assets. This is the simplest option that requires no
                      additional configuration.
                    </p>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Benefits:
                    </h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                      <li>No additional services required</li>
                      <li>Easy sharing with stakeholders via release URLs</li>
                      <li>Automatic versioning and changelog generation</li>
                      <li>Simple integration with GitHub ecosystem</li>
                    </ul>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Setup:
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      No additional setup required. The workflow uses the{" "}
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
                        GITHUB_TOKEN
                      </code>{" "}
                      which is provided automatically.
                    </p>
                  </div>
                  <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Example Release:
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-semibold">
                        Release v1.2.0-202301010530
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Published January 1, 2023
                      </p>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mb-2">
                        <p className="font-semibold mb-1">Assets:</p>
                        <ul className="text-primary-600 dark:text-primary-400 space-y-1">
                          <li>📱 app-dev.apk</li>
                          <li>📱 app-prod.apk</li>
                          <li>📱 app-prod.aab</li>
                        </ul>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <p className="font-semibold mb-1">Changelog:</p>
                        <ul className="text-xs space-y-1">
                          <li>- Fix user authentication bug</li>
                          <li>- Add new dashboard features</li>
                          <li>- Update dependencies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Zoho Drive
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Upload build artifacts to Zoho Drive, a cloud storage
                      service that's part of the Zoho Office Suite. Good for
                      teams already using Zoho Workplace.
                    </p>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Benefits:
                    </h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                      <li>Integration with Zoho Workplace suite</li>
                      <li>Organized folder structure by version</li>
                      <li>Secure sharing with team members</li>
                      <li>5GB free storage in the basic plan</li>
                    </ul>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Setup:
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      Configure rclone with Zoho Drive and set up the required
                      secrets. See the detailed guide below.
                    </p>
                  </div>
                  <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      rclone Setup Guide:
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <p>1. Install rclone locally:</p>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                        curl https://rclone.org/install.sh | sudo bash
                      </div>
                      <p>2. Configure Zoho Drive:</p>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                        rclone config
                      </div>
                      <p>
                        3. Create a new remote named "zohodrive" and select
                        "zoho" as the type
                      </p>
                      <p>4. Complete the OAuth setup process</p>
                      <p>5. View your configuration:</p>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono">
                        rclone config file
                      </div>
                      <p>6. Add the configuration values as GitHub secrets</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Google Drive
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Store builds in Google Drive for easy access and sharing.
                      Perfect for teams using Google Workspace.
                    </p>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Benefits:
                    </h4>
                    <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                      <li>Free 15GB storage with every Google account</li>
                      <li>Easy sharing and permission management</li>
                      <li>Integration with Google Workspace</li>
                      <li>Familiar interface for most team members</li>
                    </ul>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Setup:
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Configure rclone with Google Drive and set up the required
                      secrets. The setup process is similar to Zoho Drive but
                      uses the "drive" provider.
                    </p>
                  </div>
                  <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Example Folder Structure:
                    </h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="mr-2">📁</span>
                          <span>App Builds</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">┣━ 📁</span>
                          <span>1.2.0-202301010530</span>
                        </li>
                        <li className="flex items-start pl-8">
                          <span className="mr-2">┣━ 📱</span>
                          <span>app-dev-1.2.0-202301010530.apk</span>
                        </li>
                        <li className="flex items-start pl-8">
                          <span className="mr-2">┣━ 📱</span>
                          <span>app-prod-1.2.0-202301010530.apk</span>
                        </li>
                        <li className="flex items-start pl-8">
                          <span className="mr-2">┗━ 📱</span>
                          <span>app-prod-1.2.0-202301010530.aab</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">┗━ 📁</span>
                          <span>1.2.1-202301150045</span>
                        </li>
                        <li className="flex items-start pl-8">
                          <span className="mr-2">┗━ ...</span>
                          <span></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Custom Storage
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  The custom storage option allows you to configure any storage
                  provider supported by rclone. This provides maximum
                  flexibility for teams with specific storage requirements.
                </p>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Supported Providers:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    Amazon S3
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    Azure Blob Storage
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    Backblaze B2
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    Dropbox
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    FTP
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    WebDAV
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    OneDrive
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-300">
                    Box
                  </div>
                </div>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  To configure a custom storage provider, follow the rclone
                  documentation for your specific provider and add the
                  configuration as secrets in your GitHub repository.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  How much money can I save by using this workflow?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Expo's EAS build service costs between $15-100/month depending
                  on the plan. By using our GitHub Actions workflow, you can
                  save this entire amount, as GitHub provides 2,000 minutes of
                  free GitHub Actions usage per month for private repositories
                  (and unlimited for public repos). A typical React Native build
                  takes 10-20 minutes, so you could run 100-200 builds per month
                  within the free tier.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Is this officially supported by Expo?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  While this workflow uses the official Expo EAS CLI, the
                  workflow itself is not officially supported by Expo. It
                  leverages the EAS CLI's "--local" flag to run builds on GitHub
                  runners rather than Expo's build service. This is a legitimate
                  use case that Expo supports, but if you encounter issues
                  specific to the local build process, you may need to
                  troubleshoot them yourself or seek help from the community.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Can I use this with my existing Expo project?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes, this workflow is designed to work with any Expo or React
                  Native project. You'll need to ensure your project has a valid
                  eas.json configuration file with the appropriate build
                  profiles (development, production-apk, production). The
                  workflow will handle the rest.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Do I still need an Expo account?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes, you'll still need an Expo account, as the workflow uses
                  the Expo CLI to build your app. You'll need to generate an
                  Expo token and add it as a secret in your GitHub repository.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  How long do builds typically take?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Build times vary based on your project's complexity, but
                  typically:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mt-2">
                  <li>Android development builds: 10-15 minutes</li>
                  <li>Android production builds: 15-20 minutes</li>
                  <li>iOS builds: 20-30 minutes</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Build times can be reduced by using appropriate caching
                  strategies, which are enabled by default in our generated
                  workflows.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Can I build iOS apps on GitHub Actions?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes, GitHub Actions provides macOS runners that can build iOS
                  applications. However, note that macOS runners consume GitHub
                  Actions minutes at 10x the rate of Linux runners, so you'll go
                  through your free tier faster. For example, a 30-minute iOS
                  build would consume 300 minutes of your free allowance.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  What about code signing for iOS apps?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  When iOS support is enabled, the workflow handles code signing
                  through the EAS CLI using your Apple Developer account
                  credentials (provided as secrets). The EAS CLI manages the
                  provisioning profiles and certificates automatically,
                  simplifying the otherwise complex iOS code signing process.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Can I customize the workflow further?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Absolutely! The generated workflow file is just a starting
                  point. You can modify it to add additional steps, change build
                  parameters, or integrate with other services. Since it's a
                  standard GitHub Actions workflow file, you have full control
                  over its execution.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  How are build versions managed?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The workflow reads the version from your app.json file and
                  appends a build number based on the current date and time
                  (format: YYYYMMDDHHMM). This ensures each build has a unique
                  identifier. For GitHub releases, this version information is
                  used in the release name and tag.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  What if I need help or encounter issues?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  For issues or feature requests, please visit our{" "}
                  <a
                    href="https://github.com/TanayK07/expo-react-native-cicd/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    GitHub repository
                  </a>{" "}
                  and create an issue. Be sure to include details about your
                  configuration and any error messages you're seeing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
