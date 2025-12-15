import { Hono } from 'hono';

const app = new Hono();

// This should be valid
app.get('/valid', (c) => c.text('valid get'));
app.post('/valid', (c) => c.text('valid post'));

// This should trigger 'routeGroup' error (split definition)
app.get('/split', (c) => c.text('split get'));
app.get('/other', (c) => c.text('other'));
app.post('/split', (c) => c.text('split post'));

// This should trigger 'methodOrder' error (post before get)
app.post('/order', (c) => c.text('order post'));
app.get('/order', (c) => c.text('order get'));

// Method chaining order error
app.post('/chain', (c) => c.text('chain post'))
   .get((c) => c.text('chain get'));
