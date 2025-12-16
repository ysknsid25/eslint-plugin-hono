import { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils';

type Options = [];
type MessageIds = 'noProcessEnv';

export const noProcessEnv = createRule<Options, MessageIds>({
  name: 'no-process-env',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of process.env in favor of c.env.',
    },
    schema: [],
    messages: {
      noProcessEnv:
        'Use `c.env` instead of `process.env` inside Hono handlers to maintain platform-agnostic code.',
    },
  },
  defaultOptions: [],
  create(context) {
    let inHonoHandler = false;

    function isHonoHandler(node: TSESTree.Node): boolean {
      if (
        node.type !== 'ArrowFunctionExpression' &&
        node.type !== 'FunctionExpression' &&
        node.type !== 'FunctionDeclaration'
      ) {
        return false;
      }
      return node.params.some(
        (param) => param.type === 'Identifier' && param.name === 'c'
      );
    }

    return {
      ':function': (node: TSESTree.Node) => {
        if (isHonoHandler(node)) {
          inHonoHandler = true;
        }
      },
      ':function:exit': (node: TSESTree.Node) => {
        if (isHonoHandler(node)) {
          inHonoHandler = false;
        }
      },
      MemberExpression(node: TSESTree.MemberExpression) {
        if (
          inHonoHandler &&
          node.object.type === 'Identifier' &&
          node.object.name === 'process' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'env'
        ) {
          context.report({
            node,
            messageId: 'noProcessEnv',
          });
        }
      },
    };
  },
});
