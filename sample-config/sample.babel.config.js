module.exports = function (api) {
	api.cache(true);
	const reanimatedPlugin =
		process.env.NODE_ENV === "production"
			? ["react-native-reanimated/plugin", { loose: true }]
			: "react-native-reanimated/plugin";

	return {
		presets: ["babel-preset-expo"],
		plugins: [
			reanimatedPlugin,
			// Add your other plugins here
		],
	};
};
