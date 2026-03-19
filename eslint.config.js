import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{js,jsx}"],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            nextPlugin.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        rules: {
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
        },
    },
    {
        files: ["app/api/**/*.js"],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    },
    {
        files: ["src/**/*.{js,jsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                process: "readonly",
            },
        },
    },
]);
