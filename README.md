# eslint-plugin-hono

🔥 ESLint plugin for [Hono](https://hono.dev/)

## Installation

```bash
npm install -D eslint-plugin-hono@alpha
```

## Usage

Add `hono` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "hono"
    ],
    "rules": {
        "hono/route-grouping": ["error", {"order": ["use", "all", "get", "post", "put", "patch", "delete", "options", "on"]}],
        "hono/prefer-http-exception": "warn",
        "hono/param-name-mismatch": "error",
        "hono/no-multiple-next": "error",
        "hono/no-unused-context-response": "error"
    }
}
```

## Rules

| Rule | ⚠️ warn | 🚨 error | 🔧 fix |
| :--- | :---: | :---: | :---: |
| [route-grouping](#hono-route-grouping) | | ✅ | ✅ |
| [prefer-http-exception](#hono-prefer-http-exception) | ✅ | | |
| [param-name-mismatch](#hono-param-name-mismatch) | | ✅ | |
| [no-multiple-next](#hono-no-multiple-next) | | ✅ | |
| [no-unused-context-response](#hono-no-unused-context-response) | | ✅ | |

### hono/route-grouping

Enforce grouping and ordering of routes by HTTP method.

This rule helps organize Hono routes by ensuring that routes for the same path are grouped together and that HTTP methods follow a consistent order. **Note**: `app.route()` calls are excluded from these grouping and ordering checks, allowing for flexible sub-application mounting without triggering rule violations.

#### Options

```json
{
  "hono/route-grouping": ["error", {
    "order": [
      "use",
      "all",
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "on"
    ]
  }]
}
```

`order`: (array of strings, optional) Specifies the desired order of HTTP methods. The default order is `["use", "all", "get", "post", "put", "patch", "delete", "options", "on"]`.

#### Examples

**Incorrect**

```typescript
const app = new Hono();
app.get('/path1', (c) => c.text('get'));
app.get('/path2', (c) => c.text('get'));
app.post('/path1', (c) => c.text('post'));
```

**Correct**

```typescript
const app = new Hono();
app.get('/path1', (c) => c.text('get'));
app.post('/path1', (c) => c.text('post'));
app.get('/path2', (c) => c.text('get'));
```

**Incorrect Method Order**

```typescript
const app = new Hono();
app.post('/path1', (c) => c.text('post'));
app.get('/path1', (c) => c.text('get'));
```

**Correct Method Order**

```typescript
const app = new Hono();
app.get('/path1', (c) => c.text('get'));
app.post('/path1', (c) => c.text('post'));
```

### hono/prefer-http-exception

Suggest using `HTTPException` instead of generic `Error` for HTTP errors.

This rule detects when a standard `Error` is thrown with a message that corresponds to a standard HTTP status code (e.g., "Not Found", "Unauthorized"). In Hono applications, it is better to use `HTTPException` to return proper HTTP status codes.

#### Examples

**Incorrect**

```typescript
throw new Error('Not Found');
throw new Error('Unauthorized');
throw new Error('Bad Request');
```

**Correct**

```typescript
import { HTTPException } from 'hono/http-exception';

throw new HTTPException(404, { message: 'Not Found' });
throw new HTTPException(401, { message: 'Unauthorized' });
throw new HTTPException(400, { message: 'Bad Request' });
```

### hono/param-name-mismatch

Ensure parameter name in `c.req.param()` matches the route definition.

This rule checks that the parameter names used in `c.req.param('name')` call inside a route handler match the parameters defined in the route path (e.g., `/posts/:postId`). This prevents runtime errors caused by typos or mismatched parameter names.

#### Examples

**Incorrect**

```typescript
const app = new Hono();
app.get('/posts/:postId', (c) => {
  const id = c.req.param('id'); // 'id' is not defined in '/posts/:postId'
  return c.text(id);
});
```

**Correct**

```typescript
const app = new Hono();
app.get('/posts/:postId', (c) => {
  const postId = c.req.param('postId');
  return c.text(postId);
});
```

### hono/no-multiple-next

Disallow multiple calls to `next()` in a single middleware execution path.

Hono middleware relies on `await next()` to pass control to the next middleware. Calling `next()` multiple times in the same middleware function will cause a runtime error ("next() called multiple times"). This rule detects and prevents such patterns.

#### Examples

**Incorrect**

```typescript
const middleware = async (c, next) => {
  await next();
  await next(); // Error
};
```

```typescript
const middleware = async (c, next) => {
  if (condition) {
    await next();
  }
  await next(); // Error if condition is true
};
```

**Correct**

```typescript
const middleware = async (c, next) => {
  await next();
};
```

```typescript
const middleware = async (c, next) => {
  if (condition) {
    await next();
  } else {
    await next();
  }
};
```

### hono/no-unused-context-response

Disallow unused calls to Context response methods (`c.json`, `c.text`, etc.).

In Hono, methods like `c.json()` create a response object but do not send it automatically. If the return value is not returned from the handler (or awaited/used), the request might hang or result in a 404.

#### Examples

**Incorrect**

```typescript
app.get('/', (c) => {
  c.json({ message: 'hello' }); // return is missing!
});
```

**Correct**

```typescript
app.get('/', (c) => {
  return c.json({ message: 'hello' });
});
```

# License

Made by [Kanon](https://github.com/ysknsid25). Publish under [MIT License](https://github.com/ysknsid25/eslint-plugin-citty/blob/master/LICENSE).