/**
 * The Express app is for serving client assets out of the public
 * directory and for potentially handling any requests, if necessary,
 * that are not handled over game websockets.
 */

import express, {
  NextFunction,
  Request,
  Response
} from "express";
import path from "path";
import {fileURLToPath} from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Serve client UI assets on root route /
app.use(express.static(path.join(__dirname, "public")));

// Don't report 404 for favicon, if not found (this handler must be last).
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/favicon.ico") return res.status(204);
  return next();
});