import path from "path";
import tseslint from "@typescript-eslint/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintPluginImport from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import vue from "eslint-plugin-vue";

// 项目根路径
const projectRootDir = process.cwd();

// 基础配置
const baseConfig = {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    globals: {
      browser: true,
      node: true,
    },
    parserOptions: {
      project: "./tsconfig.app.json",
    },
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: path.resolve(projectRootDir, "./tsconfig.app.json"),
      },
      alias: {
        map: [["@", path.resolve(projectRootDir, "./src")]],
        extensions: [".js", ".ts", ".tsx", ".vue"],
      },
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
};

// Vue 和 TSX 文件配置
const vueAndTsxConfig = {
  files: ["**/*.vue", "**/*.tsx"],
  ...baseConfig,
};

// TS 和 JS 文件配置
const tsAndJsConfig = {
  files: ["**/*.ts", "**/*.js"],
  ...baseConfig,
};

// 配置文件例外
const configFilesConfig = {
  files: [
    "**/.eslintrc.{js,cjs}",
    "**/vite.config.ts",
    "**/*.d.ts",
    "**/index.vue",
  ],
  ...baseConfig,
};

// 导出配置数组（替代原来的 overrides）
export default defineConfig([
  baseConfig,
  vueAndTsxConfig,
  tsAndJsConfig,
  configFilesConfig,
]);
