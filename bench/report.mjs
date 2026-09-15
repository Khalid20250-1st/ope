// Turns the run logs into BENCHMARK.md.
//   node bench/report.mjs /private/tmp/ope-bench/runs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const work = process.argv[2];
const runs = readdirSync(work).filter(f => /^(ope|plain)-\d+\.json$/.test(f)).map(f => JSON.parse(readFileSync(join(work, f), 'utf8'))).filter(r => r.check && r.organize);
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
function stats(mode){
  const rs = runs.filter(r => r.mode === mode).sort((a, b) => a.n - b.n);
  const per = rs.map(r => ({
    n: r.n,
    tokens: sum(r.turns, t => t.input + t.cacheWrite + t.cacheRead + t.output),
    fresh: sum(r.turns, t => t.input + t.cacheWrite + t.output),
    output: sum(r.turns, t => t.output),
    cost: sum(r.turns, t => t.cost),
    messages: r.turns.length,
    apiTurns: sum(r.turns, t => t.apiTurns || 0),
    stops: r.replies.handoff + r.replies.question,
    handoffs: r.replies.handoff, plans: r.replies.plan,
    checks: r.check.passed, checksTotal: r.check.total,
    org: r.organize.passed, orgTotal: r.organize.total,
    minutes: r.minutes,
  }));
  const avg = k => per.length ? sum(per, p => p[k]) / per.length : 0;
  return { mode, per, avg: Object.fromEntries(Object.keys(per[0] || {}).map(k => [k, avg(k)])) };
}
const P = stats('plain'), O = stats('ope'), F = stats('files');
const cols = [['Without OPE', P], ['OPE prompt, pasted', O], ['OPE files (Add OPE to this project)', F]].filter(c => c[1].per.length);
const fmt = x => Math.round(x).toLocaleString('en-US');
const money = x => '$' + x.toFixed(2);
const rate = (s, k, t) => { const tot = sum(s.per, p => p[t]); return tot ? Math.round(sum(s.per, p => p[k]) / tot * 100) + '%' : 'n/a'; };
const vs = (x, key) => { if (x === P || !P.per.length) return ''; const d = Math.round((x.avg[key] - P.avg[key]) / P.avg[key] * 100); return ` (${d > 0 ? '+' : ''}${d}%)`; };
const row = (label, f) => `| ${label} | ${cols.map(c => f(c[1])).join(' | ')} |`;

const md = `# OPE benchmark

The same job, given to Claude Code three ways: with no method, with the OPE prompt
pasted in, and with OPE added to the project as files. Every number here is
measured by the scripts in this folder. Nothing is estimated.

Model \`${runs[0] ? runs[0].model : ''}\`, runs from ${runs.map(r => r.started.slice(0, 10)).sort()[0] || ''}.
${cols.map(c => `${c[0]}: ${c[1].per.length} runs`).join('. ')}.

## The job

A small task tracker (Node.js, SQLite, a JSON API and a web page), then the way a
real build goes: three new ideas arriving in the middle, one database change that
has to keep existing data, and three bug reports. The messages are word for word
the same in every run (\`script.mjs\`). The OPE runs name each change by its number.

When the AI stopped and waited, a stand in for the person answered with a fixed
reply (\`REPLIES\` in \`script.mjs\`). Those extra messages and their tokens are
counted.

## Results, averaged per run

The percentage in brackets is against the run with no method.

${'| | ' + cols.map(c => c[0]).join(' | ') + ' |'}
${'|---|' + cols.map(() => '---').join('|') + '|'}
${row('**Total tokens**', x => '**' + fmt(x.avg.tokens) + vs(x, 'tokens') + '**')}
${row('Tokens not served from cache', x => fmt(x.avg.fresh) + vs(x, 'fresh'))}
${row('**Cost**', x => '**' + money(x.avg.cost) + vs(x, 'cost') + '**')}
${row('**Organisation checklist**', x => '**' + rate(x, 'org', 'orgTotal') + '**')}
${row('Hidden checks passed', x => rate(x, 'checks', 'checksTotal'))}
${row('Times it handed work back', x => x.avg.handoffs.toFixed(1))}
${row('Approvals it stopped to ask for', x => x.avg.plans.toFixed(1))}
${row('Other questions it stopped for', x => (x.avg.stops - x.avg.handoffs).toFixed(1))}
${row('Minutes', x => Math.round(x.avg.minutes))}

## Every run

| Run | Tokens | Cost | Stops (approvals) | Checks | Organised | Minutes |
|---|---|---|---|---|---|---|
${cols.flatMap(c => c[1].per.map(p => `| ${c[0]} ${p.n} | ${fmt(p.tokens)} | ${money(p.cost)} | ${p.stops} (${p.plans}) | ${p.checks}/${p.checksTotal} | ${p.org}/${p.orgTotal} | ${p.minutes} |`)).join('\n')}

## What is measured

* **Tokens** are the usage Claude Code reports for every message, summed: input, cache writes, cache reads and output. **Cost** is Claude Code's own figure.
* **Hidden checks** (\`check.mjs\`) start the finished app on a copy and test every requirement: the API, due dates, tags, priority with the old data kept, stats, and the three bugs.
* **Organisation** (\`organize.mjs\`) scores seven things the same way for every run: saved with git, a checkpoint per change, numbered versions, a written list of versions, every source file saying what it is for, no file over 400 lines, no leftover backup files. The \`ope-system\` folder itself is not scored.

## Limits

* A script is not a person. Real people change their minds in less tidy ways, so read these as a fair comparison of methods, not a promise.
* A handful of runs per method is a small sample, and AI runs vary. The table of every run shows by how much.
* The organisation checklist rewards the habits OPE asks for, so part of that gap is by design: it measures whether the habits actually happened.

## Run it yourself

\`\`\`
zsh bench/all.sh /tmp/ope-bench     # no method and the pasted prompt, three rounds
zsh bench/files.sh /tmp/ope-bench   # OPE as files, three runs
node bench/report.mjs /tmp/ope-bench
\`\`\`
`;
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'BENCHMARK.md'), md);
console.log(md.split('## Every run')[0].split('## Results')[1]);
