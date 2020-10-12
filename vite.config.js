// @ts-check
const reactPlugin = require("vite-plugin-react");

/**
 * @type { import('vite').UserConfig }
 */
const config = {
	jsx: "react",
	plugins: [reactPlugin],
	base: "https://javier.xyz/morphin"
};

module.exports = config;
