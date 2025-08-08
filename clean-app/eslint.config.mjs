// eslint.config.mjs

// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist'], // Also good to ignore the output dir
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      // This sourceType might be for your .js files.
      // typescript-eslint will correctly parse .ts files as modules.
      sourceType: 'commonjs',
      parserOptions: {
        // --- THIS IS THE FIX ---
        // Add this line to tell ESLint where your types are.
        // `true` will find the tsconfig.json automatically.
        project: true,

        // You can keep these existing lines.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': [
        'error',
        {
          allowDecorators: true,
        },
      ],
      // The no-unsafe-call rule that was firing will now work correctly.
      // You can leave it on or configure it as needed.
    },
  },
);
