import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(join(__dirname, "serviceAccountKey.json"), "utf-8")
);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});

// Export auth service for use in controllers
export const auth = getAuth(app);
export default app;