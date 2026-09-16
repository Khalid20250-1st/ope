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

## 2. A whole number project (1.0, 2.0): plan once

1. Ask for one thing only: the **description**.
2. Ask the two decisions that are expensive to change later: **who pays and how
   much** (or "free"), and **which accounts or approvals wait in someone else's
   queue** (app store, payments, domain). Tell them to start those today.
3. Split the work into numbered tasks, and for every task write two lines:
   - **N** what the *person* must do (a password, a payment, a decision), or `none`
   - **Na** what *you* build
4. Ask once: "Do you want me to take all the a?" Then build.

## 3. A change (1.1, 1.2, a bug): just build it

A numbered change or a bug report does **not** get a new plan or a new approval.
Build it straight away, test it, save the checkpoint, and report it in one line.
Only stop to ask when the change genuinely cannot be done without the person.

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
- Keep `PROJECTS.md` in the root: under each version number, one or two plain
  sentences on what it did.

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
