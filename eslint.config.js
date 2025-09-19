// ESLint config for a TypeScript + React + Node.js monorepo

import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: { '@typescript-eslint': tseslintPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: { react },
    languageOptions: {},
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];
