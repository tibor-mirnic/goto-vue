import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    printWidth: 120,
    semi: true,
    singleQuote: true,
    trailingComma: 'none'
  },
  lint: {
    plugins: ['unicorn', 'typescript', 'oxc', 'import'],
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      { name: 'workspace', specifier: './tooling/oxlint-plugin.mjs' }
    ],
    rules: {
      'workspace/require-arrow-functions': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
      'no-unused-vars': [
        'error',
        { args: 'none', ignoreRestSiblings: true, reportVarsOnlyUsedAsTypes: true, fix: { imports: 'off' } }
      ],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'import/default': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': ['error', { considerQueryString: true }]
    },
    overrides: [
      {
        files: [
          '{apps/*,packages/*,packages/domain/*,packages/infrastructure/*}/src/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'
        ],
        rules: { 'import/no-default-export': 'error' }
      }
    ],
    options: { typeAware: true, typeCheck: true }
  },
  run: {
    cache: true,
    tasks: {
      coverage: {
        command: "vp test run --coverage --exclude '!(apps|packages)/**' --exclude '**/{dist,dist-ssr,coverage}/**'",
        cache: false
      }
    }
  },
  test: {
    coverage: {
      include: [
        '{apps/*,packages/*,packages/domain/*,packages/infrastructure/*}/src/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts,vue}'
      ],
      exclude: ['**/*.d.{ts,cts,mts}', '**/__tests__/**', '**/*.{test,spec}.*'],
      reporter: [['text', { skipFull: false }], 'html']
    }
  },
  staged: {
    // Merge duplicate declarations before sorting the combined list of members.
    '{apps,packages}/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts,vue}': [
      'vp lint --fix -A sort-imports',
      'vp lint --fix',
      'vp fmt --write'
    ]
  }
});
