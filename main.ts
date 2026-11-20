import { cpSync, mkdirSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const sourceRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
if (outputRoot === resolve(sourceRoot)) throw new Error('Choose an output directory distinct from the source repository.');
for (const protectedFolder of ['game', 'screenshots', 'vendor']) {
  const protectedRoot = resolve(sourceRoot, protectedFolder);
  if (outputRoot === protectedRoot || outputRoot.startsWith(protectedRoot + sep)) {
    throw new Error('Output must not be inside an entry source folder: ' + protectedFolder);
  }
}
const indexFile = statSync(join(sourceRoot, 'game', 'index.html'));
if (!indexFile.isFile() || indexFile.size > 1048576) throw new Error('game/index.html must be a regular file no larger than 1 MiB.');
const shots = readdirSync(join(sourceRoot, 'screenshots')).filter(name => !name.startsWith('.')).sort();
if (shots.length < 3 || shots.length > 4) throw new Error('Capture three or four gameplay screenshots before packaging.');
for (const name of shots) {
  const shot = statSync(join(sourceRoot, 'screenshots', name));
  if (name.length > 128 || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.(png|jpe?g)$/i.test(name) || !shot.isFile() || shot.size > 262144) {
    throw new Error('Invalid screenshot name, type, or size: ' + name);
  }
}
for (const folder of ['game', 'screenshots']) {
  const source = join(sourceRoot, folder);
  if (!statSync(source).isDirectory()) throw new Error('Required entry folder missing: ' + folder);
  mkdirSync(join(outputRoot, folder), { recursive: true });
  cpSync(source, join(outputRoot, folder), { recursive: true });
}
const dossier = buildDossier(outputRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
if (Buffer.byteLength(dossier) > 1572864) throw new Error('Dossier exceeds the competition cap.');
JSON.parse(Buffer.from(dossier).toString('utf8'));
writeFileSync(join(outputRoot, 'dossier.json'), dossier);
console.log('Breakwater 84 packaged: ' + Buffer.byteLength(dossier) + ' dossier bytes at ' + outputRoot);
