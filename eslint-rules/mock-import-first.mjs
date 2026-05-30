/** @type {import('eslint').Rule.RuleModule} */
const mockImportFirst = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require side-effect `@/test/mocks/*` imports before other imports in test files',
    },
    messages: {
      mockImportFirst:
        'Side-effect mock imports (`import \'@/test/mocks/...\'`) must be first. See test/README.md#mock-import-order.',
      mockSideEffectRequired:
        'Add a side-effect mock import (`import \'@/test/mocks/...\'`) before other imports. See test/README.md#mock-import-order.',
    },
    schema: [],
  },
  create(context) {
    const isMockImport = statement =>
      typeof statement.source.value === 'string'
      && statement.source.value.startsWith('@/test/mocks/');

    const isSideEffectMockImport = statement =>
      statement.specifiers.length === 0 && isMockImport(statement);

    return {
      Program(node) {
        const imports = node.body.filter(statement => statement.type === 'ImportDeclaration');
        const mockImports = imports.filter(isMockImport);
        const sideEffectMockImports = imports.filter(isSideEffectMockImport);

        if (mockImports.length === 0) {
          return;
        }

        if (sideEffectMockImports.length === 0) {
          context.report({
            node: mockImports[0],
            messageId: 'mockSideEffectRequired',
          });
          return;
        }

        const firstNonSideEffectMockImport = imports.find(
          statement => !isSideEffectMockImport(statement),
        );

        if (!firstNonSideEffectMockImport) {
          return;
        }

        for (const sideEffectMockImport of sideEffectMockImports) {
          if (sideEffectMockImport.range[0] > firstNonSideEffectMockImport.range[0]) {
            context.report({
              node: sideEffectMockImport,
              messageId: 'mockImportFirst',
            });
          }
        }
      },
    };
  },
};

export default mockImportFirst;
