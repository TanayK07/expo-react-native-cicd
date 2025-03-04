"use client";
import { useState } from "react";
import { Prism, SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import WorkflowForm from "./components/WorkflowForm";
import FeatureCard from "./components/FeatureCard";
import { generateWorkflowYaml } from "./utils/workflowGenerator";
import CopyButton from "./components/CopyButton";
import SecretsList from "./components/SecretsList";
import { FormValues } from "./types";
import SampleRepoButton from "./components/SampleRepoButton";
import SampleConfigFiles from "./components/SampleConfigFiles";

type AdvancedOptions = {
	iOSSupport: boolean;
	publishToExpo: boolean;
	publishToStores: boolean;
	jestTests: boolean;
	rntlTests: boolean;
	renderHookTests: boolean;
	caching: boolean;
	notifications: boolean;
};

export default function Home() {
	const [generatedYaml, setGeneratedYaml] = useState<string>("");
	const [selectedStorageType, setSelectedStorageType] =
		useState<string>("github");
	const [advancedOptions, setAdvancedOptions] =
		useState<AdvancedOptions | null>(null);

	const SyntaxHighlighter = Prism as any as React.FC<SyntaxHighlighterProps>;
	const handleFormSubmit = (values: FormValues) => {
		const yaml = generateWorkflowYaml(values);
		setGeneratedYaml(yaml);
		setSelectedStorageType(values.storageType || "github");
		setAdvancedOptions(values.advancedOptions || null);
	};

	return (
		// Updated container class to be more responsive on larger screens
		<div className="container mx-auto px-4 py-8 dark:bg-gray-900 max-w-full xl:max-w-7xl 2xl:max-w-screen-2xl">
			<section className="mb-12 text-center">
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
					Free React Native & Expo CI/CD Builder
				</h1>
				<p className="text-xl mb-6 text-gray-800 dark:text-gray-200">
					<span className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded font-medium">
						Save $100s monthly on Expo EAS build costs!
					</span>{" "}
					Generate custom GitHub Actions workflows for your React Native and
					Expo projects.
				</p>
				<div className="flex flex-wrap justify-center gap-4 mb-8">
					<a
						href="https://github.com/TanayK07/expo-react-native-cicd"
						target="_blank"
						rel="noopener noreferrer"
						className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md dark:shadow-gray-800 font-medium"
						aria-label="GitHub Repository"
					>
						GitHub Repository
					</a>
					<a
						href="https://github.com/marketplace/actions/react-native-expo-builder"
						target="_blank"
						rel="noopener noreferrer"
						className="bg-github-bg text-github-text dark:bg-gray-800 dark:text-white px-6 py-3 rounded-lg border border-github-border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md font-medium"
						aria-label="GitHub Marketplace"
					>
						GitHub Marketplace
					</a>
				</div>
			</section>
			<section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				<FeatureCard
					title="💰 Free Alternative to EAS Build Plans"
					description="Skip the $15-100/month EAS build plans by using GitHub Actions to build your apps"
				/>
				<FeatureCard
					title="🔄 Complete CI/CD Pipeline"
					description="Automated testing, building, and deployment all in one workflow"
				/>
				<FeatureCard
					title="📱 Multiple Build Formats"
					description="Generate development builds, production APKs and AABs easily"
				/>
			</section>
			{/* Updated grid layout to be more responsive on larger screens */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-12">
				<section className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
					<h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
						Configure Your Workflow
					</h2>
					<WorkflowForm onSubmit={handleFormSubmit} />
					<SampleRepoButton />
				</section>

				<section className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
					<h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
						Your Custom Workflow File
					</h2>
					<p className="mb-4 text-gray-700 dark:text-gray-300">
						Copy this YAML file to{" "}
						<code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
							.github/workflows/react-native-cicd.yml
						</code>{" "}
						in your repository:
					</p>

					<div className="relative mb-4 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
						<div className="bg-gray-800 dark:bg-gray-900 text-gray-200 text-sm py-2 px-4 flex justify-between items-center">
							<span>react-native-cicd.yml</span>
							{generatedYaml && <CopyButton textToCopy={generatedYaml} />}
						</div>
						<div className="max-h-96 overflow-y-auto">
							{generatedYaml ? (
								<SyntaxHighlighter
									language="yaml"
									style={vscDarkPlus}
									customStyle={{ margin: 0, borderRadius: 0 }}
								>
									{generatedYaml}
								</SyntaxHighlighter>
							) : (
								<div className="bg-gray-100 dark:bg-gray-700 p-4 text-gray-600 dark:text-gray-300 font-mono">
									Configure your options above and click "Generate Workflow"
								</div>
							)}
						</div>
					</div>

					<div className="mt-8">
						<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
							Required Secrets
						</h3>
						<p className="mb-2 text-gray-700 dark:text-gray-300">
							Add these secrets to your GitHub repository settings:
						</p>
						<SecretsList
							storageType={selectedStorageType}
							advancedOptions={advancedOptions}
						/>
					</div>
				</section>
			</div>

			<SampleConfigFiles />

			{/* Made How It Works section more responsive */}
			<section className="my-12 md:my-16">
				<h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
					How It Works
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
						{/* Remove the bg-primary-100 div that creates the circle */}
						<span className="text-4xl mb-4" role="img" aria-label="Setup">
							🛠️
						</span>
						<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
							Setup
						</h3>
						<p className="text-gray-700 dark:text-gray-300">
							Generate a custom workflow file and add it to your GitHub
							repository
						</p>
					</div>
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
						{/* Remove the bg-primary-100 div that creates the circle */}
						<span className="text-4xl mb-4" role="img" aria-label="Build">
							🚀
						</span>
						<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
							Build
						</h3>
						<p className="text-gray-700 dark:text-gray-300">
							GitHub Actions runs your builds using Expo's EAS CLI locally on
							the runner
						</p>
					</div>
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
						{/* Remove the bg-primary-100 div that creates the circle */}
						<span className="text-4xl mb-4" role="img" aria-label="Deploy">
							📦
						</span>
						<h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
							Deploy
						</h3>
						<p className="text-gray-700 dark:text-gray-300">
							Builds are automatically uploaded to your selected storage
							destination
						</p>
					</div>
				</div>
			</section>
			<footer className="mt-12 md:mt-20 mb-8 text-center">
				<p className="text-gray-600 dark:text-gray-400">
					Made with <span className="text-red-500">♥</span> by{" "}
					<a
						href="https://github.com/TanayK07"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
					>
						Tanay Kedia
					</a>
				</p>
			</footer>
		</div>
	);
}
