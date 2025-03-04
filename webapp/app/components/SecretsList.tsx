import { SecretsListProps } from "../types";

const SecretsList: React.FC<SecretsListProps> = ({
	storageType,
	advancedOptions,
}) => {
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

	return (
		<div className="bg-github-bg dark:bg-gray-800 p-4 rounded-md border border-github-border dark:border-gray-700">
			<ul className="list-disc pl-5 space-y-2">
				<li className="text-gray-800 dark:text-gray-200">
					<strong>EXPO_TOKEN</strong>: Your Expo account token
				</li>

				{/* Storage-specific secrets */}
				{storageType === "zoho-drive" && (
					<>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>RCLONE_CONFIG_ZOHODRIVE_TYPE</strong>: Set to "zoho" for
							Zoho Drive
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>RCLONE_CONFIG_ZOHODRIVE_TOKEN</strong>: Authentication
							token for Zoho Drive
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID</strong>: Root folder ID
							in Zoho Drive
						</li>
					</>
				)}

				{storageType === "google-drive" && (
					<>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>RCLONE_CONFIG_GDRIVE_TYPE</strong>: Set to "drive" for
							Google Drive
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>RCLONE_CONFIG_GDRIVE_TOKEN</strong>: Authentication token
							for Google Drive
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID</strong>: Root folder
							ID in Google Drive
						</li>
					</>
				)}

				{storageType === "custom" && (
					<>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>CLOUD_STORAGE_TYPE</strong>: Your cloud storage provider
							type (e.g., "zoho", "drive")
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>CLOUD_STORAGE_TOKEN</strong>: Authentication token for
							your cloud storage
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>CLOUD_STORAGE_ROOT_ID</strong>: Root folder ID in your
							cloud storage
						</li>
					</>
				)}

				{/* iOS-specific secrets */}
				{options.iOSSupport && (
					<>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>EXPO_APPLE_ID</strong>: Your Apple Developer account email
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>EXPO_APPLE_PASSWORD</strong>: Your Apple Developer account
							password or app-specific password
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>EXPO_TEAM_ID</strong>: Your Apple Developer Team ID
						</li>
					</>
				)}

				{/* Play Store publishing secrets */}
				{options.publishToStores && (
					<li className="text-gray-800 dark:text-gray-200">
						<strong>GOOGLE_PLAY_SERVICE_ACCOUNT</strong>: Google Play service
						account JSON (base64 encoded)
					</li>
				)}

				{/* Notification secrets */}
				{options.notifications && (
					<>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>SLACK_WEBHOOK</strong>: Slack webhook URL for
							notifications (optional)
						</li>
						<li className="text-gray-800 dark:text-gray-200">
							<strong>DISCORD_WEBHOOK</strong>: Discord webhook URL for
							notifications (optional)
						</li>
					</>
				)}
			</ul>
		</div>
	);
};

export default SecretsList;
