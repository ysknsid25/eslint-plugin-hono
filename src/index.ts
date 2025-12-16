import { routeGrouping } from './rules/route-grouping';
import { preferHttpException } from './rules/prefer-http-exception';
import { paramNameMismatch } from './rules/param-name-mismatch';
import { noMultipleNext } from './rules/no-multiple-next';
import { noUnusedContextResponse } from './rules/no-unused-context-response';
import { noProcessEnv } from './rules/no-process-env';

export const rules = {
  'route-grouping': routeGrouping,
  'prefer-http-exception': preferHttpException,
  'param-name-mismatch': paramNameMismatch,
  'no-multiple-next': noMultipleNext,
  'no-unused-context-response': noUnusedContextResponse,
  'no-process-env': noProcessEnv,
};

export default {
  rules,
};
