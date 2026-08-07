import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        Chart: 'readonly',
        XLSX: 'readonly',
        lucide: 'readonly',
        L: 'readonly',
        d3: 'readonly',
        Toast: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn',
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off',
      'no-empty': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.js', '*.config.cjs'],
  },
];
