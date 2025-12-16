import { createRule } from '../utils';

type Options = [];
type MessageIds = 'preferHttpException';

const HTTP_ERRORS: Record<string, number> = {
  'bad request': 400,
  'unauthorized': 401,
  'payment required': 402,
  'forbidden': 403,
  'not found': 404,
  'method not allowed': 405,
  'not acceptable': 406,
  'proxy authentication required': 407,
  'request timeout': 408,
  'conflict': 409,
  'gone': 410,
  'length required': 411,
  'precondition failed': 412,
  'payload too large': 413,
  'uri too long': 414,
  'unsupported media type': 415,
  'range not satisfiable': 416,
  'expectation failed': 417,
  'im_a_teapot': 418,
  'misdirected request': 421,
  'unprocessable entity': 422,
  'locked': 423,
  'failed dependency': 424,
  'too early': 425,
  'upgrade required': 426,
  'precondition required': 428,
  'too many requests': 429,
  'request header fields too large': 431,
  'unavailable for legal reasons': 451,
  'internal server error': 500,
  'not implemented': 501,
  'bad gateway': 502,
  'service unavailable': 503,
  'gateway timeout': 504,
  'http version not supported': 505,
  'variant also negotiates': 506,
  'insufficient storage': 507,
  'loop detected': 508,
  'not extended': 510,
  'network authentication required': 511,
};

export const preferHttpException = createRule<Options, MessageIds>({
  name: 'prefer-http-exception',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using HTTPException instead of generic Error for HTTP errors',
    },
    messages: {
      preferHttpException:
        'Prefer using HTTPException({{status}}, { message: "{{message}}" }) instead of throwing a generic Error with HTTP status message.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ThrowStatement(node) {
        const argument = node.argument;
        if (
          argument &&
          argument.type === 'NewExpression' &&
          argument.callee.type === 'Identifier' &&
          argument.callee.name === 'Error' &&
          argument.arguments.length === 1 &&
          argument.arguments[0].type === 'Literal' &&
          typeof argument.arguments[0].value === 'string'
        ) {
          const message = argument.arguments[0].value;
          const lowerMessage = message.toLowerCase();

          if (HTTP_ERRORS[lowerMessage]) {
            context.report({
              node: argument,
              messageId: 'preferHttpException',
              data: {
                status: HTTP_ERRORS[lowerMessage],
                message: message,
              },
            });
          }
        }
      },
    };
  },
});
