import { log } from "@repo/logger";
import { createServer, setupGracefulShutdown } from "./server";

const port = process.env.PORT || 5001;
const server = createServer();

const runningServer = server.listen(port, () => {
  log(`api running on ${port}`);
});

setupGracefulShutdown(runningServer);
