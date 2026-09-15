// The hidden checks. Run on a COPY of the finished project, so checking never
// changes what was built. Prints JSON: {passed, total, results:[{name, ok}]}.
import { cpSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const src = process.argv[2];
const seeded = process.argv[3] === 'seeded';
const dir = mkdtempSync(join(tmpdir(), 'ope-check-'));
cpSync(src, dir, { recursive: true, filter: p => !p.includes('/.git/') && !p.includes('/node_modules/') });
const port = 4100 + Math.floor(Math.random() * 800);
const base = `http://127.0.0.1:${port}`;
const results = [];
const check = (name, ok) => results.push({ name, ok: !!ok });

const server = existsSync(join(dir, 'server.js'))
  ? spawn(process.execPath, ['server.js'], { cwd: dir, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' })
  : null;
const wait = ms => new Promise(r => setTimeout(r, ms));
async function req(method, path, body){
  try {
    const r = await fetch(base + path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
    return { status: r.status, json, text, type: r.headers.get('content-type') || '' };
  } catch { return { status: 0, json: null, text: '', type: '' }; }
}
let up = false;
for (let i = 0; i < 40 && server; i++) { const r = await req('GET', '/tasks'); if (r.status) { up = true; break; } await wait(250); }
check('server starts with node server.js', up);

if (up) {
  const all = async () => (await req('GET', '/tasks')).json || [];
  if (seeded) {
    const list = await all();
    const legacy = list.filter(t => /^LEGACY-/.test(t.title));
    check('tasks made before the priority change survived', legacy.length === 2);
    check('those old tasks got priority 2', legacy.length === 2 && legacy.every(t => t.priority === 2));
  }
  const a = await req('POST', '/tasks', { title: 'Check A' });
  check('POST /tasks returns 201 with id, title, done false', a.status === 201 && a.json && a.json.id != null && a.json.title === 'Check A' && a.json.done === false);
  check('GET /tasks lists the new task', (await all()).some(t => t.title === 'Check A'));
  const id = a.json && a.json.id;
  const p = await req('PATCH', `/tasks/${id}`, { done: true });
  check('PATCH marks a task done', p.status === 200 && p.json && p.json.done === true);
  const home = await req('GET', '/');
  check('GET / serves a web page', home.status === 200 && /<html|<!doctype/i.test(home.text));

  const d = await req('POST', '/tasks', { title: 'Check due', due: '2030-01-02' });
  const nd = await req('POST', '/tasks', { title: 'Check no due' });
  check('due date is saved and returned', d.json && d.json.due === '2030-01-02' && nd.json && nd.json.due === null);
  const df = (await req('GET', '/tasks?due=2030-01-02')).json || [];
  check('GET /tasks?due= filters by day', df.length >= 1 && df.every(t => t.due === '2030-01-02'));

  const tg = await req('POST', '/tasks', { title: 'Check tags', tags: ['work', 'home'] });
  check('tags are saved, and empty when none', tg.json && Array.isArray(tg.json.tags) && tg.json.tags.includes('work') && nd.json && Array.isArray(nd.json.tags) && nd.json.tags.length === 0);
  const tf = (await req('GET', '/tasks?tag=work')).json || [];
  check('GET /tasks?tag= filters by tag', tf.length >= 1 && tf.every(t => (t.tags || []).includes('work')));

  check('new tasks default to priority 2', nd.json && nd.json.priority === 2);
  const p1 = await req('POST', '/tasks', { title: 'Check high', priority: 1 });
  check('priority 1 can be set', p1.json && p1.json.priority === 1);
  check('priority 5 is rejected with 400', (await req('POST', '/tasks', { title: 'Check bad', priority: 5 })).status === 400);

  const list = await all();
  const s = await req('GET', '/stats');
  check('GET /stats counts total and done', s.json && s.json.total === list.length && s.json.done === list.filter(t => t.done).length);

  const e1 = await req('POST', '/tasks', { title: '' });
  const e2 = await req('POST', '/tasks', { title: '   ' });
  check('an empty title is a 400 with an error', e1.status === 400 && e1.json && e1.json.error);
  check('a title of only spaces is a 400', e2.status === 400);
  check('PATCH on a missing id is a 404', (await req('PATCH', '/tasks/999999', { done: true })).status === 404);
  check('DELETE on a missing id is a 404', (await req('DELETE', '/tasks/999999')).status === 404);

  const o1 = await req('POST', '/tasks', { title: 'Order 1' });
  await req('POST', '/tasks', { title: 'Order 2' });
  await req('PATCH', `/tasks/${o1.json && o1.json.id}`, { done: true });
  const ord = (await all()).map(t => t.title).filter(t => /^Order /.test(t));
  const full = await all();
  const firstDone = full.findIndex(t => t.done);
  const doneLast = firstDone < 0 || full.slice(firstDone).every(t => t.done);
  check('GET /tasks lists open tasks first, then done', doneLast && ord.join(',') === 'Order 2,Order 1');

  const del = await req('DELETE', `/tasks/${id}`);
  check('DELETE returns 204 and the task is gone', del.status === 204 && !(await all()).some(t => t.id === id));
}
if (server) server.kill();
rmSync(dir, { recursive: true, force: true });
console.log(JSON.stringify({ passed: results.filter(r => r.ok).length, total: results.length, results }));
