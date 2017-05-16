import * as methodOverride from 'method-override';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import '../controllers/putController';
import '../controllers/postController';
import '../controllers/patchController';
import '../controllers/getController';
import '../controllers/deleteController';

import '../controllers/methodController';
import '../controllers/parameterController';
import '../controllers/securityController';

import { RegisterRoutes } from './routes';

export const app: express.Express = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use((req: any, res: any, next: any) => {
  req.stringValue = 'fancyStringForContext';
  next();
});
RegisterRoutes(app);

// It's important that this come after the main routes are registered
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const body: any = {
    fields: err.fields || undefined,
    message: err.message || 'An error occurred during the request.',
    name: err.name,
    status
  };
  res.status(status).json(body);
});

app.listen(3000);
