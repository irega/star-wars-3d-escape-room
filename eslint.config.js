import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // Three.js JSX elements use custom properties (position, rotation, args, intensity, etc.)
      'react/no-unknown-property': ['error', { ignore: ['position', 'rotation', 'args', 'intensity', 'color', 'attach', 'castShadow', 'receiveShadow', 'object', 'dispose', 'fov', 'near', 'far', 'emissive', 'emissiveIntensity', 'roughness', 'metalness', 'side'] }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  prettier,
  {
    ignores: ['dist/', 'coverage/', 'node_modules/'],
  },
);
