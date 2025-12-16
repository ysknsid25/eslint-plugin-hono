import { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils';

type Options = [];
type MessageIds = 'paramMismatch';

const TARGET_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'all'];

export const paramNameMismatch = createRule<Options, MessageIds>({
  name: 'param-name-mismatch',
  meta: {
    type: 'problem',
    docs: {
      description:
                'Ensure param name in c.req.param() matches the route definition',
    },
    schema: [],
    messages: {
      paramMismatch:
                'Parameter \'{{paramName}}\' is not defined in the route path \'{{routePath}}\'. Expected one of: {{expectedParams}}',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    function getRouteParams(path: string): string[] {
      const params: string[] = [];
      const regex = /:([a-zA-Z0-9_]+)(\?)?/g;
      let match;
      while ((match = regex.exec(path)) !== null) {
        params.push(match[1]);
      }
      return params;
    }

    function validateHandler(
      handlerNode: TSESTree.Node,
      contextParamName: string, // Name of the 'c' argument
      definedParams: string[],
      routePath: string,
    ) {
      function visit(node: TSESTree.Node) {
        if (!node) return;

        if (node.type === 'CallExpression') {
          const callee = node.callee;
          if (
            callee.type === 'MemberExpression'
            && callee.property.type === 'Identifier'
            && callee.property.name === 'param'
            && callee.object.type === 'MemberExpression'
            && callee.object.property.type === 'Identifier'
            && callee.object.property.name === 'req'
            && callee.object.object.type === 'Identifier'
            && callee.object.object.name === contextParamName
          ) {
            if (
              node.arguments.length > 0
              && node.arguments[0].type === 'Literal'
            ) {
              const usedParam = node.arguments[0].value;
              if (typeof usedParam === 'string') {
                if (!definedParams.includes(usedParam)) {
                  context.report({
                    node: node.arguments[0],
                    messageId: 'paramMismatch',
                    data: {
                      paramName: usedParam,
                      routePath,
                      expectedParams:
                                                definedParams.length > 0
                                                  ? definedParams.join(', ')
                                                  : '(none)',
                    },
                  });
                }
              }
            }
          }
        }

        const keys = sourceCode.visitorKeys[node.type] || [];
        for (const key of keys) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const child = (node as any)[key];
          if (child) {
            if (Array.isArray(child)) {
              for (const item of child) {
                if (item) visit(item);
              }
            }
            else {
              visit(child);
            }
          }
        }
      }

      visit(handlerNode);
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression'
          && node.callee.property.type === 'Identifier'
          && TARGET_METHODS.includes(node.callee.property.name)
        ) {
          if (node.arguments.length < 2) return;

          const pathArg = node.arguments[0];
          if (
            pathArg.type !== 'Literal'
            || typeof pathArg.value !== 'string'
          )
            return;

          const routePath = pathArg.value;
          const definedParams = getRouteParams(routePath);

          for (let i = 1; i < node.arguments.length; i++) {
            const arg = node.arguments[i];

            if (
              arg.type === 'ArrowFunctionExpression'
              || arg.type === 'FunctionExpression'
            ) {
              if (arg.params.length > 0) {
                const contextParam = arg.params[0];
                if (contextParam.type === 'Identifier') {
                  const contextName = contextParam.name;
                  if (arg.body.type === 'BlockStatement') {
                    validateHandler(
                      arg.body,
                      contextName,
                      definedParams,
                      routePath,
                    );
                  }
                  else {
                    validateHandler(
                      arg.body,
                      contextName,
                      definedParams,
                      routePath,
                    );
                  }
                }
              }
            }
          }
        }
      },
    };
  },
});
