import express, {Request, Response} from 'express';
import * as env from 'env-var';
import * as pino from 'pino';
import * as path from 'path';
import ScheduleController from './routes/schedulecontroller';

const PORT = env.get('PORT').default('9001').asPortNumber();

// const app = express();
export const app: express.Application = express();

// Add kubernetes liveness and readiness probes at
// /api/health/readiness and /api/health/liveness
require('kube-probe')(app);

// Include sensible security headers by default
app.use(require('helmet')());
// Log incoming requests
app.use(require('morgan')('combined'));

let schedulecController = new ScheduleController();
app.use('/', schedulecController.router);

app.listen(PORT, () => {
  console.log(`🚀 server listening on port ${PORT}`);
});
