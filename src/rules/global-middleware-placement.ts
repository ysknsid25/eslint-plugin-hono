import { TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils';

type Options = [];
type MessageIds = 'placeMiddlewareBeforeRoutes';

export const globalMiddlewarePlacement = createRule<Options, MessageIds>({
  name: 'global-middleware-placement',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that global middleware is placed before route definitions.',
    },
    schema: [],
    messages: {
      placeMiddlewareBeforeRoutes:
        'Global middleware (e.g., `app.use(logger)` or `app.use(\'*\', logger)`) should be placed before any route definitions.',
    },
  },
  defaultOptions: [],
  create(context) {
    const honoInstances = new Map<
      string,
      { node: TSESTree.Node; routeDefined: boolean }
    >();
    const routeDefiningMethods = new Set([
      'all',
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'on',
    ]);

    return {
      VariableDeclarator(node) {
        if (
          node.init
          && node.init.type === 'NewExpression'
          && node.init.callee.type === 'Identifier'
          && node.init.callee.name === 'Hono'
          && node.id.type === 'Identifier'
        ) {
          honoInstances.set(node.id.name, { node, routeDefined: false });
        }
      },
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression'
          || node.callee.object.type !== 'Identifier'
        ) {
          return;
        }

        const instanceName = node.callee.object.name;
        const instanceState = honoInstances.get(instanceName);

        if (!instanceState) {
          return;
        }

        const propertyName = (node.callee.property as TSESTree.Identifier).name;

        if (propertyName === 'use') {
          const firstArg = node.arguments[0];
          const isGlobal
            = !firstArg
              || firstArg.type !== 'Literal'
              || (firstArg.type === 'Literal' && firstArg.value === '*');

          if (isGlobal && instanceState.routeDefined) {
            context.report({
              node,
              messageId: 'placeMiddlewareBeforeRoutes',
            });
          }
        }
        else if (routeDefiningMethods.has(propertyName)) {
          instanceState.routeDefined = true;
        }
      },
    };
  },
});
