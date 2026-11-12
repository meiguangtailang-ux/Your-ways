import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'public'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['server/**/*.ts', 'scripts/**/*.ts', 'pwa/**/*.ts', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['pwa/service-worker.js'],
    languageOptions: { globals: { ...globals.serviceworker, __SHELL_URLS__: 'readonly' } },
  },
);
