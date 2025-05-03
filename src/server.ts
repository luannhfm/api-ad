import { buildApp } from "./app";
import { env } from './config/env';

buildApp()
  .then(app => app.listen({ port: Number(env.PORT), host: '0.0.0.0' }))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
