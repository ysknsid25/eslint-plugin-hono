import { RuleTester } from 'eslint';
import { noUnusedContextResponse } from './no-unused-context-response';
import * as parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('no-unused-context-response', noUnusedContextResponse as unknown as import('eslint').Rule.RuleModule, {
  valid: [
    // Returned
    `
      const app = new Hono();
      app.get('/', (c) => {
        return c.json({ message: 'hello' });
      });
    `,
    // Arrow function implicit return
    `
      app.get('/', (c) => c.json({ message: 'hello' }));
    `,
    // Assigned
    `
      app.get('/', (c) => {
        const response = c.json({ message: 'hello' });
        return response;
      });
    `,
    // Passed as argument
    `
      app.get('/', (c) => {
        return someFunction(c.json({ message: 'hello' }));
      });
    `,
    // Awaited
    `
      app.get('/', async (c) => {
        await c.json({ message: 'hello' });
      });
    `,
    // c.req.json() should be ignored
    `
      app.get('/', async (c) => {
        const body = await c.req.json();
        return c.text('ok');
      });
    `,
    // Not a context object
    `
      const other = { json: () => {} };
      other.json();
    `,
    // Nested correct usage
    `
      app.get('/', (c) => {
        const helper = () => {
          return c.text('nested');
        };
        return helper();
      });
    `,
  ],
  invalid: [
    // Unused c.json
    {
      code: `
        app.get('/', (c) => {
          c.json({ message: 'hello' });
        });
      `,
      errors: [{ messageId: 'unusedContextResponse' }],
    },
    // Unused c.text
    {
      code: `
        app.get('/', (c) => {
          c.text('hello');
        });
      `,
      errors: [{ messageId: 'unusedContextResponse' }],
    },
    // Unused c.redirect
    {
      code: `
        app.get('/', (c) => {
          c.redirect('/');
        });
      `,
      errors: [{ messageId: 'unusedContextResponse' }],
    },
    // Nested unused
    {
      code: `
        app.get('/', (c) => {
          const helper = () => {
            c.json({ message: 'nested unused' });
          };
        });
      `,
      errors: [{ messageId: 'unusedContextResponse' }],
    },
    // Multiple statements
    {
      code: `
        app.get('/', (c) => {
          c.json({ message: 'ignored' });
          return c.text('ok');
        });
      `,
      errors: [{ messageId: 'unusedContextResponse' }],
    },
    // Using ctx param name
    {
      code: `
        app.get('/', (ctx) => {
          ctx.json({ message: 'ignored' });
        });
      `,
      errors: [{ messageId: 'unusedContextResponse' }],
    },
  ],
});
