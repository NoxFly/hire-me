import * as fs from 'fs';
import * as path from 'path';

const baseDir = "/home/spacecowboy/Desktop/codes/projet_ihm/src/server/dev/out"
export function saveFile(fileName: string, buf: Buffer) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}