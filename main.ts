// Midnight Vault — make.fun "Make the best heist game" entry (Node 22, standard library only).
// The game is this directory's game/ folder: plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library and no network request). This program hands it
// in: it copies game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, using the vendored make.fun library.
// The game itself is a top-down stealth heist: sneak through the museum, steal the loot, dodge
// guard and camera vision cones, keep the alarm below 100%, and escape through the EXIT.
// Put your 3 or 4 PNG or JPEG screenshots in screenshots/ (the first by name is the cover).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Build it with `node main.ts`, or print usage with `node main.ts --help`.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// A --out <dir> flag overrides both the environment variable and the default:
//   node main.ts --out out

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const USAGE = `Midnight Vault — build the "Make the best heist game" entry.

Usage:
  node main.ts [--out <dir>] [--help]

Options:
  --out <dir>   Write the entry to <dir> instead of $MAKEFUN_OUTPUT_DIR or /output.
  --help, -h    Print this usage and exit.

What it does:
  Copies game/ and screenshots/ from beside this file into the output
  directory and writes dossier.json there, the summary the judge reads.
  The output directory is created if it does not exist.`;

function fail(message) {
  console.error(`main.ts: error: ${message}`);
  process.exit(1);
}

// Parse the small flag set this program accepts. Anything else is a typo
// worth failing on, so a bad invocation never silently builds the wrong thing.
function parseArgs(argv) {
  const parsed = { outDir: undefined, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--out') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) fail('--out needs a directory, e.g. node main.ts --out out');
      parsed.outDir = value;
      i++;
    } else if (arg.startsWith('--out=')) {
      const value = arg.slice('--out='.length);
      if (!value) fail('--out needs a directory, e.g. node main.ts --out=out');
      parsed.outDir = value;
    } else {
      fail(`unknown argument: ${arg} (see node main.ts --help)`);
    }
  }
  return parsed;
}

// Count every file under a directory, recursively, for the build summary.
function countFiles(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

const here = fileURLToPath(new URL('.', import.meta.url));
const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(USAGE);
  process.exit(0);
}

const out = args.outDir ?? process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate the inputs before copying anything, so a broken entry fails here
// with a clear message instead of producing a half-built output directory.
const gameDir = join(here, 'game');
if (!existsSync(gameDir)) fail(`game/ folder not found beside main.ts (${here})`);
if (!existsSync(join(gameDir, 'index.html'))) {
  fail('game/index.html not found: the game needs an index.html entrypoint');
}

mkdirSync(out, { recursive: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
const shotDir = join(here, 'screenshots');
if (existsSync(shotDir)) cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

const gameFiles = countFiles(join(out, 'game'));
const shotFiles = existsSync(join(out, 'screenshots')) ? countFiles(join(out, 'screenshots')) : 0;
const dossierBytes = statSync(dossierPath).size;
console.log(`Midnight Vault build done:
  output:      ${out}
  game files:  ${gameFiles}
  screenshots: ${shotFiles}
  dossier:     ${dossierPath} (${dossierBytes} bytes)`);
