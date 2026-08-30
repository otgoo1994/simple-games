module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', '@typescript-eslint', 'react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'import/extensions': ['off'], // 확장자 비활성화
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off', // React 17+ JSX 변환 사용
    'react/jsx-props-no-spreading': 'off', // Props spreading 규칙 비활성화
    'import/prefer-default-export': 'off', // 단일 내보내기 시 기본 내보내기 사용 규칙 비활성화
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false }], // 콜백 함수에 화살표 함수 사용 강제
    'func-style': ['error', 'expression'], // 모든 함수 표현식으로 대체
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function', // 명명된 컴포넌트를 화살표 함수로 정의
        unnamedComponents: 'arrow-function', // 이름 없는 컴포넌트를 화살표 함수로 정의
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // any 사용시 경고
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{js,ts,tsx}',
          '**/setupTests.{js,ts}',
          '**/*.config.{js,ts}',
          '**/*.stories.{js,ts,tsx}',
          // 필요한 다른 경로들 추가
          'src/**/devtools.js', // devtools 관련된 파일
        ],
      },
    ],
    'jsx-a11y/anchor-is-valid': 'off',
  },
};
