# eslint-plugin-hono

🔥 ESLint plugin for [Hono](https://hono.dev/)

## Installation

```bash
npm install -D eslint-plugin-hono
```

## Usage

Add `hono` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "hono"
    ],
    "rules": {
        "hono/route-grouping": ["error", {"order": ["use", "all", "get", "post", "put", "patch", "delete", "options", "on"]}]
    }
}
```

## Rules

| Rule | ⚠️ warn | 🚨 error | 🔧 fix |
| :--- | :---: | :---: | :---: |
| [route-grouping](#route-grouping) | | ✅ | ✅ |

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

# License

Made by [Kanon](https://github.com/ysknsid25). Publish under [MIT License](https://github.com/ysknsid25/eslint-plugin-citty/blob/master/LICENSE).
