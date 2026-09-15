// Before and after the method, from real work. Reads the chats Claude Code keeps
// on this Mac and the git history of the projects. Calls no AI and sends nothing
// anywhere. Prints JSON.
//   node bench/history.mjs 2026-08-30 <repo> <repo> ...
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const [cut, ...repos] = process.argv.slice(2);
const ROOT = join(homedir(), '.claude', 'projects');
const files = [];
(function walk(d){ for (const f of readdirSync(d)) {
  const p = join(d, f);
  if (/ope-bench/.test(p)) continue;
  statSync(p).isDirectory() ? walk(p) : f.endsWith('.jsonl') && files.push(p);
} })(ROOT);

const usage = new Map();      // one entry per API message id, because a message is written several times as it streams
const humans = new Map();     // one entry per message uuid, because a forked chat copies its history
const replies = new Map();
const text = c => typeof c === 'string' ? c : Array.isArray(c) ? c.filter(b => b && b.type === 'text').map(b => b.text).join('\n') : '';
const isTool = c => Array.isArray(c) && c.some(b => b && b.type === 'tool_result');

for (const f of files) {
  const rl = createInterface({ input: createReadStream(f), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.includes('"timestamp"')) continue;
    let d; try { d = JSON.parse(line); } catch { continue; }
    const day = String(d.timestamp || '').slice(0, 10);
    if (!day) continue;
    if (d.type === 'assistant' && d.message) {
      const u = d.message.usage || {};
      const it = Array.isArray(u.iterations) && u.iterations.length ? u.iterations : [u];
      const sum = k => it.reduce((s, x) => s + (x[k] || 0), 0);
      const rec = { day, input: sum('input_tokens'), write: sum('cache_creation_input_tokens'), read: sum('cache_read_input_tokens'), output: sum('output_tokens') };
      const id = d.message.id || d.uuid;
      const prev = usage.get(id);
      if (!prev || rec.output + rec.read >= prev.output + prev.read) usage.set(id, rec);
      const t = text(d.message.content);
      if (t && !d.isSidechain) replies.set(d.uuid, { day, t });
    } else if (d.type === 'user' && d.message && !d.isSidechain && !isTool(d.message.content)) {
      const t = text(d.message.content).trim();
      if (!t || /^(This session is being continued|<command-|<local-command|\[Request interrupted|<system-reminder>|Caveat:)/.test(t)) continue;
      humans.set(d.uuid, { day, t });
    }
  }
}

const commits = [];
for (const r of repos) {
  try { execFileSync('git', ['-C', r, 'log', '--all', '--format=%cs'], { encoding: 'utf8' }).split('\n').filter(Boolean).forEach(day => commits.push(day)); } catch {}
}

const HANDOFF = /\b(run (this|these|it|the (following|sql|query|migration|command))|paste (this|it|the)|in the sql editor|copy (this|the) (sql|command)|you('ll| will)? need to run|open terminal and)\b/i;
const CORRECT = /^(no\b|nope|not what|that'?s (not|wrong)|wrong|still (not|broken|doesn|didn|the same)|it (still|doesn'?t|didn'?t)|doesn'?t work|didn'?t work|you (forgot|broke|missed|didn'?t)|why (did|is|does) (you|it)|undo|revert|again)/i;

function side(pick){
  const u = [...usage.values()].filter(x => pick(x.day));
  const h = [...humans.values()].filter(x => pick(x.day));
  const r = [...replies.values()].filter(x => pick(x.day));
  const c = commits.filter(pick);
  const days = new Set([...u.map(x => x.day), ...h.map(x => x.day)]).size;
  const tokens = u.reduce((s, x) => s + x.input + x.write + x.read + x.output, 0);
  const fresh = u.reduce((s, x) => s + x.input + x.write + x.output, 0);
  const output = u.reduce((s, x) => s + x.output, 0);
  const corrections = h.filter(x => CORRECT.test(x.t)).length;
  const handoffs = r.filter(x => HANDOFF.test(x.t)).length;
  return { days, apiMessages: u.length, humanMessages: h.length, commits: c.length, tokens, fresh, output,
    tokensPerCommit: c.length ? Math.round(tokens / c.length) : null,
    freshPerCommit: c.length ? Math.round(fresh / c.length) : null,
    humanMessagesPerCommit: c.length ? +(h.length / c.length).toFixed(2) : null,
    correctionsPer100HumanMessages: h.length ? +(corrections / h.length * 100).toFixed(1) : null,
    handoffsPer100Replies: r.length ? +(handoffs / r.length * 100).toFixed(1) : null,
    corrections, handoffs, replies: r.length };
}
const before = side(d => d < cut), after = side(d => d >= cut);
console.log(JSON.stringify({ cut, files: files.length, repos, before, after }, null, 2));
