# Adding a new kind of customer as one row

When a product serves several kinds of customer (a shop, a person on their own, a
school) and each new kind has been added by editing code in several places, it is
time to make a kind a row in the database.

## Before adding a kind, ask three things

1. **Do they need an address category?** `example.com/category/name` or just
   `example.com/name`. With a category, names only need to be unique inside it.
2. **The description.** Then plan it like any project.
3. **What do they pay?** The owner answers this. Never infer a price or carry a
   default forward.

## One table

| Column | Decides |
|---|---|
| `k` | the key stored on each customer |
| `name`, `short` | how it is labelled |
| `category` | the word that groups them, or null for top level addresses |
| `plan` | what they pay: individual, business, free |
| `layouts` | the page designs this kind can use |
| `page` | one page for every customer of this kind, when there is no choice |
| `sort` | its position in lists |

The admin screen, the address rules, billing and the router all read this table.
Nothing else is edited to add a kind. The price decides the price only, never the
layouts.

## Things that bite

- **A name is only unique where it lives.** Once categories exist, anything that
  finds a customer by name alone is wrong. Use partial unique indexes, one per scope.
- **Counting path segments is not how you know what an address is.** A preview URL
  can be two segments deep and have nothing to do with a category. An explicit
  parameter wins over counting.
- **Offline copies go stale.** An app that bundles the kinds at build time must be
  rebuilt when a kind is added, or it silently shows the old list.
- **A closure is a block, not a word.** If the booking engine only understands open
  and blocked times, send a closed day as a full day block.

## Prove it

Call the API the admin screen uses: the kind appears, a customer of that kind saves,
its address answers, and the name is free or taken in the right scope. Then delete
the test customer.
