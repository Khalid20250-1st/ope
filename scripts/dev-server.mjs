// Runs the OPE interface in a normal browser, for building and testing it.
//
//   npm run dev            then open http://localhost:8790
//
// The Mac app answers the same bridge commands in Swift (mac/main.swift). Both
// sides must stay identical: every command here exists there, with the same
// arguments and the same answer.
import http from 'node:http';
import { readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { readFileSync, writeFileSync, mkdirSync, watch, existsSync, statSync } from 'node:fs';
import { join, resolve, relative, extname, dirname, sep } from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, '..', 'web');
const PROMPT = join(HERE, '..', 'prompt', 'OPE-PROMPT.md');
const PORT = Number(process.env.PORT || 8790);

let root = process.env.OPE_ROOT || '';
/* the library of project folders, kept on this machine only */
const LIB = join(process.env.HOME, '.config', 'ope', 'library.json');
function library(){ try { return JSON.parse(readFileSync(LIB, 'utf8')); } catch { return []; } }
function saveLibrary(items){ mkdirSync(dirname(LIB), { recursive: true }); writeFileSync(LIB, JSON.stringify(items, null, 2)); return items; }
const recent = [];
const listeners = new Set();
let watcher = null;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png' };

/* the only git commands the interface may run */
const GIT_OK = new Set(['for-each-ref', 'log', 'diff', 'blame', 'rev-list', 'rev-parse', 'ls-files',
  'status', 'init', 'add', 'commit', 'tag', 'show']);
const SKIP = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.build', 'DerivedData', '.venv',
  'venv', '__pycache__', '.cache', 'Pods', '.turbo', '.wrangler', 'coverage']);

function inside(p){
  const full = resolve(root, p || '');
  if (full !== root && !full.startsWith(root + sep)) throw new Error('That path is outside the project.');
  return full;
}

function git(args){
  return new Promise(done => {
    if (!GIT_OK.has(args[0])) return done({ code: 1, out: '', err: 'not allowed' });
    execFile('git', ['-C', root, ...args], { maxBuffer: 64 * 1024 * 1024 }, (e, out, err) =>
      done({ code: e ? (e.code ?? 1) : 0, out: String(out || ''), err: String(err || '') }));
  });
}

async function walk(dir, out, depth){
  if (out.length > 20000 || depth > 25) return;
  let items = [];
  try { items = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const it of items) {
    if (SKIP.has(it.name) || it.name === '.DS_Store') continue;
    const full = join(dir, it.name);
    if (it.isDirectory()) await walk(full, out, depth + 1);
    else if (it.isFile()) out.push(relative(root, full));
  }
}

function watchRoot(){
  if (watcher) { watcher.close(); watcher = null; }
  if (!root) return;
  let timer = null, seen = new Set();
  watcher = watch(root, { recursive: true }, (_e, name) => {
    if (!name) return;
    const n = String(name);
    if (/(^|\/)(node_modules|\.next|dist|build)(\/|$)/.test(n)) return;
    if (/^\.git\//.test(n) && !/^\.git\/(refs|HEAD|index|packed-refs)/.test(n)) return;
    seen.add(n);
    clearTimeout(timer);
    timer = setTimeout(() => {
      const paths = [...seen]; seen = new Set();
      for (const res of listeners) res.write(`data: ${JSON.stringify({ paths })}\n\n`);
    }, 250);
  });
}

async function command(b){
  switch (b.cmd) {
    case 'hello': return { kind: 'dev', root, recent, library: library() };
    case 'open': {
      const p = resolve(String(b.path || '').replace(/^~(?=$|\/)/, process.env.HOME));
      if (!existsSync(p) || !statSync(p).isDirectory()) throw new Error('That folder does not exist.');
      root = p;
      const i = recent.indexOf(p); if (i >= 0) recent.splice(i, 1); recent.unshift(p); recent.length = Math.min(recent.length, 8);
      watchRoot();
      const lib = library();
      if (!lib.some(x => x.path === p)) { lib.push({ path: p, name: p.split('/').pop() }); saveLibrary(lib); }
      return { root, library: lib };
    }
    case 'pick': return { root: '', manual: true };
    case 'prompt': return { text: readFileSync(PROMPT, 'utf8') };
    case 'git': return root ? git((b.args || []).map(String)) : { code: 1, out: '', err: 'no project' };
    case 'list': { const out = []; if (root) await walk(root, out, 0); return { files: out.sort() }; }
    case 'read': {
      const full = inside(b.path);
      const s = await stat(full);
      if (s.size > 2 * 1024 * 1024) return { tooBig: true, size: s.size };
      const buf = await readFile(full);
      if (buf.subarray(0, 8000).includes(0)) return { binary: true, size: s.size };
      return { text: buf.toString('utf8'), size: s.size };
    }
    case 'write': { await writeFile(inside(b.path), String(b.text ?? ''), 'utf8'); return { ok: true }; }
    case 'copy': return { ok: false };
    case 'log': console.error('OPE: ' + b.text); return { ok: true };
    case 'libraryRemove': return { items: saveLibrary(library().filter(x => x.path !== String(b.path))) };
    default: throw new Error('Unknown command ' + b.cmd);
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
    res.write(': hi\n\n'); listeners.add(res); req.on('close', () => listeners.delete(res)); return;
  }
  if (url.pathname === '/bridge' && req.method === 'POST') {
    let body = ''; for await (const c of req) body += c;
    try { const out = await command(JSON.parse(body || '{}'));
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(out)); }
    catch (e) { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: e.message })); }
    return;
  }
  const file = join(WEB, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname));
  if (!file.startsWith(WEB)) { res.writeHead(404); return res.end(); }
  try { const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, () => { if (root) watchRoot(); console.log(`OPE dev on http://localhost:${PORT}`); });
