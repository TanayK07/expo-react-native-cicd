/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
		extend: {
			// Add custom screen sizes for larger displays
			screens: {
				"2xl": "1536px",
				"3xl": "1920px",
				"4xl": "2560px", // 4K monitors
			},
			maxWidth: {
				"8xl": "88rem", // 1408px
				"9xl": "96rem", // 1536px
				"screen-2xl": "1536px",
				"screen-3xl": "1920px",
				"screen-4xl": "2560px",
			},
			colors: {
				dark: {
					background: "#0a0a0a",
				},
				background: "var(--background)",
				foreground: "var(--foreground)",
				card: {
					bg: "var(--card-bg)",
					border: "var(--card-border)",
				},
				github: {
					bg: "var(--github-bg)",
					border: "var(--github-border)",
					text: "var(--github-text)",
				},
				primary: {
					light: "var(--primary-light)",
					dark: "var(--primary-dark)",
					DEFAULT: "var(--primary-light)",
					// Legacy classes for compatibility
					100: "var(--primary-light)",
					200: "var(--primary-light)",
					300: "var(--primary-light)",
					400: "var(--primary-light)",
					500: "var(--primary-light)",
					600: "var(--primary-light)",
					700: "var(--primary-dark)",
					800: "var(--primary-dark)",
					900: "var(--primary-dark)",
				},
				success: "var(--success)",
			},
			// Add more padding options for larger screens
			padding: {
				18: "4.5rem",
				22: "5.5rem",
				26: "6.5rem",
			},
		},
		// Customize the container to better handle wide screens
		container: {
			center: true,
			padding: {
				DEFAULT: "1rem",
				sm: "2rem",
				lg: "4rem",
				xl: "5rem",
				"2xl": "6rem",
				"3xl": "8rem",
				"4xl": "10rem",
			},
		},
	},
	plugins: [],
};
