import path from "path";
import {fileURLToPath} from "url";


export function filename(): string {
  return fileURLToPath(import.meta.url);
}

export function dirname(): string {
  return path.dirname(filename());
}
