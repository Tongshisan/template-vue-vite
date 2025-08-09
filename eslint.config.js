import tseslint from "@typescript-eslint/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintPluginImport from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import vue from "eslint-plugin-vue";

export default defineConfig({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      browser: true,
      node: true,
    },
  },
  plugins: {
    vue,
    "@typescript-eslint": tseslint,
    prettier,
    import: eslintPluginImport,
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/first-attribute-linebreak": "off",
    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/multiline-html-element-content-newline": "off",
    "vue/html-self-closing": "off",

    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        args: "none",
      },
    ],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-undef": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        pathGroups: [{ pattern: "@/**", group: "parent", position: "before" }],
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "prettier/prettier": "error",
  },
});
