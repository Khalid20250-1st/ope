# How OPE's numbers were measured

## Up to 47%: real use, before and after

`history.mjs` reads the chats Claude Code keeps on the Mac it runs on, and the git
history of the projects built in them. It calls no AI and sends nothing anywhere.

The method was adopted on 30 August 2026. The comparison is 46 days of work before
it against 17 days after, across 372 saved chats, 704 commits and 7 projects, with
one commit as the unit of work:

| Per commit | Before | After | Change |
|---|---|---|---|
| **Full price tokens** (new input, cache writes, output) | 864,000 | 458,000 | **47% fewer** |
| AI output | 53,200 | 38,600 | 27% fewer |
| Messages the person had to send | 8.0 | 6.3 | 21% fewer |
| AI handing work back, like SQL to run (per 100 replies) | 3.6 | 3.0 | 17% fewer |
| The person correcting the AI (per 100 messages) | 1.0 | 0.6 | 40% fewer |
| All tokens, including cheap cache reads | 23.7M | 27.6M | 17% more |

**Read it carefully:**

- The saving is in the **expensive** tokens. Total tokens went up, because chats
  grew longer and the AI rereads more cached history, which is billed at about a
  tenth of the price. Weighted by price, the cost per commit fell by roughly 4 to 10%.
- These are one person's projects, and the projects before and after are different
  ones. It is real use, not a controlled experiment.
- A commit is not an exact measure of work. Corrections and handoffs are counted by
  matching words, so they are approximate.
- This measured the method in use, with an experienced user enforcing it. A new
  user with only `AGENTS.md` may see less.

```
node bench/history.mjs 2026-08-30 /path/to/repo /path/to/another/repo
```

## Scripted runs

`run.mjs`, `files.sh` and `messy.mjs` give the same job to Claude Code with and
without OPE and score the result: tokens as Claude Code reports them, hidden checks
on the finished app (`check.mjs`) and an organisation checklist (`organize.mjs`).

What they showed so far, and why they are not the headline:

- **Organisation:** projects built with OPE scored 100% on the checklist against
  29% without, with the same number of hidden checks passing (90%).
- **Tokens:** an early version of the prompt, which stopped for approval before
  every small change, used about twice the tokens. That rule was the problem and is
  gone: changes are now built straight away. The current version has not been fully
  run, because a scripted person sends perfect, complete messages and never needs
  anything redone, which leaves out the back and forth where real tokens go.
