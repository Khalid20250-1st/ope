// Copies the Monaco editor (the editor inside VS Code) into web/vendor, so OPE
// works with no internet. Only the English build is kept.
import { cpSync, rmSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules/monaco-editor/min/vs');
const to = join(root, 'web/vendor/vs');
if (!existsSync(from)) { console.error('Run npm install first.'); process.exit(1); }
rmSync(to, { recursive: true, force: true });
mkdirSync(dirname(to), { recursive: true });
cpSync(from, to, { recursive: true });
for (const f of readdirSync(to)) if (/^nls\.messages\./.test(f)) rmSync(join(to, f));
console.log('monaco copied to web/vendor/vs');
