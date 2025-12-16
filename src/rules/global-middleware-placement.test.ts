import { RuleTester } from 'eslint';
import { globalMiddlewarePlacement } from './global-middleware-placement';
import * as parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run(
  'global-middleware-placement',
  globalMiddlewarePlacement as unknown as import('eslint').Rule.RuleModule,
  {
    valid: [
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.use('*', (c, next) => next());
          app.get('/', (c) => c.text('ok'));
        `,
      },
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.use((c, next) => next());
          app.use('*', (c, next) => next());
          app.get('/', (c) => c.text('ok'));
          app.post('/', (c) => c.text('ok'));
        `,
      },
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.get('/', (c) => c.text('ok'));
        `,
      },
      {
        code: `
          import { Hono } from 'hono';
          const router = new Hono();
          router.use('/admin/*', (c, next) => next());
          router.get('/dashboard', (c) => c.text('admin'));

          const app = new Hono();
          app.route('/admin', router);
        `,
      },
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.get('/', (c) => c.text('ok'));
          app.use('/admin', (c, next) => next()); // Path-specific, so it's fine
        `,
      },
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.post('/', (c) => c.text('create'));
          app.use('/api/*', (c, next) => next()); // Path-specific, so it's fine
        `,
      },
    ],
    invalid: [
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.get('/', (c) => c.text('ok'));
          app.use('*', (c, next) => next());
        `,
        errors: [{ messageId: 'placeMiddlewareBeforeRoutes' }],
      },
      {
        code: `
          import { Hono } from 'hono';
          const app = new Hono();
          app.get('/', (c) => c.text('ok'));
          app.use((c, next) => next());
        `,
        errors: [{ messageId: 'placeMiddlewareBeforeRoutes' }],
      },
    ],
  }
);
