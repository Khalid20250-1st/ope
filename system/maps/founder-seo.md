# Making a founder show up in Google and AI answers

Search engines and AI models build a person from repeated, matching,
machine readable facts. One exact name and bio, repeated everywhere, cross linked,
with schema. Consistency beats a common name.

## Steps, in order

1. **Lock the identity.** One name spelling, one long bio, one short bio, one ordered
   list of links. Never vary them.
2. **One canonical person page** (a personal domain is strongest), with a visible
   line "Founder and CEO of X, Y".
3. **A JSON-LD graph on that page:** a Person node (jobTitle, worksFor, image,
   address, sameAs to every profile) and an Organization node per company, each with
   `founder` pointing back to the Person by `@id`.
4. **Founder credit on every product site:** "Founded by <name>" linking to the
   person page, Organization schema with the founder, cross links between brands.
5. **Let crawlers in.** robots.txt allows GPTBot, OAI-SearchBot, PerplexityBot,
   ClaudeBot, Google-Extended. The person and about pages are in the sitemap.
6. **Profiles that corroborate:** LinkedIn, GitHub, Crunchbase (person and each
   company), X, Product Hunt, Google Business Profile, each with the identical name,
   bio and links.
7. **Writing in their name:** bylines on the company blog, a few articles elsewhere,
   each ending with the same bio and links.
8. **Wikidata, last,** once there are two or more independent sources: a person item
   and company items linked by founder.
9. **Index and watch.** Verify every domain in Google Search Console, submit
   sitemaps, request indexing. Every few weeks search the exact name and ask an AI
   "who is <name>".

## Realistic expectations

Months, not days, and it depends on outside sources. The near term win is that the
exact name, and "who is <name>" in an AI, resolve to the right person.

## The person's own part

Buying the domain, creating the accounts, growing real connections, launching on
Product Hunt, and giving the verification codes.
