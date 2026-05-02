import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

export const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT }, 'Server started');
});

server.on('error', (error) => {
  logger.error({ error }, 'Server failed to start');
  process.exit(1);
});
