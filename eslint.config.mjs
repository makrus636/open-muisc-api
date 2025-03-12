import globals from 'globals';
import pluginJs from '@eslint/js';
import daStyle from 'eslint-config-dicodingacademy';


/** @type {import('eslint').Linter.Config[]} */
export default [
  daStyle,
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      //'no-trailing-spaces': 'error',
      // 'indent': ['error', 2],
      //'camelcase': 'error',
      /* 'arrow-parens': ['error', 'always'],
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-before-function-paren': ['error', { 'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always' }],
      'func-call-spacing': ['error', 'never'],
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'prefer-const': 'error',
      'no-var': 'error',
      'semi': ['error', 'always'], */
      //'quotes': ['error', 'single', {'avoidEscape': true}],
      /* 'prefer-template': 'error',
      'prefer-arrow-callback': 'error', */

      'linebreak-style': ['error', 'windows'], // error jika linebreak tidak sesuai (unix/windows)
      // 'no-unused-vars': ['error'], // error jika ada variabel yang tidak terpakai
      //'no-console': ['warn'], // warning jika ada console.log
      //'eqeqeq': ['error', 'always'], // error jika ada penggunaan operator == atau != (harus === / !==)
      //'curly': ['error', 'all'], // error jika tidak menggunakan curly brace (error jika menggunakan anonimus function)
      // 'quotes': ['error', 'single'], // error jika tidak menggunakan single quotes (kutip 1 single / 2 double)
      //'indent': ['error', 2], // error jika indentasi tidak 2 spasi
      //'semi': ['error', 'always'], // error jika tidak menggunakan semicolon (always/ never)
      // 'no-trailing-spaces': ['error'], // error jika ada trailing spaces
      // 'space-before-function-paren': ['error', 'always'], // error jika tidak ada spasi sebelum kurung buka pada fungsi
      // 'comma-dangle': ['error', 'never'] // error jika ada trailing comma/ coma di akhir
    }
  }
];

// documentation
// https://eslint.org/docs/latest/?form=MG0AV3