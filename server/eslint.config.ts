import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { dirname } from 'path';

const __dirname = dirname(__filename);

export default [
  // Ignore compiled files and dependencies
  { 
    ignores: [
      '**/dist/**', 
      '**/node_modules/**', 
      '**/prisma/generated/**',
    ] 
  },
  
  // Base configs for all files
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Common settings for all TypeScript files
  {
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
