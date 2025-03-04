/** @type {import('next').NextConfig} */
const nextConfig = {
	// For GitHub Pages deployment, use these settings:
	// output: "export",
	// basePath: process.env.NODE_ENV === "production" ? "/expo-react-native-cicd" : "",
	// images: { unoptimized: true },
	// trailingSlash: true,

	// For Vercel deployment, use these settings instead:
	// Vercel will detect Next.js automatically
	reactStrictMode: true,

	// Use this environment variable to switch between GitHub Pages and Vercel deployments
	...(process.env.DEPLOYMENT_TARGET === "GITHUB_PAGES"
		? {
				output: "export",
				basePath: "/expo-react-native-cicd",
				images: { unoptimized: true },
				trailingSlash: true,
			}
		: {}),
};

module.exports = nextConfig;
