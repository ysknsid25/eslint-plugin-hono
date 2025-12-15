import { RuleTester } from 'eslint';
import { routeGrouping } from './route-grouping';
import { describe, it, afterAll } from 'vitest';

// Check if RuleTester supports dependency injection for testing framework, 
// otherwise rely on globals.
// eslint v9 RuleTester doesn't expose it/describe override statically like @typescript-eslint/rule-tester.
// But it usually works if globals are present.

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
});

ruleTester.run('route-grouping', routeGrouping as any, {
  valid: [
    // Basic grouping
    `
      const app = new Hono();
      app.get('/path1', (c) => c.text('get'));
      app.post('/path1', (c) => c.text('post'));
      app.get('/path2', (c) => c.text('get'));
    `,
    // Method chaining
    `
      const app = new Hono();
      app.get('/path1', (c) => c.text('get'))
         .post((c) => c.text('post'));
    `,
    // Correct order
    `
      const app = new Hono();
      app.get('/path1', (c) => c.text('get'));
      app.post('/path1', (c) => c.text('post'));
      app.delete('/path1', (c) => c.text('delete'));
    `,
    // app.route (existing test - should be valid)
    `
      const app = new Hono();
      app.route('/api', api);
      app.get('/other', (c) => c.text('other'));
    `,
    // With basePath (treated as distinct objects usually, but if in same block, logic applies to statements)
    `
      const app = new Hono().basePath('/api');
      app.get('/users', (c) => c.text('users'));
      app.post('/users', (c) => c.text('create user'));
    `,
    // All methods
    `
      const app = new Hono();
      app.use('/path', m);
      app.all('/path', h);
      app.get('/path', h);
      app.post('/path', h);
      app.put('/path', h);
      app.patch('/path', h);
      app.delete('/path', h);
      app.options('/path', h);
    `,
    // app.route is ignored for grouping/ordering
    `
      const app = new Hono();
      const subApp = new Hono();
      app.get('/main', (c) => c.text('main'));
      app.route('/sub', subApp);
      app.post('/main', (c) => c.text('main post'));
    `,
    // app.route with chaining (should still apply rule to get, and route part is ignored)
    `
      const app = new Hono();
      app.route('/base', new Hono()).get('/users', (c) => c.text('users'));
    `,
    // Nested routing and internal methods (internal router methods are still checked)
    `
      const app = new Hono();
      const users = new Hono();
      users.get('/list', (c) => c.text('list users'));
      users.post('/create', (c) => c.text('create user'));
      app.route('/users', users);
    `,
    // Multiple app.route calls (should be ignored)
    `
      const app = new Hono();
      const one = new Hono();
      const two = new Hono();
      app.route('/one', one);
      app.route('/two', two);
      app.get('/test', (c) => c.text('test'));
    `,
  ],
  invalid: [
    // Ungrouped routes
    {
      code: `
        const app = new Hono();
        app.get('/path1', (c) => c.text('get'));
        app.get('/path2', (c) => c.text('get'));
        app.post('/path1', (c) => c.text('post'));
      `,
      errors: [{ messageId: 'routeGroup' }],
    },
    // Wrong order (post before get)
    {
      code: `
        const app = new Hono();
        app.post('/path1', (c) => c.text('post'));
        app.get('/path1', (c) => c.text('get'));
      `,
      errors: [{ messageId: 'methodOrder' }],
    },
    // Wrong order in chain
    {
      code: `
        const app = new Hono();
        app.post('/path1', (c) => c.text('post'))
           .get((c) => c.text('get'));
      `,
      errors: [{ messageId: 'methodOrder' }],
    },
    // Ungrouped with different methods
    {
      code: `
        const app = new Hono();
        app.get('/a', c => c.text('a'));
        app.get('/b', c => c.text('b'));
        app.delete('/a', c => c.text('a'));
      `,
      errors: [{ messageId: 'routeGroup' }],
    }
  ],
});
