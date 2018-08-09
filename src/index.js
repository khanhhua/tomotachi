import debug from 'debug';
import morgan from 'koa-morgan';
// Swagger documentation
import * as swagger from 'swagger2';
import { ui } from 'swagger2-koa';
import makeApp from './app';

const PORT = process.env.PORT || '8080';

const document = swagger.loadDocumentSync('./swagger/api.yaml');

const app = makeApp();
app.use(ui(document, "/swagger"));
app.use(morgan('combined'));

const dbg = debug('tomotachi');
Object.entries(process.env).forEach(([k, v]) => k.toUpperCase()===k && dbg(`${k}=${v}`));

Promise.all([
  // initDb().then(() => { dbg('Database configuration done'); }),
  Promise.resolve(true)
]).then(() => {
  dbg('Initialization completed');

  app.listen(PORT, () => {
    dbg(`Node environment: ${process.env.NODE_ENV}`);
    dbg(`Listening on port ${PORT}...`);
  });
}).catch(() => {
  process.exit(1);
});
