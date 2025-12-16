import { RuleTester } from 'eslint';
import { noProcessEnv } from './no-process-env';
import * as parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: false,
      },
    },
  },
});

ruleTester.run(
  'no-process-env',
  noProcessEnv as unknown as import('eslint').Rule.RuleModule,
  {
    valid: [
      {
        code: `
          const handler = (c) => {
            const apiKey = c.env.API_KEY;
            return c.json({ apiKey });
          };
        `,
      },
      {
        code: `
          const apiKey = process.env.API_KEY;
          const handler = (c) => {
            return c.json({ apiKey });
          };
        `,
      },
      {
        code: `
          function notAHandler(process) {
            const env = process.env;
          }
        `,
      },
      {
        code: `
          const handler = (context) => {
            const apiKey = process.env.API_KEY;
            return context.json({ apiKey });
          };
        `,
      },
    ],
    invalid: [
      {
        code: `
          const handler = (c) => {
            const apiKey = process.env.API_KEY;
            return c.json({ apiKey });
          };
        `,
        errors: [{ messageId: 'noProcessEnv' }],
      },
      {
        code: `
          app.get('/api', (c) => {
            console.log(process.env.NODE_ENV);
            return c.text('ok');
          })
        `,
        errors: [{ messageId: 'noProcessEnv' }],
      },
      {
        code: `
          function handler(c, next) {
            const secret = process.env.SECRET;
            if (!secret) throw new Error('secret not set');
            await next();
          }
        `,
        errors: [{ messageId: 'noProcessEnv' }],
      },
    ],
  },
);
