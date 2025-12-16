import { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils';

type Options = [];
type MessageIds = 'unusedContextResponse';

const RESPONSE_METHODS = new Set([
  'json',
  'text',
  'html',
  'redirect',
  'body',
  'notFound',
]);

export const noUnusedContextResponse = createRule<Options, MessageIds>({
  name: 'no-unused-context-response',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused calls to Context response methods',
    },
    schema: [],
    messages: {
      unusedContextResponse: 'The result of {{methodName}} is not returned or used. This response will not be sent.',
    },
  },
  defaultOptions: [],
  create(context) {
    const contextParamsStack: string[][] = [];

    function enterFunction(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression) {
      const params: string[] = [];
      if (node.params.length > 0) {
        const firstParam = node.params[0];
        if (firstParam.type === 'Identifier') {
          params.push(firstParam.name);
        }
      }
      contextParamsStack.push(params);
    }

    function exitFunction() {
      contextParamsStack.pop();
    }

    return {
      'FunctionDeclaration': enterFunction,
      'FunctionExpression': enterFunction,
      'ArrowFunctionExpression': enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression') return;

        const { object, property } = callee;

        if (property.type !== 'Identifier' || !RESPONSE_METHODS.has(property.name)) {
          return;
        }

        if (object.type !== 'Identifier') {
          return;
        }

        const isContextParam = contextParamsStack.some(params => params.includes(object.name));
        if (!isContextParam) {
          return;
        }

        if (node.parent.type === 'ExpressionStatement') {
          context.report({
            node,
            messageId: 'unusedContextResponse',
            data: {
              methodName: `${object.name}.${property.name}()`,
            },
          });
        }
      },
    };
  },
});
