import { routeGrouping } from './rules/route-grouping';
import { preferHttpException } from './rules/prefer-http-exception';
import { paramNameMismatch } from './rules/param-name-mismatch';
import { noMultipleNext } from './rules/no-multiple-next';
import { noUnusedContextResponse } from './rules/no-unused-context-response';
import { noProcessEnv } from './rules/no-process-env';
import { globalMiddlewarePlacement } from './rules/global-middleware-placement';

const rules = {
  'route-grouping': routeGrouping,
  'prefer-http-exception': preferHttpException,
  'param-name-mismatch': paramNameMismatch,
  'no-multiple-next': noMultipleNext,
  'no-unused-context-response': noUnusedContextResponse,
  'no-process-env': noProcessEnv,
  'global-middleware-placement': globalMiddlewarePlacement,
};

const configs = {
  recommended: [
    {
      rules: {
        'hono/route-grouping': [
          'error',
          {
            order: [
              'use',
              'all',
              'get',
              'post',
              'put',
              'patch',
              'delete',
              'options',
              'on',
            ],
          },
        ],
        'hono/prefer-http-exception': 'warn',
        'hono/param-name-mismatch': 'error',
        'hono/no-multiple-next': 'error',
        'hono/no-unused-context-response': 'error',
        'hono/no-process-env': 'warn',
        'hono/global-middleware-placement': 'warn',
      },
    },
  ],
};

export default {
  rules,
  configs,
};
