import "dotenv/config";
import { createApp } from "./app";
import { config } from "./config";

const app = createApp();
app.listen(config.port, () => {
  console.log(`pursuit-backend listening on :${config.port}`);
});
