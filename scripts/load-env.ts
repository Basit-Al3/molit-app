import { config } from "dotenv";
// Mirror Next's precedence: .env.local wins over .env.
config({ path: ".env.local" });
config();
