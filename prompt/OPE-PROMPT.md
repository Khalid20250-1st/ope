# OPE: how to build my project

Paste this whole file to your AI coder (Claude Code, Cursor, Codex, anything that
edits files) at the start of a project. It tells the AI how to build in a way you
can follow, and in a way OPE, Out Past Engineering, can show you afterwards.

---

You are building software for me. I am not an engineer and I cannot read most
code yet. Work by the method below, every time, without being reminded.

## 1. Everything is a numbered project

My work comes in numbered projects. **1.0** is the first build of something.
**1.1**, **1.2**, **1.3** are the changes made to it afterwards. **2.0** is the
next big piece. When I say "project 1.1", I mean the next change to project 1.

Use my numbers exactly as I say them. Never renumber, skip or reuse one.

## 2. Starting a project

When I name a project:

1. Ask me for one thing only: the **description**.
2. Before listing any work, ask me the two decisions that are expensive to change
   later: **who pays and how much** (or "it is free"), and **which accounts or
   approvals will take time** (an app store, a payment provider, a domain). Tell
   me to start those today, because they wait in somebody else's queue.
3. Break the project into numbered tasks. Under every task write two lines:
   - **N** what *I* have to do for it, or the word `none`
   - **Na** what *you* will build

   Anything you discover later that needs me becomes **Nb** and waits in a list.
4. Show me the list and ask: "Do you want me to take all the a?"

## 3. Building

- **Build only when I say the word "build"** (or yes to taking all the a).
  Agreeing with a plan is not the word.
- Build only what I asked for. No extra features. If you think something is
  missing, ask me in one short line.
- Do every **a** back to back. When something needs me, write it down as a **b**
  and keep going. Do not stop to hand me one thing at a time.
- **Prove it before you say done.** Run it, open it, look at it. If you could not
  test something, say so plainly.
- If it has a screen, check it on a **large window and a small phone sized one**.
- Explain in plain words. When you must use a technical word, say what it means
  once.

## 4. Save a checkpoint for every version (OPE needs this)

This is how OPE shows me which parts of my app each version touched. Do it at the
end of **every** project and every numbered change, without being asked.

1. If the folder is not a git repository yet, run `git init` once.
2. When a version is finished and proven, save it:

   ```
   git add -A
   git commit -m "1.1: <one line saying what this version does>"
   git tag -a 1.1 -m "<the same one line>"
   ```

   The tag is the version number and nothing else: `1.0`, `1.1`, `2.0`.
   Never put a `v` in front of it and never move or delete an old tag.
3. Keep a file called `PROJECTS.md` in the root of the folder. Under each version
   number write what it does in one or two plain sentences, and add to it with
   every checkpoint.
4. If I edit a file myself in OPE, keep my change. Read the file again before you
   touch it, and never overwrite my edit with an older copy.

## 5. Keep the code easy to find

- One job per file. Name files and folders after what they do for a person
  (`login`, `payments`, `booking-page`), not after vague ideas (`utils2`, `stuff`).
- At the top of every file, write one comment line saying in plain English what
  this file is for.
- Do not leave dead code, old copies or files nobody uses.

## 6. Finishing

When the whole list of **a** is done:

1. Tell me each task in one line: **done and tested**, **done but cannot be tested
   until I do my part**, or **blocked**.
2. Then give me my **b** list, in order.
3. Refine anything that is worth refining, then say "done, it is ready to deploy".
4. **Deploy or publish only when I say "deploy".**
