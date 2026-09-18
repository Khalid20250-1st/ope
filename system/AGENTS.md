# How to build this project (OPE)

This project is built with OPE, Out Past Engineering. Follow this method every
time, without being reminded. The person you are working with may not read code,
so explain in plain words and say what a technical word means the first time.

The full system lives in `ope-system/`. **Do not read it all.** Open a file there
only when the work needs it (see the list at the end).

## 1. Numbered projects

Work comes in numbered projects. **1.0** is the first build of something, **2.0**
the next big piece. **1.1, 1.2, 1.3** are changes to project 1. Use the numbers
exactly as the person says them. Never renumber, skip or reuse one. Numbers have
two parts only.

**The moment a number is said, write it down, before anything else.** Add it to
`PROJECTS.md` in the root, exactly like this, and save the file:

```
## 1.13 Reviews
Building
```

The heading is the number and a short name. The line under it is one word:
`Planning` while you are still talking it through, `Building` while you work on
it, and `Done` when it is finished. Under that go
the tasks, one per line (`1 none`, `1a what you build`). OPE reads this file, so
the project and its tasks show up the second they are written, and everything
you write while it says `Building` shows under it. Never leave a finished one
on `Building`.

## 2. A whole number project (1.0, 2.0): description or planning

1. Ask one thing only: **"Description or planning?"**
2. **Description:** they write it. Go to step 5.
3. **Planning:** write the project into `PROJECTS.md` with `Planning` under the
   heading, then talk it through. They type the idea; you answer with **two or
   three sharp ideas or questions a turn**, not an essay, and say plainly where
   the idea is weak. Raise the two expensive decisions during the talk: **who
   pays and how much** (or "free"), and **which accounts or approvals wait in
   someone else's queue** (app store, payments, domain). Tell them to start
   those today. Keep going until they say **done**.
4. When they say done, ask: **"You write the description, or I write it from
   what we talked about?"** If you write it, show it once and let them correct
   it before anything else.
5. Ask: **"Do you have tasks or you want me to make one?"** Every task gets two
   lines:
   - **N** what the *person* must do (a password, a payment, a decision), or `none`
   - **Na** what *you* build
6. Write the description and the tasks under the heading, change `Planning` to
   `Building`, and ask once: "Do you want me to take all the a?" Then build.

## 3. A change (1.1, 1.2, a bug): list it, then build it

A numbered change or a bug report does **not** wait for a new approval, but it
**always gets its task list**. Write the tasks into `PROJECTS.md` under its
heading, in the same **N** / **Na** form, then build straight away without
asking: test it, save the checkpoint, and report it in one line. If the person
has already said "build", that is the approval; write the list and go. Never
skip the list because the change looks small. Only stop to ask when the change
genuinely cannot be done without the person.

## 4. While building

- **Do every a back to back.** When something truly needs the person, write it
  down as **Nb** and keep going. Never stop to hand them one thing at a time.
- **Do it yourself.** Run the SQL, the migration, the command, the test yourself.
  Only passwords, payments, identity and legal agreements belong to the person.
- **New ideas that arrive mid build** are added to the list and built in the same
  run, not treated as a new project.
- **Build only what was asked.** No extra features, no leftover code, no backup
  copies of files.
- **Prove it before saying done.** Run it and look. If something could not be
  tested, say so plainly.
- If it has a screen, check a large window and a phone sized one.

## 5. Keep it findable

- One job per file, named after what it does for a person (`login`, `payments`),
  never `utils2` or `stuff`. Keep files under about 400 lines.
- The first line of every file says in plain words what the file is for.
- Keep `PROJECTS.md` in the root. Under each `## number name` heading: the one
  word `Building` or `Done`, then one or two plain sentences on what it did.

## 6. A checkpoint for every version

At the end of every project and every numbered change:

```
git add -A
git commit -m "1.1: <one line saying what this version does>"
git tag -a 1.1 -m "<the same one line>"
```

The tag is the number and nothing else (`1.0`, `1.1`, never `v1.1`). Never move or
delete an old tag. Run `git init` once if the folder is not a repository. OPE reads
these tags to show which files and lines each version touched. If the person
edited a file themselves, keep their change.

**Start every save with the number**, as above. It is how the version gets its
name in OPE even in a folder with no tags, and it is how the person can tell two
chats apart when both are working in the same project. Save as you go, not only
at the end: each save is a step the person can look at while the work is running.

## 7. Finishing

1. Refine anything worth refining, and test again.
2. Report each task in one line: **done and tested**, **done but waiting on the
   person**, or **blocked**. Then the person's **b** list, in order.
3. **Deploy or publish only when the person says "deploy".**

## 8. Learning while building

If `ope-learn/LEARN.md` exists and says `Mode: Learning`, read it before any work
and follow it. The person has switched OPE to learning in this project. In short:
you still build the full, working code, then tag one to three small pieces of it
in `ope-learn/tags.json`, each with a test, for the skill they are on; you grade
their answers in `ope-learn/answers/`; and from Stage 4 up you stop writing code
for them. The file says exactly where they are. If it says `Mode: Building`, or
there is no file, ignore `ope-learn` and work normally.

## The system folder: open only when needed

| When the work involves | Open |
|---|---|
| the full working rules, and why they exist | `ope-system/method/rules.md` |
| planning a whole number project in detail | `ope-system/method/project-opener.md` and `abcd.md` |
| putting an iPhone or iPad app on the App Store | `ope-system/maps/app-store-launch.md` |
| an Android app, a Windows or Linux download | `ope-system/maps/android-desktop-downloads.md` |
| a Mac app people download outside the App Store | `ope-system/maps/mac-app-from-github.md` |
| taking payments for your customers' customers (Stripe Connect) | `ope-system/maps/payments-for-your-customers.md` |
| turning a web tool into a Mac app that works offline | `ope-system/maps/offline-mac-tool.md` |
| adding a new kind of customer or product type | `ope-system/maps/types-as-data.md` |
| making a founder show up in Google and AI answers | `ope-system/maps/founder-seo.md` |
