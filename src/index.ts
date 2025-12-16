import { routeGrouping } from './rules/route-grouping';
import { preferHttpException } from './rules/prefer-http-exception';
import { paramNameMismatch } from './rules/param-name-mismatch';
import { noMultipleNext } from './rules/no-multiple-next';

export const rules = {
  'route-grouping': routeGrouping,
  'prefer-http-exception': preferHttpException,
  'param-name-mismatch': paramNameMismatch,
  'no-multiple-next': noMultipleNext,
};

export default {
  rules,
};
