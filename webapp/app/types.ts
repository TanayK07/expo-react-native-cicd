// Define the AdvancedOptions type for reuse
export interface AdvancedOptions {
  iOSSupport: boolean;
  publishToExpo: boolean;
  publishToStores: boolean;
  jestTests: boolean;
  rntlTests: boolean;
  renderHookTests: boolean;
  caching: boolean;
  notifications: boolean;
}

export interface FormValues {
  projectName?: string;
  expoVersion?: string;
  storageType?: string;
  platform?: string;
  buildType?: string;
  nodeVersion?: string;
  expoCli?: string;
  eas?: string;
  reactNativeCli?: string;
  fastlane?: string;
  workflow?: string;
  buildTypes: string[];
  tests: string[];
  triggers: string[];
  advancedOptions?: AdvancedOptions;
}

export interface FeatureCardProps {
  title: string;
  description: string;
}

export interface CopyButtonProps {
  textToCopy: string;
}

export interface SecretsListProps {
  storageType: string;
  advancedOptions: AdvancedOptions | null;
}

export interface WorkflowFormProps {
  onSubmit: (values: FormValues) => void;
}

export interface FormValuesTest {
  projectName: string;
  expoVersion: string;
  storageType: "github-release" | "zoho-drive" | "google-drive" | "custom";
  platform: "android" | "ios";
  buildType: "dev" | "prod-apk" | "prod-aab";
  nodeVersion: string;
  expoCli: "classic" | "modern";
  reactNativeCli: string;
  fastlane: string;
  workflow: "manual" | "push-main" | "pull-request";
  eas: string;
  buildTypes?: string[];
  tests?: string[];
  triggers?: string[];
  advancedOptions?: AdvancedOptions;
}
