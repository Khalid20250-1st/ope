// One run of the job, with or without OPE.
//   node bench/run.mjs <ope|plain> <n> <workdir>
// Every message goes to Claude Code in print mode, resuming one session, so the
// token counts are the ones Claude Code itself reports.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STEPS, REPLIES } from './script.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const [mode, n, work] = process.argv.slice(2);
const MODEL = process.env.BENCH_MODEL || 'sonnet';
const dir = join(work, `${mode}-${n}`);
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
const PROMPT = readFileSync(join(HERE, '..', 'prompt', 'OPE-PROMPT.md'), 'utf8');
/* files mode: the project starts with what "Add OPE to this project" puts there,
   and nothing is pasted */
if (mode === 'files') {
  const SYS = join(HERE, '..', 'system');
  cpSync(join(SYS, 'AGENTS.md'), join(dir, 'AGENTS.md'));
  cpSync(join(SYS, 'CLAUDE.md'), join(dir, 'CLAUDE.md'));
  cpSync(join(SYS, 'method'), join(dir, 'ope-system', 'method'), { recursive: true });
  cpSync(join(SYS, 'maps'), join(dir, 'ope-system', 'maps'), { recursive: true });
  cpSync(join(SYS, 'README.md'), join(dir, 'ope-system', 'README.md'));
}
const log = { mode, n: +n, model: MODEL, started: new Date().toISOString(), turns: [], replies: { plan: 0, handoff: 0, question: 0 }, seeded: false };
const save = () => writeFileSync(join(work, `${mode}-${n}.json`), JSON.stringify(log, null, 2));

function claude(args, cwd, timeoutMs = 40 * 60 * 1000){
  return new Promise(done => {
    const p = spawn('claude', args, { cwd, env: process.env });
    let out = '', err = '';
    p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
    const t = setTimeout(() => p.kill('SIGTERM'), timeoutMs);
    p.on('close', code => { clearTimeout(t); let j = null; try { j = JSON.parse(out); } catch {} done({ code, json: j, err: err.slice(-2000), raw: out.slice(-2000) }); });
  });
}
const base = ['--output-format', 'json', '--model', MODEL, '--setting-sources', 'project', '--permission-mode', 'bypassPermissions'];
let session = null;
async function send(text, label){
  const args = ['-p', text, ...base, ...(session ? ['--resume', session] : [])];
  const r = await claude(args, dir);
  const u = (r.json && r.json.usage) || {};
  const turn = { label, ok: !!(r.json && !r.json.is_error), apiTurns: r.json ? r.json.num_turns : 0,
    input: u.input_tokens || 0, cacheWrite: u.cache_creation_input_tokens || 0, cacheRead: u.cache_read_input_tokens || 0,
    output: u.output_tokens || 0, cost: r.json ? r.json.total_cost_usd || 0 : 0, ms: r.json ? r.json.duration_ms : 0,
    result: r.json ? String(r.json.result || '').slice(0, 1500) : ('ERROR ' + r.err) };
  if (r.json && r.json.session_id) session = r.json.session_id;
  log.turns.push(turn); save();
  return turn;
}

/* is the AI waiting on the person, and for what. Asked of a small model, whose
   tokens are not counted: this stands in for the person reading the reply. */
async function classify(reply){
  const q = `You read the last message an AI coding assistant sent to its user. Answer with JSON only, no prose: {"waiting": true|false, "kind": "plan"|"handoff"|"question"|"none"}.
waiting = the assistant stopped and needs the user to answer or act before it continues the requested work.
kind "plan" = it is asking for approval to start or continue (a plan, a task list, "shall I build", "take all the a", asking for a description, pricing or accounts).
kind "handoff" = it asks the user to do something itself could do: run a command, SQL, a migration, a test, install something, restart a server.
kind "question" = any other question it needs answered.
If the work is simply reported as done, waiting is false and kind is "none".

MESSAGE:
${reply.slice(0, 6000)}`;
  const r = await claude(['-p', q, '--output-format', 'json', '--model', 'haiku', '--setting-sources', 'project', '--no-session-persistence', '--tools', ''], work, 5 * 60 * 1000);
  try { const m = String(r.json.result).match(/\{[\s\S]*\}/); return JSON.parse(m[0]); } catch { return { waiting: false, kind: 'none' }; }
}

async function seed(){
  if (!existsSync(join(dir, 'server.js'))) return false;
  const port = 4900 + (+n) * 10 + (mode === 'ope' ? 1 : 2);
  const p = spawn(process.execPath, ['server.js'], { cwd: dir, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  let ok = false;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/tasks`);
      if (r.status) {
        const a = await fetch(`http://127.0.0.1:${port}/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'LEGACY-A' }) });
        const b = await fetch(`http://127.0.0.1:${port}/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'LEGACY-B' }) });
        ok = a.status < 300 && b.status < 300; break;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  p.kill(); await new Promise(r => setTimeout(r, 500));
  return ok;
}

const t0 = Date.now();
for (const step of STEPS) {
  if (step.seedBefore) { log.seeded = await seed(); save(); }
  let text = step.text;
  if (mode === 'ope' || mode === 'files') {
    if (step.n === '1.0') text = (mode === 'ope' ? PROMPT + '\n\n---\n\n' : '') + 'Project 1.0. ' + step.text;
    else if (step.n !== 'end') text = `Project ${step.n}. ` + step.text;
  }
  let turn = await send(text, step.n);
  for (let i = 0; i < 3 && turn.ok; i++) {
    const c = await classify(turn.result);
    if (!c.waiting) break;
    const kind = REPLIES[c.kind] ? c.kind : 'question';
    log.replies[kind]++;
    turn = await send(REPLIES[kind], `${step.n} reply:${kind}`);
  }
}
log.minutes = Math.round((Date.now() - t0) / 60000);
log.check = JSON.parse(spawnSync(process.execPath, [join(HERE, 'check.mjs'), dir, log.seeded ? 'seeded' : ''], { encoding: 'utf8' }).stdout || '{}');
log.organize = JSON.parse(spawnSync(process.execPath, [join(HERE, 'organize.mjs'), dir], { encoding: 'utf8' }).stdout || '{}');
log.finished = new Date().toISOString();
save();
console.log(`${mode}-${n} done: checks ${log.check.passed}/${log.check.total}, organised ${log.organize.passed}/${log.organize.total}`);
