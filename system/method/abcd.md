# ABCD: how a project runs

- **A, split.** Every task is numbered. The bare number is the person's part, **Na**
  is what the AI builds, **Nb** is anything found while building that needs the
  person (a password, money, a decision, a dashboard click).
- **B, build.** Do 1a, 2a, 3a back to back. The moment something needs the person,
  name it Nb, park it, carry on. Never stop mid queue to hand over one thing.
- **C, refine.** After the b list is dealt with, go back over what was built and
  make it right. Refining half a thing is wasted.
- **D, deploy.** Once, at the end.

## One exception

When a b stops its own task dead (a missing key, a decision that changes what gets
built), mark that task blocked and move to the next a. Never guess to keep moving:
a wrong guess gets built on ten times over.

## Reporting

One line per finished task, in one of three states:

- done and tested
- done, but cannot be tested until the person does their part
- blocked, waiting on the person

Then the person's b list, in order. Nothing padded onto it that could have been
done without them.
