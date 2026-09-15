// Runs the OPE interface in a normal browser, for building and testing it.
//
//   npm run dev            then open http://localhost:8790
//
// The Mac app answers the same bridge commands in Swift (mac/main.swift). Both
// sides must stay identical: every command here exists there, with the same
// arguments and the same answer.
import http from 'node:http';
import { readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, watch, existsSync, statSync } from 'node:fs';
import { join, resolve, relative, extname, dirname, basename, sep } from 'node:path';
import { homedir, platform } from 'node:os';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, '..', 'web');
const PROMPT = join(HERE, '..', 'prompt', 'OPE-PROMPT.md');
const PORT = Number(process.env.PORT || 8790);
/* the Windows app runs this same file inside Electron. It sets OPE_TOKEN, and then
   every bridge call must carry it, so no web page open in a browser can reach the
   bridge on 127.0.0.1 */
const TOKEN = process.env.OPE_TOKEN || '';
const HOME = homedir();
const COMPUTER = platform() === 'darwin' ? 'Mac' : 'computer';

let root = process.env.OPE_ROOT || '';
/* the library of project folders, kept on this machine only */
const LIB = join(HOME, '.config', 'ope', 'library.json');
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
    else if (it.isFile()) out.push(relative(root, full).split(sep).join('/'));
  }
}

function watchRoot(){
  if (watcher) { watcher.close(); watcher = null; }
  if (!root) return;
  let timer = null, seen = new Set();
  watcher = watch(root, { recursive: true }, (_e, name) => {
    if (!name) return;
    const n = String(name);
    const n2 = n.replace(/\\/g, '/');
    if (/(^|\/)(node_modules|\.next|dist|build)(\/|$)/.test(n2)) return;
    if (/^\.git\//.test(n2) && !/^\.git\/(refs|HEAD|index|packed-refs)/.test(n2)) return;
    seen.add(n);
    clearTimeout(timer);
    timer = setTimeout(() => {
      const paths = [...seen]; seen = new Set();
      for (const res of listeners) res.write(`data: ${JSON.stringify({ paths })}\n\n`);
    }, 250);
  });
}

/* OPE Chat, the twin of the Chat enum in main.swift. A browser has no Apple
   model, so here it is always Ollama or nothing. */
const CHAT_MODEL = 'qwen2.5-coder:3b';
const OLLAMA = 'http://127.0.0.1:11434';
let pulling = null;
const CHAT_RULES = [
  'You are OPE Chat, a friendly assistant inside OPE, an app for people who build software by talking to an AI coder and cannot read code themselves.',
  'Talk like a normal, helpful AI. Answer greetings, small talk, maths and general questions directly and briefly, the way any assistant would. Do not mention the code unless the person asks about it.',
  'When they ask about the code, explain what a file, a function or a line does, why it is there and how it connects to the rest, in plain words a non programmer understands, and explain any technical word the first time you use it. Use only the code you are shown.',
  'One limit: you never write code, rewrite it, suggest a fix or debug. If they ask for that, say in one sentence that their AI coder can make the change.',
  'Only greet them if they greeted you. Keep answers short.'
].join('\n');
async function ollamaHasModel(){
  try {
    const r = await fetch(OLLAMA + '/api/tags', { signal: AbortSignal.timeout(2000) });
    const j = await r.json();
    return (j.models || []).some(m => m.name === CHAT_MODEL || m.name.startsWith(CHAT_MODEL));
  } catch { return null; }
}
function chatPrompt(b, budget){
  const head = [];
  if (b.project) head.push('Project: ' + b.project);
  if (b.version) head.push('Version picked: ' + b.version);
  if (b.file) head.push('File open: ' + b.file);
  if (b.lines) head.push('Lines selected: ' + b.lines);
  let code = String(b.code || '');
  if (code.length > budget) code = code.slice(0, budget) + '\n[the rest of the file was cut to fit]';
  return head.join('\n') + (code ? '\n\nThe code they have open, for if they ask about it:\n```\n' + code + '\n```' : '') + '\n\nThe person says: ' + String(b.question || '');
}
async function chatEngine(){
  const has = await ollamaHasModel();
  if (has === true) return { engine: 'ollama', label: 'Qwen2.5 Coder 3B, on this ' + COMPUTER };
  if (has === false) return Object.assign({ engine: 'need-model', label: 'Needs a 1.9 GB download' }, pulling ? { pulling } : {});
  const installed = ['/usr/local/bin/ollama', '/opt/homebrew/bin/ollama', '/Applications/Ollama.app',
    join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama.exe')].some(existsSync);
  return installed ? { engine: 'start-ollama', label: 'Open Ollama to use OPE Chat' }
                   : { engine: 'none', label: 'Needs Ollama, free, from ollama.com' };
}
async function chatAsk(b){
  if (await ollamaHasModel() !== true) throw new Error('OPE Chat has no model on this ' + COMPUTER + ' yet.');
  const r = await fetch(OLLAMA + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: CHAT_MODEL, stream: false, options: { num_ctx: 8192, temperature: 0.2 },
      messages: [{ role: 'system', content: CHAT_RULES }, { role: 'user', content: chatPrompt(b, 18000) }] }) });
  const j = await r.json();
  if (j.error) throw new Error('Ollama could not answer: ' + j.error);
  return { answer: (j.message && j.message.content) || '', engine: 'ollama' };
}
function chatPull(){
  if (pulling) return;
  pulling = { status: 'starting', completed: 0, total: 0 };
  (async () => {
    try {
      const r = await fetch(OLLAMA + '/api/pull', { method: 'POST', body: JSON.stringify({ model: CHAT_MODEL, stream: true }) });
      const dec = new TextDecoder(); let buf = '';
      for await (const chunk of r.body) {
        buf += dec.decode(chunk, { stream: true });
        let i; while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i); buf = buf.slice(i + 1);
          try { const j = JSON.parse(line);
            if (j.error) { pulling = { status: 'error', error: j.error }; return; }
            pulling = { status: j.status || '', total: j.total, completed: j.completed }; } catch {}
        }
      }
      pulling = null;
    } catch { pulling = { status: 'error', error: 'The download stopped. Check Ollama is open and try again.' }; }
  })();
}

async function command(b){
  switch (b.cmd) {
    case 'hello': return { kind: TOKEN ? 'desktop' : 'dev', root, recent, library: library() };
    case 'open': {
      const p = resolve(String(b.path || '').replace(/^~(?=$|[\/\\])/, HOME));
      if (!existsSync(p) || !statSync(p).isDirectory()) throw new Error('That folder does not exist.');
      root = p;
      const i = recent.indexOf(p); if (i >= 0) recent.splice(i, 1); recent.unshift(p); recent.length = Math.min(recent.length, 8);
      watchRoot();
      const lib = library();
      if (!lib.some(x => x.path === p)) { lib.push({ path: p, name: basename(p) }); saveLibrary(lib); }
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
    case 'chatEngine': return chatEngine();
    case 'chat': return chatAsk(b);
    case 'chatPull': chatPull(); return { ok: true };
    /* reading a picture uses Apple's Vision, which only the Mac app can reach */
    case 'readImage': throw new Error('Reading pictures works in the Mac app, not in the browser.');
    case 'chatOpen': return { ok: false };
    case 'copy': return { ok: false };
    case 'install': {
      if (!root) throw new Error('Open a project first.');
      const SYS = join(HERE, '..', 'system'), added = [], kept = [];
      const agentsSrc = readFileSync(join(SYS, 'AGENTS.md'), 'utf8');
      const agents = join(root, 'AGENTS.md');
      if (existsSync(agents)) { const have = readFileSync(agents, 'utf8');
        if (have.includes('(OPE)')) kept.push('AGENTS.md'); else { writeFileSync(agents, have + '\n\n' + agentsSrc); added.push('AGENTS.md (added to yours)'); } }
      else { writeFileSync(agents, agentsSrc); added.push('AGENTS.md'); }
      const claude = join(root, 'CLAUDE.md');
      if (existsSync(claude)) { const have = readFileSync(claude, 'utf8');
        if (have.includes('@AGENTS.md')) kept.push('CLAUDE.md'); else { writeFileSync(claude, have + '\n\n@AGENTS.md\n'); added.push('CLAUDE.md (added to yours)'); } }
      else { writeFileSync(claude, '@AGENTS.md\n'); added.push('CLAUDE.md'); }
      const walkSys = d => { for (const it of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, it.name), rel = relative(SYS, p);
        if (it.isDirectory()) { walkSys(p); continue; }
        if (rel === 'AGENTS.md' || rel === 'CLAUDE.md') continue;
        const to = join(root, 'ope-system', rel);
        if (existsSync(to)) { kept.push('ope-system/' + rel); continue; }
        mkdirSync(dirname(to), { recursive: true }); writeFileSync(to, readFileSync(p)); added.push('ope-system/' + rel);
      } };
      walkSys(SYS);
      return { added, kept };
    }
    case 'log': console.error('OPE: ' + b.text); return { ok: true };
    case 'libraryRemove': return { items: saveLibrary(library().filter(x => x.path !== String(b.path))) };
    default: throw new Error('Unknown command ' + b.cmd);
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (TOKEN && (url.pathname === '/events' || url.pathname === '/bridge')
      && req.headers['x-ope-token'] !== TOKEN && url.searchParams.get('t') !== TOKEN) {
    res.writeHead(403); return res.end();
  }
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
}).listen(PORT, '127.0.0.1', () => { if (root) watchRoot(); console.log(`OPE dev on http://localhost:${PORT}`); });
