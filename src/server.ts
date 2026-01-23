import app from "./app.js";
import { env } from "./config/env.js";
import { testDBConnection } from "./config/db.js";

const startServer = async () => {
  await testDBConnection();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();
