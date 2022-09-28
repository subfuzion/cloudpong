/**
 * The Express app is for serving frontend assets out of the public
 * directory and for potentially handling any API requests.
 */

import express, {NextFunction, Request, Response} from "express";
import path from "path";
import {fileURLToPath} from "url";


export const app = express();

// Serve frontend UI assets on root route /
app.use(express.static(path.join(
    path.dirname(fileURLToPath(import.meta.url)), "public")));

// Don't report 404 for favicon if not found (this handler must be last).
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/favicon.ico") return res.status(204);
  return next();
});
