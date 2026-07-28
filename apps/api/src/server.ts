import "dotenv/config";
import { app } from "./app.js";
import { validateEnvironment } from "./config/environment.js";

validateEnvironment();
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
