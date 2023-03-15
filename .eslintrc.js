module.exports = {
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"overrides": [
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"ignorePatterns": [
		"**/test.ts",
		"**/*.spec.ts",
		"**/*.d.ts",
		"**/utilities.ts",
		"scripts/*"],
	"rules": {
		"@typescript-eslint/no-explicit-any": "off",
		"no-control-regex": "off",
		"no-prototype-builtins": "off"
	},
}
