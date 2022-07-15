import express from "express";
import path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Serve public UI assets on root route /
app.use(express.static(path.join(__dirname, 'public')));