import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`=================================================`);
    console.log(` SPSU Campus Management System API v1.0 running `);
    console.log(` Environment: ${env.NODE_ENV}`);
    console.log(` Server URL:  http://localhost:${env.PORT}`);
    console.log(`=================================================`);
  });
};

startServer();
