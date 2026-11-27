import { definePlugin, defineRule } from 'vite-plus/lint/plugins';

const requireArrowFunctions = defineRule({
  meta: {
    type: 'suggestion',
    messages: { useArrow: 'Use an arrow function.' }
  },
  create: (context) => ({
    'FunctionDeclaration, FunctionExpression': (node) => {
      const { parent } = node;
      // Constructors and accessors require method syntax to preserve their semantics.
      if (
        parent.value === node &&
        ((parent.type === 'MethodDefinition' && parent.kind === 'constructor') ||
          (['MethodDefinition', 'Property'].includes(parent.type) && ['get', 'set'].includes(parent.kind)))
      ) {
        return;
      }
      context.report({ node, messageId: 'useArrow' });
    }
  })
});

export default definePlugin({
  meta: { name: 'workspace' },
  rules: { 'require-arrow-functions': requireArrowFunctions }
});
