import { routeGrouping } from './rules/route-grouping';
import { preferHttpException } from './rules/prefer-http-exception';

export const rules = {
  'route-grouping': routeGrouping,
  'prefer-http-exception': preferHttpException,
};

export default {
  rules,
};