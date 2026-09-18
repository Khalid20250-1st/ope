// Proves the practice bank: every milestone has a task, every door exists, and
// every checked task FAILS on its starter files and PASSES once "just do it for
// me" has written its answer. Runs each task in a throwaway git folder.
//   node scripts/check-bank.cjs            the whole bank
//   node scripts/check-bank.cjs some-id    only tasks whose id contains that
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const web = path.join(__dirname, '..', 'web', 'learn');
global.window = {};
eval(fs.readFileSync(path.join(web, 'skills.js'), 'utf8'));
eval(fs.readFileSync(path.join(web, 'bank.js'), 'utf8'));
for (const f of fs.readdirSync(web).filter(f => /^bank-.+\.js$/.test(f)).sort()) eval(fs.readFileSync(path.join(web, f), 'utf8'));
const B = window.OPEBank, all = window.OPESkills.all(), only = process.argv[2] || '';
let bad = 0;
const ids = new Set();
for (const t of B) { if (ids.has(t.id)) { console.log('DUPLICATE ID', t.id); bad++; } ids.add(t.id); }
for (const t of B) if (t.skill && !all.find(s => s.id === t.skill)) { console.log('TASK FOR A MILESTONE THAT IS NOT IN THE LIST', t.id, t.skill); bad++; }
if (!only) {
  for (const s of all) if (!B.find(t => t.skill === s.id)) { console.log('NO TASK FOR', s.id); bad++; }
  for (let d = 0; d < window.OPESkills.length; d++) if (!B.find(t => t.door === d)) { console.log('NO DOOR', d); bad++; }
}
for (const t of B) {
  if (!t.title || !t.ask || !t.kind) { console.log('MISSING title/ask/kind', t.id); bad++; }
  if (t.kind === 'explain' && !t.model) { console.log('EXPLAIN WITH NO MODEL ANSWER', t.id); bad++; }
  if (t.kind === 'check' && (!t.test || !t.solve)) { console.log('CHECK WITH NO test/solve', t.id); bad++; }
}
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ope-bank-'));
cp.execSync('git init -q && git -c user.name=t -c user.email=t@t commit -q --allow-empty -m "OPE Course: the start"', { cwd: root });
const git = a => cp.execSync('git -c user.name=t -c user.email=t@t ' + a, { cwd: root, encoding: 'utf8' });
(async () => {
  for (const t of B) {
    if (t.kind !== 'check' || (only && !t.id.includes(only))) continue;
    const dir = path.join(root, t.id); fs.mkdirSync(dir, { recursive: true });
    const write = files => { for (const [f, c] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), c); } };
    write(Object.assign({ 'task.md': t.ask }, t.files || {}));
    fs.writeFileSync(path.join(dir, 'test.cjs'), B.testFile(t.test));
    git('add -A'); git('commit -q -m "setup ' + t.id + '"');
    const run = () => cp.spawnSync(process.execPath, [path.join(dir, 'test.cjs')], { cwd: root, encoding: 'utf8', timeout: 30000 });
    const r1 = run();
    const sol = typeof t.solve === 'function'
      ? await t.solve({ here: dir, git: a => Promise.resolve({ out: git(a.map(x => JSON.stringify(x)).join(' ')) }) }) : t.solve;
    if (sol.files || sol.commit) { write(sol.files || {}); if (sol.commit) { git('add -A'); git('commit -q -m ' + JSON.stringify(sol.commit)); } } else write(sol);
    const r2 = run();
    const ok = r1.status !== 0 && r2.status === 0; if (!ok) bad++;
    console.log((ok ? 'ok  ' : 'BAD ') + t.id + '  starter=' + r1.status + ' solved=' + r2.status +
      (ok ? '' : '\n--- starter\n' + r1.stdout + r1.stderr + '--- solved\n' + r2.stdout + r2.stderr));
  }
  console.log(bad ? 'PROBLEMS ' + bad : 'BANK OK', B.length, 'tasks');
  process.exit(bad ? 1 : 0);
})();
