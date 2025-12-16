import { ESLintUtils } from '@typescript-eslint/utils';

export const createRule = ESLintUtils.RuleCreator(
  name => `https://github.com/honojs/eslint-plugin-hono/blob/main/docs/rules/${name}.md`,
);
