const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const tailwindNesting = require('tailwindcss/nesting');
const presetEnv = require('postcss-preset-env');

const config = {
	plugins: [
		//Some plugins, like tailwindcss/nesting, need to run before Tailwind,

		tailwindNesting,

		tailwindcss(),

		//But others, like autoprefixer, need to run after,

		presetEnv({
			stage: 1,
			features: { 'nesting-rules': false }
		}),

		autoprefixer
	]
};

module.exports = config;
