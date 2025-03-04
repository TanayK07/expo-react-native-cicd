import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "React Native Expo Builder - Free Build Generator",
	description:
		"Save $100s monthly on Expo EAS build costs! Generate custom GitHub Actions workflows for building React Native and Expo apps for free.",
	keywords: [
		"React Native",
		"Expo",
		"GitHub Actions",
		"CI/CD",
		"EAS builds",
		"mobile app development",
		"free builds",
	],
	authors: [{ name: "Tanay Kedia", url: "https://github.com/TanayK07" }],
	creator: "Tanay Kedia",
	publisher: "Tanay Kedia",
	openGraph: {
		type: "website",
		url: "https://tanayk07.github.io/expo-react-native-cicd/",
		title: "React Native Expo Builder - Free Build Generator",
		description:
			"Save $100s monthly on Expo EAS build costs! Generate custom GitHub Actions workflows for free.",
		siteName: "React Native Expo Builder",
		images: [
			{
				url: "/expo-react-native-cicd/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "React Native Expo Builder",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "React Native Expo Builder - Free Build Generator",
		description:
			"Save $100s monthly on Expo EAS build costs! Generate custom GitHub Actions workflows for free.",
		images: ["/expo-react-native-cicd/images/og-image.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="h-full">
			<body
				className={`${inter.className} transition-colors duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full`}
			>
				<ThemeProvider>
					<div className="min-h-screen flex flex-col w-full">{children}</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
