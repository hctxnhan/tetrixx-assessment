import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts", "src/**/*.js"], // Exclude .md files
  clean: true,
  format: ["cjs"],
  ...options,
}));