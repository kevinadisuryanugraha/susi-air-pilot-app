import * as fs from 'node:fs';
import * as path from 'node:path';

const src = path.resolve('src/data');
const dist = path.resolve('dist/data');

if (fs.existsSync(src)) {
  fs.mkdirSync(dist, { recursive: true });
  fs.cpSync(src, dist, { recursive: true });
  console.log(`Copied ${src} -> ${dist}`);
}
