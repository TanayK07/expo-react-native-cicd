"use client";

import React, { useState } from "react";
import { Prism, SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CopyButton from "./CopyButton";

const SampleConfigFiles: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string>("babel");
	const SyntaxHighlighter = Prism as any as React.FC<SyntaxHighlighterProps>;

	const sampleConfigs = {
		babel: {
			title: "babel.config.js",
			description:
				"Standard Babel configuration for React Native & Expo projects",
			code: `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native reanimated plugin (if you use reanimated)
      'react-native-reanimated/plugin',
      
      // Optional - Plugin transform for optimization
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@assets': './assets',
          },
        },
      ],
      
      // Optional - For using decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};`,
		},
		metro: {
			title: "metro.config.js",
			description: "Metro bundler configuration with SVG support",
			code: `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add SVG support
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;`,
		},
		tsconfig: {
			title: "tsconfig.json",
			description: "TypeScript configuration for React Native & Expo projects",
			code: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@utils/*": ["src/utils/*"],
      "@hooks/*": ["src/hooks/*"],
      "@assets/*": ["assets/*"]
    }
  }
}`,
		},
		easjson: {
			title: "eas.json",
			description:
				"EAS Build configuration file for development, preview, and production builds",
			code: `{
  "cli": {
    "version": ">= 3.8.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production-apk": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}`,
		},
		jestconfig: {
			title: "jest.config.js",
			description: "Jest configuration for React Native testing",
			code: `module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@screens(.*)$': '<rootDir>/src/screens$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@assets(.*)$': '<rootDir>/assets$1',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ]
};`,
		},
	};

	return (
		<div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mt-8">
			<h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
				Sample Configuration Files
			</h2>

			<p className="mb-4 text-gray-700 dark:text-gray-300">
				Common configuration files for React Native & Expo projects that work
				well with this CI/CD setup:
			</p>

			<div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
				{Object.keys(sampleConfigs).map((key) => (
					<button
						key={key}
						className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
							activeTab === key
								? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 border-b-2 border-primary-500"
								: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
						}`}
						onClick={() => setActiveTab(key)}
					>
						{sampleConfigs[key as keyof typeof sampleConfigs].title}
					</button>
				))}
			</div>

			<div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
				{sampleConfigs[activeTab as keyof typeof sampleConfigs].description}
			</div>

			<div className="relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
				<div className="bg-gray-800 dark:bg-gray-900 text-gray-200 text-sm py-2 px-4 flex justify-between items-center">
					<span>
						{sampleConfigs[activeTab as keyof typeof sampleConfigs].title}
					</span>
					<CopyButton
						textToCopy={
							sampleConfigs[activeTab as keyof typeof sampleConfigs].code
						}
					/>
				</div>
				<div className="max-h-96 overflow-y-auto">
					<SyntaxHighlighter
						language={activeTab === "tsconfig" ? "json" : "javascript"}
						style={vscDarkPlus}
						customStyle={{ margin: 0, borderRadius: 0 }}
					>
						{sampleConfigs[activeTab as keyof typeof sampleConfigs].code}
					</SyntaxHighlighter>
				</div>
			</div>

			<div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
				<p>
					<strong>Note:</strong> You might need to install additional
					dependencies depending on your configuration. See the{" "}
					<a
						href="https://github.com/TanayK07/expo-react-native-cicd"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary-600 dark:text-primary-400 hover:underline"
					>
						sample repository
					</a>{" "}
					for a complete working example.
				</p>
			</div>
		</div>
	);
};

export default SampleConfigFiles;
