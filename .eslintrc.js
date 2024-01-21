module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': [
      1,
      {
        trailingComma: 'all',
        singleQuote: true,
        semi: true,
        printWidth: 150,
        tabWidth: 2,
      },
    ],
    'no-var': 'error',
    semi: 'error',
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-multi-spaces': 'error',
    'no-empty-function': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-lone-blocks': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-new': 'error',
    'no-octal-escape': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'space-in-parens': 'error',
    'no-multiple-empty-lines': 'error',
    'no-unsafe-negation': 'error',
    'prefer-const': 'error',
    'no-unused-vars': 'off',

    'unicorn/prevent-abbreviations': 'off',
    'unicorn/catch-error-name': 'off',
    'import/no-unresolved': 'off',
    'import/no-named-as-default-member': 'off',
  },
};
