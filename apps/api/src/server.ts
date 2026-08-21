import "dotenv/config";
import { validateEnvironment } from "./config/environment.js";

validateEnvironment();

const { app } = await import("./app.js");
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
