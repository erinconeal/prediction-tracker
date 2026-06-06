/** @type {import('eslint').Rule.RuleModule} */
const noImplementationAssertions = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow class/DOM-structure assertions in tests; prefer user-visible queries',
    },
    messages: {
      toHaveClass:
        'Avoid toHaveClass(). Assert roles, labels, visibility, or ARIA state instead. See test/README.md#query-priority.',
      querySelector:
        'Avoid querySelector(). Query by role, label, or text instead. See test/README.md#query-priority.',
      className:
        'Avoid asserting on className. Assert user-visible behavior instead. See test/README.md#query-priority.',
    },
    schema: [],
  },
  create(context) {
    const reportClassName = node => {
      context.report({ node, messageId: 'className' });
    };

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression'
          && node.callee.property.type === 'Identifier'
        ) {
          if (node.callee.property.name === 'toHaveClass') {
            context.report({ node, messageId: 'toHaveClass' });
          }
          if (node.callee.property.name === 'querySelector') {
            context.report({ node, messageId: 'querySelector' });
          }
        }
      },
      MemberExpression(node) {
        if (
          node.property.type !== 'Identifier'
          || node.property.name !== 'className'
        ) {
          return;
        }

        let current = node.parent;
        while (current) {
          if (
            current.type === 'CallExpression'
            && current.callee.type === 'Identifier'
            && current.callee.name === 'expect'
          ) {
            reportClassName(node);
            return;
          }
          current = current.parent;
        }
      },
    };
  },
};

export default noImplementationAssertions;
