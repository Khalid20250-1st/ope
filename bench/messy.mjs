// The fair test: a realistic, messy person, the same for both sides.
//   node bench/messy.mjs <plain|files> <workdir>
// A vague first request, the real details only after, an idea tacked on, a
// correction, then a NEW chat for the next round of changes. One run each side,
// on the cheap model. Tokens are what Claude Code reports.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPLIES } from './script.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const [mode, work] = process.argv.slice(2);
const MODEL = process.env.BENCH_MODEL || 'haiku';
const dir = join(work, `messy-${mode}`);
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
if (mode === 'files') {
  const SYS = join(HERE, '..', 'system');
  for (const f of ['AGENTS.md', 'CLAUDE.md']) cpSync(join(SYS, f), join(dir, f));
  for (const f of ['method', 'maps', 'README.md']) cpSync(join(SYS, f), join(dir, 'ope-system', f), { recursive: true });
}

const SCRIPT = [
  { chat: 1, text: 'make me a task app' },
  { chat: 1, text: 'i want it as a website. node server.js, port from the PORT env (default 3000), tasks saved in data.db using the built in node:sqlite, no npm packages. api: POST /tasks {"title"} returns 201 {"id","title","done":false}, GET /tasks lists them, PATCH /tasks/:id {"done"} updates and returns it, DELETE /tasks/:id returns 204. and a page at / to add, tick and delete tasks' },
  { chat: 1, text: 'yes go ahead and build all of it. oh and tasks need a due date too: "due" as YYYY-MM-DD, null when not set, and GET /tasks?due=YYYY-MM-DD only returns tasks due that day' },
  { chat: 1, text: 'wait the done tasks are mixed in with the rest. open tasks should come first then done ones, each group oldest first. also empty titles or only spaces are getting saved, that should be a 400 with {"error"}' },
  { chat: 2, text: 'the task app in this folder: add tags. POST accepts "tags" as an array of strings, tasks return "tags" ([] when none), GET /tasks?tag=x filters by tag. also GET /stats returning {"total","done"}' },
  { chat: 2, text: 'PATCH or DELETE on an id that does not exist should be 404. make sure everything works then finish' },
];

const log = { mode, model: MODEL, started: new Date().toISOString(), turns: [], replies: { plan: 0, handoff: 0, question: 0 } };
const save = () => writeFileSync(join(work, `messy-${mode}.json`), JSON.stringify(log, null, 2));
function claude(args, cwd){
  return new Promise(done => {
    const p = spawn('claude', args, { cwd, env: process.env }); let out = '';
    p.stdout.on('data', d => out += d);
    const t = setTimeout(() => p.kill('SIGTERM'), 30 * 60 * 1000);
    p.on('close', () => { clearTimeout(t); let j = null; try { j = JSON.parse(out); } catch {} done(j); });
  });
}
const base = ['--output-format', 'json', '--model', MODEL, '--setting-sources', 'project', '--permission-mode', 'bypassPermissions'];
let session = null, chat = 0;
async function send(text, label){
  const j = await claude(['-p', text, ...base, ...(session ? ['--resume', session] : [])], dir);
  const u = (j && j.usage) || {};
  const turn = { label, ok: !!(j && !j.is_error), apiTurns: j ? j.num_turns : 0, input: u.input_tokens || 0,
    cacheWrite: u.cache_creation_input_tokens || 0, cacheRead: u.cache_read_input_tokens || 0, output: u.output_tokens || 0,
    cost: j ? j.total_cost_usd || 0 : 0, result: j ? String(j.result || '').slice(0, 1200) : 'ERROR' };
  if (j && j.session_id) session = j.session_id;
  log.turns.push(turn); save(); return turn;
}
async function waiting(reply){
  const q = `Last message from an AI coding assistant to its user. JSON only: {"waiting": true|false, "kind": "plan"|"handoff"|"question"|"none"}. waiting = it stopped and needs the user before continuing the work. plan = asking approval to start or continue. handoff = asking the user to do something it could do itself. question = any other question. Work reported as done = {"waiting": false, "kind": "none"}.\n\nMESSAGE:\n${reply.slice(0, 5000)}`;
  const j = await claude(['-p', q, '--output-format', 'json', '--model', 'haiku', '--setting-sources', 'project', '--no-session-persistence', '--tools', ''], work);
  try { return JSON.parse(String(j.result).match(/\{[\s\S]*\}/)[0]); } catch { return { waiting: false }; }
}

for (const [i, m] of SCRIPT.entries()) {
  if (m.chat !== chat) { chat = m.chat; session = null; }   // a new chat knows nothing
  let turn = await send(m.text, `chat${m.chat} msg${i + 1}`);
  /* a person answers a waiting AI before moving on: the next message already
     does that, except after the last message in a chat */
  const lastInChat = !SCRIPT[i + 1] || SCRIPT[i + 1].chat !== m.chat;
  for (let k = 0; lastInChat && k < 3 && turn.ok; k++) {
    const c = await waiting(turn.result);
    if (!c.waiting) break;
    const kind = REPLIES[c.kind] ? c.kind : 'question';
    log.replies[kind]++;
    turn = await send(REPLIES[kind], `chat${m.chat} reply:${kind}`);
  }
}
log.check = JSON.parse(spawnSync(process.execPath, [join(HERE, 'check.mjs'), dir, '', 'messy'], { encoding: 'utf8' }).stdout || '{}');
log.organize = JSON.parse(spawnSync(process.execPath, [join(HERE, 'organize.mjs'), dir, 'messy'], { encoding: 'utf8' }).stdout || '{}');
log.finished = new Date().toISOString(); save();
const tok = log.turns.reduce((s, t) => s + t.input + t.cacheWrite + t.cacheRead + t.output, 0);
console.log(`messy-${mode}: tokens ${tok}, cost $${log.turns.reduce((s, t) => s + t.cost, 0).toFixed(2)}, checks ${log.check.passed}/${log.check.total}, organised ${log.organize.passed}/${log.organize.total}`);
