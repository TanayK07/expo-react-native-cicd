"use client";

import { useState, useEffect } from "react";
import { WorkflowFormProps } from "../types";
import { toast } from "sonner";

const WorkflowForm: React.FC<WorkflowFormProps> = ({ onSubmit }) => {
	const [formState, setFormState] = useState({
		storageType: "github",
		buildTypes: ["dev", "prod-apk", "prod-aab"],
		tests: ["typescript", "eslint", "prettier"],
		triggers: ["push-main", "pull-request", "manual"],
		// New options
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
		showAdvancedOptions: false,
	});

	const [errors, setErrors] = useState<{
		buildTypes?: string;
		triggers?: string;
		general?: string;
	}>({});

	// Validate form whenever relevant fields change
	useEffect(() => {
		validateForm();
	}, [
		formState.buildTypes,
		formState.triggers,
		formState.storageType,
		formState.advancedOptions,
		formState.showAdvancedOptions,
	]);

	const validateForm = () => {
		const newErrors: {
			buildTypes?: string;
			triggers?: string;
			general?: string;
		} = {};

		// Validate build types
		if (formState.buildTypes.length === 0) {
			newErrors.buildTypes = "At least one build type must be selected";
		}

		// Validate triggers
		if (formState.triggers.length === 0) {
			newErrors.triggers = "At least one trigger must be selected";
		}

		// Validate specific combinations
		if (
			formState.storageType === "github-release" &&
			!formState.triggers.includes("manual")
		) {
			newErrors.general =
				"GitHub Releases storage requires the 'Manual workflow dispatch' trigger";
		}

		// iOS validation
		if (
			formState.advancedOptions.iOSSupport &&
			!formState.triggers.includes("manual")
		) {
			newErrors.general =
				"iOS builds are complex and require manual trigger for better control";
		}

		// Publish validation
		if (
			(formState.advancedOptions.publishToExpo ||
				formState.advancedOptions.publishToStores) &&
			!formState.triggers.includes("manual")
		) {
			newErrors.general =
				"Publishing workflows should include manual trigger for controlled releases";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newStorageType = e.target.value;
		setFormState({ ...formState, storageType: newStorageType });

		// Special handling for GitHub Releases - auto-select manual trigger
		if (
			newStorageType === "github-release" &&
			!formState.triggers.includes("manual")
		) {
			setFormState((prev) => ({
				...prev,
				storageType: newStorageType,
				triggers: [...prev.triggers, "manual"],
			}));
			toast.info(
				"Added 'Manual workflow dispatch' trigger since it's required for GitHub Releases"
			);
		}
	};

	const handleCheckboxChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		category: "buildTypes" | "tests" | "triggers"
	) => {
		const value = e.target.value;
		const isChecked = e.target.checked;

		// Special validation for GitHub Releases + manual trigger
		if (
			category === "triggers" &&
			value === "manual" &&
			!isChecked &&
			formState.storageType === "github-release"
		) {
			toast.error(
				"Cannot remove Manual trigger when using GitHub Releases storage"
			);
			return;
		}

		// Special validation for iOS/publishing + manual trigger
		if (
			category === "triggers" &&
			value === "manual" &&
			!isChecked &&
			(formState.advancedOptions.iOSSupport ||
				formState.advancedOptions.publishToExpo ||
				formState.advancedOptions.publishToStores)
		) {
			toast.error(
				"Manual trigger is required when using iOS or publishing features"
			);
			return;
		}

		setFormState((prevState) => {
			const newState = { ...prevState };

			if (isChecked) {
				newState[category] = [...prevState[category], value];
			} else {
				// Don't allow removing all items in essential categories
				if (
					prevState[category].length === 1 &&
					(category === "buildTypes" || category === "triggers")
				) {
					toast.error(
						`At least one ${category === "buildTypes" ? "build type" : "trigger"} must be selected`
					);
					return prevState;
				}
				newState[category] = prevState[category].filter(
					(item) => item !== value
				);
			}

			return newState;
		});
	};

	const handleAdvancedOptionChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, checked } = e.target;

		// Special handling for iOS & publishing, they should add manual trigger if not present
		if (
			(name === "iOSSupport" ||
				name === "publishToExpo" ||
				name === "publishToStores") &&
			checked &&
			!formState.triggers.includes("manual")
		) {
			setFormState((prev) => ({
				...prev,
				triggers: [...prev.triggers, "manual"],
				advancedOptions: {
					...prev.advancedOptions,
					[name]: checked,
				},
			}));
			toast.info(
				`Added 'Manual workflow dispatch' trigger since it's required for ${name === "iOSSupport" ? "iOS builds" : "publishing"}`
			);
			return;
		}

		// Handle renderHook tests - add Jest if not present
		if (
			name === "renderHookTests" &&
			checked &&
			!formState.advancedOptions.jestTests
		) {
			setFormState((prev) => ({
				...prev,
				advancedOptions: {
					...prev.advancedOptions,
					[name]: checked,
					jestTests: true,
				},
			}));
			toast.info(
				"Added Jest Tests since they're required for renderHook tests"
			);
			return;
		}

		// Handle RNTL tests - add Jest if not present
		if (
			name === "rntlTests" &&
			checked &&
			!formState.advancedOptions.jestTests
		) {
			setFormState((prev) => ({
				...prev,
				advancedOptions: {
					...prev.advancedOptions,
					[name]: checked,
					jestTests: true,
				},
			}));
			toast.info(
				"Added Jest Tests since they're required for React Native Testing Library"
			);
			return;
		}

		// Normal case
		setFormState((prev) => ({
			...prev,
			advancedOptions: {
				...prev.advancedOptions,
				[name]: checked,
			},
		}));
	};

	const toggleAdvancedOptions = () => {
		setFormState((prev) => ({
			...prev,
			showAdvancedOptions: !prev.showAdvancedOptions,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (validateForm()) {
			// Remove the UI-only showAdvancedOptions flag
			const { showAdvancedOptions, ...submittableState } = formState;
			onSubmit(submittableState);
		} else {
			// Show error toast for the first error found
			const firstError = errors.general || errors.buildTypes || errors.triggers;
			if (firstError) {
				toast.error(firstError);
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<label
					htmlFor="storage-type"
					className="block font-medium text-gray-700 dark:text-gray-300"
				>
					Where would you like to store your build artifacts?
				</label>
				<select
					id="storage-type"
					name="storage-type"
					value={formState.storageType}
					onChange={handleStorageChange}
					className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500"
				>
					<option value="github">GitHub Artifacts (7-day retention)</option>
					<option value="github-release">GitHub Releases</option>
					<option value="zoho-drive">Zoho Drive</option>
					<option value="google-drive">Google Drive</option>
					<option value="custom">Custom Cloud Storage (rclone)</option>
				</select>
				{formState.storageType === "github-release" && (
					<p className="text-xs italic text-gray-600 dark:text-gray-400">
						GitHub Releases requires the "Manual workflow dispatch" trigger
						option.
					</p>
				)}
			</div>

			<div className="space-y-2">
				<label className="block font-medium text-gray-700 dark:text-gray-300">
					Which build types do you need?
				</label>
				<div className="space-y-2">
					<div className="flex items-center">
						<input
							type="checkbox"
							id="dev-build"
							name="build-types"
							value="dev"
							checked={formState.buildTypes.includes("dev")}
							onChange={(e) => handleCheckboxChange(e, "buildTypes")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="dev-build"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							Development Build (debug APK)
						</label>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="prod-apk"
							name="build-types"
							value="prod-apk"
							checked={formState.buildTypes.includes("prod-apk")}
							onChange={(e) => handleCheckboxChange(e, "buildTypes")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="prod-apk"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							Production APK
						</label>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="prod-aab"
							name="build-types"
							value="prod-aab"
							checked={formState.buildTypes.includes("prod-aab")}
							onChange={(e) => handleCheckboxChange(e, "buildTypes")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="prod-aab"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							Production AAB (Play Store)
						</label>
					</div>
				</div>
				{errors.buildTypes && (
					<p className="text-red-500 text-sm">{errors.buildTypes}</p>
				)}
			</div>

			<div className="space-y-2">
				<label className="block font-medium text-gray-700 dark:text-gray-300">
					Testing & Quality Checks:
				</label>
				<div className="space-y-2">
					<div className="flex items-center">
						<input
							type="checkbox"
							id="ts-check"
							name="tests"
							value="typescript"
							checked={formState.tests.includes("typescript")}
							onChange={(e) => handleCheckboxChange(e, "tests")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="ts-check"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							TypeScript Check
						</label>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="eslint"
							name="tests"
							value="eslint"
							checked={formState.tests.includes("eslint")}
							onChange={(e) => handleCheckboxChange(e, "tests")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="eslint"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							ESLint
						</label>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="prettier"
							name="tests"
							value="prettier"
							checked={formState.tests.includes("prettier")}
							onChange={(e) => handleCheckboxChange(e, "tests")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="prettier"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							Prettier Format Check
						</label>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<label className="block font-medium text-gray-700 dark:text-gray-300">
					Triggers:
				</label>
				<div className="space-y-2">
					<div className="flex items-center">
						<input
							type="checkbox"
							id="push-main"
							name="triggers"
							value="push-main"
							checked={formState.triggers.includes("push-main")}
							onChange={(e) => handleCheckboxChange(e, "triggers")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="push-main"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							Push to main/master branch
						</label>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="pull-request"
							name="triggers"
							value="pull-request"
							checked={formState.triggers.includes("pull-request")}
							onChange={(e) => handleCheckboxChange(e, "triggers")}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
						/>
						<label
							htmlFor="pull-request"
							className="ml-2 text-gray-700 dark:text-gray-300"
						>
							Pull requests to main/master
						</label>
					</div>
					<div className="flex items-center">
						<input
							type="checkbox"
							id="manual"
							name="triggers"
							value="manual"
							checked={formState.triggers.includes("manual")}
							onChange={(e) => handleCheckboxChange(e, "triggers")}
							className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 ${
								formState.storageType === "github-release" ||
								formState.advancedOptions.iOSSupport ||
								formState.advancedOptions.publishToExpo ||
								formState.advancedOptions.publishToStores
									? "opacity-50"
									: ""
							}`}
							disabled={
								formState.storageType === "github-release" ||
								formState.advancedOptions.iOSSupport ||
								formState.advancedOptions.publishToExpo ||
								formState.advancedOptions.publishToStores
							}
						/>
						<label
							htmlFor="manual"
							className={`ml-2 text-gray-700 dark:text-gray-300 ${
								formState.storageType === "github-release" ||
								formState.advancedOptions.iOSSupport ||
								formState.advancedOptions.publishToExpo ||
								formState.advancedOptions.publishToStores
									? "opacity-50"
									: ""
							}`}
						>
							Manual workflow dispatch
							{(formState.storageType === "github-release" ||
								formState.advancedOptions.iOSSupport ||
								formState.advancedOptions.publishToExpo ||
								formState.advancedOptions.publishToStores) &&
								" (required)"}
						</label>
					</div>
				</div>
				{errors.triggers && (
					<p className="text-red-500 text-sm">{errors.triggers}</p>
				)}
			</div>

			{/* Advanced Options Toggle */}
			<div className="pt-2">
				<button
					type="button"
					className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 focus:outline-none transition-colors"
					onClick={toggleAdvancedOptions}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-5 w-5 mr-1 transition-transform ${formState.showAdvancedOptions ? "rotate-90" : ""}`}
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clipRule="evenodd"
						/>
					</svg>
					<span>
						{formState.showAdvancedOptions
							? "Hide Advanced Options"
							: "Show Advanced Options"}
					</span>
				</button>
			</div>

			{/* Advanced Options */}
			{formState.showAdvancedOptions && (
				<div className="space-y-4 pt-2 pb-2 border-t border-gray-200 dark:border-gray-700">
					<h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4">
						Advanced Configuration
					</h3>

					{/* Platform Support */}
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 dark:text-gray-300">
							Platform Support:
						</label>
						<div className="flex items-center">
							<input
								type="checkbox"
								id="ios-support"
								name="iOSSupport"
								checked={formState.advancedOptions.iOSSupport}
								onChange={handleAdvancedOptionChange}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
							/>
							<label
								htmlFor="ios-support"
								className="ml-2 text-gray-700 dark:text-gray-300"
							>
								iOS Support{" "}
								<span className="text-xs text-orange-600 dark:text-orange-400">
									(requires Apple Developer credentials)
								</span>
							</label>
						</div>
						{formState.advancedOptions.iOSSupport && (
							<p className="text-xs ml-6 text-gray-600 dark:text-gray-400">
								You'll need to add{" "}
								<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
									EXPO_APPLE_ID
								</code>
								,{" "}
								<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
									EXPO_APPLE_PASSWORD
								</code>
								, and{" "}
								<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
									EXPO_TEAM_ID
								</code>{" "}
								secrets
							</p>
						)}
					</div>

					{/* Publishing */}
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 dark:text-gray-300">
							Publishing Options:
						</label>
						<div className="space-y-2">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="publish-expo"
									name="publishToExpo"
									checked={formState.advancedOptions.publishToExpo}
									onChange={handleAdvancedOptionChange}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
								/>
								<label
									htmlFor="publish-expo"
									className="ml-2 text-gray-700 dark:text-gray-300"
								>
									Publish to Expo
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="publish-stores"
									name="publishToStores"
									checked={formState.advancedOptions.publishToStores}
									onChange={handleAdvancedOptionChange}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
								/>
								<label
									htmlFor="publish-stores"
									className="ml-2 text-gray-700 dark:text-gray-300"
								>
									Submit to App/Play Store{" "}
									<span className="text-xs text-orange-600 dark:text-orange-400">
										(requires store credentials)
									</span>
								</label>
							</div>
							{formState.advancedOptions.publishToStores && (
								<p className="text-xs ml-6 text-gray-600 dark:text-gray-400">
									For Play Store, add{" "}
									<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
										GOOGLE_PLAY_SERVICE_ACCOUNT
									</code>{" "}
									secrets.
									<br />
									For App Store, you'll need the iOS Support credentials as
									well.
								</p>
							)}
						</div>
					</div>

					{/* Additional Testing */}
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 dark:text-gray-300">
							Additional Testing:
						</label>
						<div className="space-y-2">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="jest-tests"
									name="jestTests"
									checked={formState.advancedOptions.jestTests}
									onChange={handleAdvancedOptionChange}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
								/>
								<label
									htmlFor="jest-tests"
									className="ml-2 text-gray-700 dark:text-gray-300"
								>
									Jest Tests
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="rntl-tests"
									name="rntlTests"
									checked={formState.advancedOptions.rntlTests}
									onChange={handleAdvancedOptionChange}
									className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 ${!formState.advancedOptions.jestTests && formState.advancedOptions.rntlTests ? "opacity-50" : ""}`}
									disabled={
										!formState.advancedOptions.jestTests &&
										formState.advancedOptions.rntlTests
									}
								/>
								<label
									htmlFor="rntl-tests"
									className={`ml-2 text-gray-700 dark:text-gray-300 ${!formState.advancedOptions.jestTests && formState.advancedOptions.rntlTests ? "opacity-50" : ""}`}
								>
									React Native Testing Library
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="renderhook-tests"
									name="renderHookTests"
									checked={formState.advancedOptions.renderHookTests}
									onChange={handleAdvancedOptionChange}
									className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 ${!formState.advancedOptions.jestTests && formState.advancedOptions.renderHookTests ? "opacity-50" : ""}`}
									disabled={
										!formState.advancedOptions.jestTests &&
										formState.advancedOptions.renderHookTests
									}
								/>
								<label
									htmlFor="renderhook-tests"
									className={`ml-2 text-gray-700 dark:text-gray-300 ${!formState.advancedOptions.jestTests && formState.advancedOptions.renderHookTests ? "opacity-50" : ""}`}
								>
									renderHook() Support
								</label>
							</div>
						</div>
					</div>

					{/* Additional Features */}
					<div className="space-y-2">
						<label className="block font-medium text-gray-700 dark:text-gray-300">
							Additional Features:
						</label>
						<div className="space-y-2">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="caching"
									name="caching"
									checked={formState.advancedOptions.caching}
									onChange={handleAdvancedOptionChange}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
								/>
								<label
									htmlFor="caching"
									className="ml-2 text-gray-700 dark:text-gray-300"
								>
									Enable Build Caching
								</label>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="notifications"
									name="notifications"
									checked={formState.advancedOptions.notifications}
									onChange={handleAdvancedOptionChange}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800"
								/>
								<label
									htmlFor="notifications"
									className="ml-2 text-gray-700 dark:text-gray-300"
								>
									Add Slack/Discord Notifications
								</label>
							</div>
							{formState.advancedOptions.notifications && (
								<p className="text-xs ml-6 text-gray-600 dark:text-gray-400">
									You'll need to add{" "}
									<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
										SLACK_WEBHOOK
									</code>{" "}
									or{" "}
									<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
										DISCORD_WEBHOOK
									</code>{" "}
									secrets
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{errors.general && (
				<div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
					{errors.general}
				</div>
			)}

			<button
				type="submit"
				className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white font-semibold rounded-md shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
			>
				Generate Workflow
			</button>
		</form>
	);
};

export default WorkflowForm;
