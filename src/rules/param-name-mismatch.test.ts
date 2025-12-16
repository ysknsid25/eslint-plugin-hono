import { RuleTester } from 'eslint';
import { paramNameMismatch } from './param-name-mismatch';
import * as parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('param-name-mismatch', paramNameMismatch as unknown as import('eslint').Rule.RuleModule, {
  valid: [
    // Correct usage
    `
      const app = new Hono();
      app.get('/posts/:id', (c) => {
        const id = c.req.param('id');
        return c.text(id);
      });
    `,
    // Multiple params
    `
      const app = new Hono();
      app.get('/posts/:postId/comments/:commentId', (c) => {
        const postId = c.req.param('postId');
        const commentId = c.req.param('commentId');
        return c.text('ok');
      });
    `,
    // Optional param (treated as param)
    `
      const app = new Hono();
      app.get('/posts/:id?', (c) => {
        const id = c.req.param('id');
        return c.text(id);
      });
    `,
    // No params
    `
      const app = new Hono();
      app.get('/hello', (c) => {
        return c.text('hello');
      });
    `,
    // c.req.param() without arguments (get all params) - ignored by this rule
    `
      const app = new Hono();
      app.get('/posts/:id', (c) => {
        const params = c.req.param();
        return c.json(params);
      });
    `,
    // Middleware usage (might access params defined earlier, but locally validation is limited to defined path)
    // If path is defined, we validate against it.
    `
      app.get('/posts/:id', async (c, next) => {
        await next();
        const id = c.req.param('id');
      });
    `,
  ],
  invalid: [
    // Mismatch param name
    {
      code: `
        const app = new Hono();
        app.get('/posts/:postId', (c) => {
          const id = c.req.param('id');
          return c.text(id);
        });
      `,
      errors: [
        {
          message: 'Parameter \'id\' is not defined in the route path \'/posts/:postId\'. Expected one of: postId',
        },
      ],
    },
    // Typo
    {
      code: `
        const app = new Hono();
        app.get('/users/:userId', (c) => {
          const id = c.req.param('userIk');
          return c.text(id);
        });
      `,
      errors: [
        {
          message: 'Parameter \'userIk\' is not defined in the route path \'/users/:userId\'. Expected one of: userId',
        },
      ],
    },
    // Using param when none defined
    {
      code: `
        const app = new Hono();
        app.get('/hello', (c) => {
          const id = c.req.param('id');
          return c.text('hello');
        });
      `,
      errors: [
        {
          message: 'Parameter \'id\' is not defined in the route path \'/hello\'. Expected one of: (none)',
        },
      ],
    },
    // Wrong param from multiple
    {
      code: `
        app.get('/posts/:postId/comments/:commentId', (c) => {
          const id = c.req.param('id'); 
        });
      `,
      errors: [
        {
          message: 'Parameter \'id\' is not defined in the route path \'/posts/:postId/comments/:commentId\'. Expected one of: postId, commentId',
        },
      ],
    },
  ],
});
