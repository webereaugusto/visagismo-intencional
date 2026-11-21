// Copia o runtime WASM do MediaPipe para public/ (servido pelo próprio site, sem CDN de terceiros).
// Roda automaticamente antes de `npm run dev` e `npm run build`.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const dest = join(root, 'public', 'mediapipe', 'wasm');

mkdirSync(dest, { recursive: true });
for (const file of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm']) {
  copyFileSync(join(src, file), join(dest, file));
}
console.log('[mediapipe] runtime copiado para public/mediapipe/wasm');
