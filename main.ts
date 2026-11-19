import { cpSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const root = import.meta.dirname;
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const shots = readdirSync(join(root, 'screenshots'), { withFileTypes: true })
  .filter(entry => !entry.name.startsWith('.'));
if (shots.length < 3 || shots.length > 4 || shots.some(entry => !entry.isFile() || !/\.(png|jpe?g)$/i.test(entry.name))) {
  throw new Error('Hand in three or four browser screenshots as PNG or JPEG.');
}
if (output === root) throw new Error('Choose a separate output directory.');
mkdirSync(output, { recursive: true });
for (const folder of ['game', 'screenshots']) {
  cpSync(join(root, folder), join(output, folder), { recursive: true });
}

const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
});
if (dossier.byteLength > 1572864) throw new Error('The dossier exceeds 1.5 MiB.');
writeFileSync(join(output, 'dossier.json'), dossier);
