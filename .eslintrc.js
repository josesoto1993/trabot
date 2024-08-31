module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    semi: ["error", "always"],
    indent: ["error", 2],
    //"no-console": "warn", // Warn on console.log usage
  },
  env: {
    browser: true,
    node: true,
  },
};
