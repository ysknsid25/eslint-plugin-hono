import { RuleTester } from 'eslint';
import { noMultipleNext } from './no-multiple-next';
import * as parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('no-multiple-next', noMultipleNext as unknown as import('eslint').Rule.RuleModule, {
  valid: [
    // Single next call
    `
      const middleware = async (c, next) => {
        await next();
      };
    `,
    // If/Else branches
    `
      const middleware = async (c, next) => {
        if (c.req.header('X-Custom')) {
          await next();
        } else {
          await next();
        }
      };
    `,
    // Middleware without next call
    `
      const middleware = async (c, next) => {
        return c.text('Hello');
      };
    `,
    // Nested function (should not confuse outer next)
    `
      const middleware = async (c, next) => {
        const otherFunc = async (c, next) => {
          await next();
        };
        await next();
      };
    `,
    // Sequential but unreachable (CodePath analysis might be smart enough or we might flag it)
    // Actually, if it's reachable, it's an error.
    // Return early
    `
      const middleware = async (c, next) => {
        if (true) {
          return next();
        }
        await next(); // This is technically unreachable code, but if reachable it would be double next. 
                      // ESLint CodePath handles reachability.
      };
    `
  ],
  invalid: [
    // Simple double call
    {
      code: `
        const middleware = async (c, next) => {
          await next();
          await next();
        };
      `,
      errors: [{ messageId: 'multipleNext' }],
    },
    // Call in if and after if (reachable)
    {
      code: `
        const middleware = async (c, next) => {
          if (condition) {
            await next();
          }
          await next();
        };
      `,
      errors: [{ messageId: 'multipleNext' }],
    },
    // Loop
    {
      code: `
        const middleware = async (c, next) => {
          while (true) {
            await next();
          }
        };
      `,
      errors: [{ messageId: 'multipleNext' }], // It reports because loop segment re-enters itself
    },
  ],
});
