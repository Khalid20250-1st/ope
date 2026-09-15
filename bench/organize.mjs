// The organisation checklist, scored the same way for both runs.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = process.argv[2];
const messy = process.argv[3] === 'messy';   // fewer changes, so fewer checkpoints expected
const files = [];
(function walk(d){ for (const f of readdirSync(d)) {
  if (['.git', 'node_modules', 'ope-system'].includes(f)) continue;
  const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p.slice(dir.length + 1));
} })(dir);
const git = (...a) => { try { return execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' }); } catch { return ''; } };
const isRepo = existsSync(join(dir, '.git'));
const commits = isRepo ? git('rev-list', '--count', 'HEAD').trim() * 1 || 0 : 0;
const tags = isRepo ? git('tag').split('\n').filter(t => /^\d+\.\d+$/.test(t)) : [];
const source = files.filter(f => ['.js', '.mjs', '.html', '.css'].includes(extname(f)));
const lines = source.map(f => readFileSync(join(dir, f), 'utf8').split('\n'));
const commented = source.filter((f, i) => /^\s*(\/\/|\/\*|\*|<!--|#)/.test(lines[i].slice(0, 3).join('\n').trimStart().split('\n')[0] || '')
  || lines[i].slice(0, 3).some(l => /^\s*(\/\/|\/\*|<!--)/.test(l)));
const largest = Math.max(0, ...lines.map(l => l.length));
const leftovers = files.filter(f => /(\.bak|\.old|\.orig|~|copy|backup|\.tmp)$/i.test(f) || /(^|\/)(old|backup)[-_.]/i.test(f));
const history = ['PROJECTS.md', 'CHANGELOG.md', 'README.md'].find(f => existsSync(join(dir, f)));
const items = [
  { name: 'saved with git', ok: isRepo },
  { name: messy ? 'a checkpoint for each change (3 or more commits)' : 'a checkpoint for each change (8 or more commits)', ok: commits >= (messy ? 3 : 8) },
  { name: 'numbered version tags', ok: tags.length >= (messy ? 2 : 4) },
  { name: 'a written list of what each version did', ok: !!history && /1\.1|due|tags|priority/i.test(readFileSync(join(dir, history), 'utf8')) },
  { name: 'every source file says what it is for (80% or more)', ok: source.length > 0 && commented.length / source.length >= 0.8 },
  { name: 'no single file over 400 lines', ok: largest <= 400 },
  { name: 'no leftover backup or old files', ok: leftovers.length === 0 },
];
console.log(JSON.stringify({ passed: items.filter(i => i.ok).length, total: items.length, items,
  facts: { commits, tags: tags.length, sourceFiles: source.length, commented: commented.length, largest, leftovers } }));
