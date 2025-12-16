import { RuleTester } from 'eslint';
import { preferHttpException } from './prefer-http-exception';
import * as parser from '@typescript-eslint/parser';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('prefer-http-exception', preferHttpException as unknown as import('eslint').Rule.RuleModule, {
  valid: [
    // Regular errors
    `throw new Error('Something went wrong');`,
    `throw new Error('Database connection failed');`,
    `throw new Error('Invalid input');`,
    
    // Correct usage of HTTPException
    `import { HTTPException } from 'hono/http-exception'; throw new HTTPException(404, { message: 'Not Found' });`,
    `throw new HTTPException(401, { message: 'Unauthorized' });`,
    
    // Dynamic messages (ignored)
    `const msg = 'Not Found'; throw new Error(msg);`,
    `throw new Error('Not ' + 'Found');`,
  ],
  invalid: [
    {
      code: `throw new Error('Not Found');`,
      errors: [
        {
          message: 'Prefer using HTTPException(404, { message: "Not Found" }) instead of throwing a generic Error with HTTP status message.',
        },
      ],
    },
    {
      code: `throw new Error('Unauthorized');`,
      errors: [
        {
          message: 'Prefer using HTTPException(401, { message: "Unauthorized" }) instead of throwing a generic Error with HTTP status message.',
        },
      ],
    },
    {
      code: `throw new Error('Bad Request');`,
      errors: [
        {
          message: 'Prefer using HTTPException(400, { message: "Bad Request" }) instead of throwing a generic Error with HTTP status message.',
        },
      ],
    },
    {
      code: `throw new Error('Internal Server Error');`,
      errors: [
        {
          message: 'Prefer using HTTPException(500, { message: "Internal Server Error" }) instead of throwing a generic Error with HTTP status message.',
        },
      ],
    },
    // Case insensitive check
    {
      code: `throw new Error('not found');`,
      errors: [
        {
          message: 'Prefer using HTTPException(404, { message: "not found" }) instead of throwing a generic Error with HTTP status message.',
        },
      ],
    },
  ],
});
