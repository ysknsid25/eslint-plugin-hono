import { routeGrouping } from './rules/route-grouping';
import { preferHttpException } from './rules/prefer-http-exception';
import { paramNameMismatch } from './rules/param-name-mismatch';

export const rules = {
  'route-grouping': routeGrouping,
  'prefer-http-exception': preferHttpException,
  'param-name-mismatch': paramNameMismatch,
};

export default {
  rules,
};