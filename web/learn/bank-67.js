/* Part 6 Designer and Part 7 Elite: the milestones added for the 96 milestone course */
window.OPEBank.push(

/* ================================================================ 6 Designer */
{id: 'design-naming', skill: 'design-naming', kind: 'check', title: 'Give it real names',
 ask: 'solution.cjs works, but its names say nothing. f adds up a list of cart items, each with a price and a qty (how many). doIt says if an invoice is late: past its due time and not paid. Rename f to totalPrice and doIt to isOverdue. Then rename the inside names too: x, y and data2 should say what they hold, like items, item and sum. It must still give the same answers, and the old names must be gone from the file.',
 files: {'solution.cjs': `function f(x) {
  let data2 = 0;
  for (const y of x) data2 += y.price * y.qty;
  return data2;
}

function doIt(x) {
  return Date.now() > x.due && !x.paid;
}

module.exports = { f, doIt };
`},
 test: `const m = load('solution.cjs');
const text = fs.readFileSync(path.join(here, 'solution.cjs'), 'utf8');
check('totalPrice adds up the cart', () => {
  assert.strictEqual(typeof m.totalPrice, 'function', 'there is no totalPrice exported yet');
  assert.strictEqual(m.totalPrice([{ price: 3, qty: 2 }, { price: 5, qty: 1 }]), 11);
  assert.strictEqual(m.totalPrice([]), 0);
});
check('isOverdue spots a late unpaid invoice', () => {
  assert.strictEqual(typeof m.isOverdue, 'function', 'there is no isOverdue exported yet');
  assert.strictEqual(m.isOverdue({ due: Date.now() - 1000, paid: false }), true);
  assert.strictEqual(m.isOverdue({ due: Date.now() - 1000, paid: true }), false);
  assert.strictEqual(m.isOverdue({ due: Date.now() + 60000, paid: false }), false);
});
check('the old names are gone', () => {
  for (const old of ['f', 'doIt', 'data2', 'x', 'y']) {
    assert.ok(!new RegExp('\\\\b' + old + '\\\\b').test(text), 'the name ' + old + ' is still in solution.cjs');
  }
});`,
 solve: {'solution.cjs': `function totalPrice(items) {
  let sum = 0;
  for (const item of items) sum += item.price * item.qty;
  return sum;
}

function isOverdue(invoice) {
  return Date.now() > invoice.due && !invoice.paid;
}

module.exports = { totalPrice, isOverdue };
`}},

{id: 'design-schema', skill: 'design-schema', kind: 'check', title: 'A table for bookings',
 ask: 'A database keeps data in tables, like a spreadsheet with strict columns. SQL is the language you describe them in. In schema.sql, write a CREATE TABLE for a table called bookings with these columns: id, the primary key (the column that names each row, never repeated). client_email, text, not null (it must always be filled in). starts_at, a timestamp (a date and a time), not null. price_cents, an integer, not null (whole cents, so $12.50 is 1250, because money in decimals rounds wrong). status, text, with a CHECK that only lets it be held, paid or cancelled.',
 files: {'schema.sql': '-- write the CREATE TABLE for bookings here\n'},
 test: `const raw = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8');
const sql = raw.split('\\n').map(l => l.replace(/--.*$/, '')).join('\\n');
check('there is a CREATE TABLE bookings', () => {
  assert.ok(/create\\s+table\\s+(if\\s+not\\s+exists\\s+)?"?bookings"?/i.test(sql), 'no CREATE TABLE bookings yet');
});
check('id is the primary key', () => {
  assert.ok(/\\bid\\b[^,]*primary\\s+key/i.test(sql) || /primary\\s+key\\s*\\(\\s*id\\s*\\)/i.test(sql), 'id is not marked primary key');
});
check('client_email is text and not null', () => {
  assert.ok(/client_email\\s+(text|varchar)[^,]*not\\s+null/i.test(sql), 'client_email should be text not null');
});
check('starts_at is a timestamp and not null', () => {
  assert.ok(/starts_at\\s+timestamp[^,]*not\\s+null/i.test(sql), 'starts_at should be timestamp not null');
});
check('price_cents is an integer and not null', () => {
  assert.ok(/price_cents\\s+(integer|int|bigint)\\b[^,]*not\\s+null/i.test(sql), 'price_cents should be integer not null');
});
check('status can only be held, paid or cancelled', () => {
  assert.ok(/\\bstatus\\s+(text|varchar)/i.test(sql), 'status should be a text column');
  const m = sql.match(/check\\s*\\(\\s*status\\s+in\\s*\\(([^)]*)\\)/i);
  assert.ok(m, 'no CHECK (status IN (...)) found');
  const words = (m[1].match(/'[^']*'/g) || []).map(w => w.slice(1, -1).toLowerCase()).sort();
  assert.deepStrictEqual(words, ['cancelled', 'held', 'paid'], 'the CHECK should allow exactly held, paid and cancelled');
});`,
 solve: {'schema.sql': `CREATE TABLE bookings (
  id bigserial PRIMARY KEY,
  client_email text NOT NULL,
  starts_at timestamptz NOT NULL,
  price_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'paid', 'cancelled'))
);
`}},

{id: 'design-interface', skill: 'design-interface', kind: 'check', title: 'Build to the promise',
 ask: 'An interface is a promise: the functions a piece of code gives, what each takes and what each gives back. Other code is written against the promise, not against how you build it. Build a store in solution.cjs that keeps this promise:\n  put(item) saves the item. If it has no id, give it a new one that no other item has. If it already has an id, replace the saved item with that id. It gives back the saved item, with its id.\n  get(id) gives back the item with that id, or null if there is none.\n  list() gives back an array of every saved item.\n  remove(id) deletes it and gives back true, or gives back false if there was nothing to delete.\nExport all four from solution.cjs.',
 files: {'solution.cjs': '// Build the store here. task.md says the promise it has to keep.\n\nmodule.exports = {};\n'},
 test: `const s = load('solution.cjs');
check('all four functions are there', () => {
  for (const n of ['put', 'get', 'list', 'remove']) assert.strictEqual(typeof s[n], 'function', n + ' is not exported yet');
});
check('put gives back the item with a new id', () => {
  const a = s.put({ name: 'Ada' });
  assert.ok(a && a.id !== undefined && a.id !== null, 'put did not give back an item with an id');
  assert.strictEqual(a.name, 'Ada');
  const b = s.put({ name: 'Bo' });
  assert.notStrictEqual(a.id, b.id, 'two items got the same id');
  assert.strictEqual(s.list().length, 2, 'list should have 2 items');
});
check('get finds by id, and null when missing', () => {
  const c = s.put({ name: 'Cy' });
  assert.strictEqual(s.get(c.id).name, 'Cy');
  assert.strictEqual(s.get('no such id'), null);
});
check('put with an id replaces, not adds', () => {
  const d = s.put({ name: 'Di' });
  const before = s.list().length;
  s.put({ id: d.id, name: 'Dee' });
  assert.strictEqual(s.list().length, before, 'putting an existing id added a new item');
  assert.strictEqual(s.get(d.id).name, 'Dee');
});
check('remove gives true, then false', () => {
  const e = s.put({ name: 'Ed' });
  assert.strictEqual(s.remove(e.id), true);
  assert.strictEqual(s.remove(e.id), false);
  assert.strictEqual(s.get(e.id), null);
  assert.ok(!s.list().some(x => x.id === e.id), 'list still has the removed item');
});`,
 solve: {'solution.cjs': `const items = new Map();
let next = 1;

function put(item) {
  const saved = Object.assign({}, item);
  if (saved.id === undefined || saved.id === null) saved.id = next++;
  items.set(saved.id, saved);
  return saved;
}

function get(id) {
  return items.has(id) ? items.get(id) : null;
}

function list() {
  return Array.from(items.values());
}

function remove(id) {
  return items.delete(id);
}

module.exports = { put, get, list, remove };
`}},

{id: 'design-duplication', skill: 'design-duplication', kind: 'check', title: 'One place instead of four',
 ask: 'solution.cjs has the same sum copied four times, one per country. Make it ONE price(item, country) function that reads a table of countries, each with its tax and its shipping. It must give the same prices as now. A country that is not in the table must throw new Error(\'Unknown country\') instead of giving back nothing. The priceFor functions must be gone, and the file may have at most two functions in it.',
 files: {'solution.cjs': `function priceForUS(item) { return item.base * 1.07 + 5; }
function priceForUK(item) { return item.base * 1.2 + 4; }
function priceForDE(item) { return item.base * 1.19 + 4; }
function priceForFR(item) { return item.base * 1.2 + 4; }

function price(item, country) {
  if (country == 'US') return priceForUS(item);
  if (country == 'UK') return priceForUK(item);
  if (country == 'DE') return priceForDE(item);
  if (country == 'FR') return priceForFR(item);
}

module.exports = { price };
`},
 test: `const { price } = load('solution.cjs');
const text = fs.readFileSync(path.join(here, 'solution.cjs'), 'utf8');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, 'expected ' + b + ' but got ' + a);
check('same prices as before', () => {
  near(price({ base: 100 }, 'US'), 112);
  near(price({ base: 100 }, 'UK'), 124);
  near(price({ base: 100 }, 'DE'), 123);
  near(price({ base: 100 }, 'FR'), 124);
  near(price({ base: 10 }, 'US'), 15.7);
});
check('an unknown country throws', () => {
  assert.throws(() => price({ base: 100 }, 'XX'), /Unknown country/);
});
check('one function reading a table', () => {
  assert.ok(!/priceFor/.test(text), 'a priceFor function is still in the file');
  const count = (text.match(/\\bfunction\\b/g) || []).length + (text.match(/=>/g) || []).length;
  assert.ok(count <= 2, 'the file has ' + count + ' functions, it should have at most 2');
});`,
 solve: {'solution.cjs': `const COUNTRIES = {
  US: { tax: 1.07, shipping: 5 },
  UK: { tax: 1.2, shipping: 4 },
  DE: { tax: 1.19, shipping: 4 },
  FR: { tax: 1.2, shipping: 4 }
};

function price(item, country) {
  const c = COUNTRIES[country];
  if (!Object.prototype.hasOwnProperty.call(COUNTRIES, country)) throw new Error('Unknown country');
  return item.base * c.tax + c.shipping;
}

module.exports = { price, COUNTRIES };
`}},

{id: 'design-state', skill: 'design-state', kind: 'explain', title: 'Where does the cart live',
 ask: 'Read shop.js. The cart is kept in three places: a list in the code, a copy in localStorage (a small store in the browser that survives a reload), and the number on the cart badge in the page. People say the badge sometimes shows the wrong number. Say why that happens, where the cart should live, and how the other two should get their value from it.',
 files: {'shop.js': "let cart = [];\n\nfunction addToCart(item) {\n  cart.push(item);\n  localStorage.setItem('cart', JSON.stringify(cart));\n  const badge = document.getElementById('badge');\n  badge.textContent = Number(badge.textContent) + 1;\n}\n\nfunction removeFromCart(id) {\n  cart = cart.filter(i => i.id !== id);\n  localStorage.setItem('cart', JSON.stringify(cart));\n}\n\nwindow.onload = () => {\n  cart = JSON.parse(localStorage.getItem('cart') || '[]');\n};\n"},
 model: 'Three copies drift apart. removeFromCart never touches the badge, and on reload the cart is read back but the badge starts from whatever the page says, so the number is wrong. The cart should live in one place: the cart list inside one cart module, which is the only code allowed to change it. localStorage is just a saved copy that the module writes every time the cart changes and reads once at start. The badge is never counted up or down by hand; after every change the module draws it again from cart.length. One source, everything else is worked out from it.'},

{id: 'design-errors', skill: 'design-errors', kind: 'explain', title: 'What can go wrong with a deposit',
 ask: 'A booking page is getting a "pay a deposit" button: the person pays $20 now to hold their time. Before any code, list at least five things that can go wrong. For each one, say what the person sees on the screen and what the system does.',
 model: 'Card declined: they see "Your card was declined, try another card", the time is not held. They close the page or lose signal halfway: the time stays held for 15 minutes only, then is freed; if they come back they see where they left off. They press the button twice: the second press does nothing because the button is disabled and the payment has a one time key, so they are never charged twice. Someone else takes the same time while they are paying: the time is held the moment they start, so this cannot happen; if the hold ran out, they see "That time was just taken" and are refunded at once. The card company charged them but our server never heard back: we check with the payment company (through its webhook, a message it sends our server) and mark it paid; they see "Payment received" by email even if the page failed. The bank asks for an extra check and they give up: nothing is charged and the hold ends. Our server is down: they see a plain "Something went wrong, you have not been charged" and we get an alert.'},

{id: 'design-review', skill: 'design-review', kind: 'explain', title: 'Judge this design',
 ask: 'Read design.md. It is a plan for a small invoicing app. Say the two biggest problems with it, why each one matters, and which one you would change first and how.',
 files: {'design.md': "# Invoices app\n\nA page where a freelancer makes invoices and gets paid by card.\n\n## Files\n\n    index.html\n    main.js          every screen, saving, emails and payments (about 2,400 lines)\n    helpers.js\n    helpers2.js\n    utils_final.js\n    config.js        the Stripe secret key, so main.js can take payments\n\n## Data\n\nEvery invoice is kept in the browser's localStorage. There is no server.\n\n## Tests\n\nNone yet. We click through it before each release.\n"},
 model: 'First: the Stripe secret key is in config.js, which is sent to every visitor\'s browser. Anyone can open it and take payments, refund money or read every customer. Change this first: rotate the key today, and move payments to a small server that keeps the key in an environment variable and only ever sends the browser a checkout link. Second: all the invoices live only in localStorage, so clearing the browser or changing laptop loses every invoice the freelancer has, and they are the business records. They need a real database behind that server. Also weak but less urgent: main.js does every job at once, and helpers, helpers2 and utils_final say nothing about what they hold, so nobody can find anything; split by job once the two big problems are fixed.'},

/* ================================================================ 7 Elite */
{id: 'elite-xss', skill: 'elite-xss', kind: 'check', title: 'Text that turns into code',
 ask: 'render(comment) in solution.cjs builds the HTML for a comment by gluing its name and text into the page. If someone writes  <script>...</script>  as their comment, it runs as code in every visitor\'s browser. This is called XSS, cross site scripting. Fix it: before the name and text go into the HTML, turn & into &amp;, < into &lt;, > into &gt;, " into &quot; and \' into &#39;. The comment must still look the same to the reader.',
 files: {'solution.cjs': `function render(comment) {
  return '<div class="comment"><b>' + comment.name + '</b><p>' + comment.text + '</p></div>';
}

module.exports = { render };
`},
 test: `const { render } = load('solution.cjs');
check('a script in the text does not run', () => {
  const html = render({ name: 'Eve', text: "<script>alert('hi')</script>" });
  assert.ok(!html.includes('<script>'), 'the <script> tag is still in the HTML as code');
  assert.ok(html.includes('&lt;script&gt;'), '< and > should become &lt; and &gt;');
  assert.ok(html.includes('&#39;hi&#39;') || html.includes('&#x27;hi&#x27;'), "' should become &#39;");
});
check('the name is escaped too', () => {
  const html = render({ name: '<img src=x onerror=alert(1)> "Bo"', text: 'hello' });
  assert.ok(!html.includes('<img'), 'the name can still add a tag');
  assert.ok(html.includes('&quot;Bo&quot;'), '" should become &quot;');
});
check('& is escaped once, first', () => {
  const html = render({ name: 'Ada', text: 'fish & chips < 5' });
  assert.ok(html.includes('fish &amp; chips &lt; 5'), 'expected fish &amp; chips &lt; 5 in ' + html);
});
check('ordinary comments still look the same', () => {
  assert.strictEqual(render({ name: 'Ada', text: 'Great work' }), '<div class="comment"><b>Ada</b><p>Great work</p></div>');
});`,
 solve: {'solution.cjs': `function escape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function render(comment) {
  return '<div class="comment"><b>' + escape(comment.name) + '</b><p>' + escape(comment.text) + '</p></div>';
}

module.exports = { render };
`}},

{id: 'elite-secrets', skill: 'elite-secrets', kind: 'check', title: 'Take the key out of the code',
 ask: 'config.cjs has the payments key written right in the code, so anyone who can see the code can spend the money. Fix it:\n  paymentsKey() must read process.env.PAYMENTS_KEY (an environment variable, a value the computer hands the program when it starts, kept outside the code).\n  If it is missing or empty, throw new Error(\'PAYMENTS_KEY is not set\').\n  The old key must be gone from config.cjs.\n  Add a file called .env.example that shows which settings the app needs: a line PAYMENTS_KEY= with nothing after it. Never a real key in it.',
 files: {'config.cjs': `const PAYMENTS_KEY = 'ope_live_7f3a9c21d4e8b6';

function paymentsKey() {
  return PAYMENTS_KEY;
}

module.exports = { paymentsKey };
`},
 test: `const secret = 'ope_live_7f3a9c21d4e8b6';
check('the key is gone from config.cjs', () => {
  assert.ok(!fs.readFileSync(path.join(here, 'config.cjs'), 'utf8').includes(secret), 'the key is still written in config.cjs');
});
check('paymentsKey reads PAYMENTS_KEY', () => {
  process.env.PAYMENTS_KEY = 'from_the_env_123';
  assert.strictEqual(load('config.cjs').paymentsKey(), 'from_the_env_123');
});
check('a missing key throws', () => {
  delete process.env.PAYMENTS_KEY;
  assert.throws(() => load('config.cjs').paymentsKey(), /PAYMENTS_KEY is not set/);
  process.env.PAYMENTS_KEY = '';
  assert.throws(() => load('config.cjs').paymentsKey(), /PAYMENTS_KEY is not set/);
});
check('.env.example lists PAYMENTS_KEY with no value', () => {
  const f = path.join(here, '.env.example');
  assert.ok(fs.existsSync(f), 'there is no .env.example yet');
  const text = fs.readFileSync(f, 'utf8');
  assert.ok(/^PAYMENTS_KEY=[ \\t]*$/m.test(text), '.env.example needs a line PAYMENTS_KEY= with nothing after it');
  assert.ok(!text.includes(secret), 'the real key is in .env.example');
});`,
 solve: {'config.cjs': `function paymentsKey() {
  const key = process.env.PAYMENTS_KEY;
  if (!key) throw new Error('PAYMENTS_KEY is not set');
  return key;
}

module.exports = { paymentsKey };
`, '.env.example': '# copy this to .env and fill it in. Never commit .env\nPAYMENTS_KEY=\n'}},

{id: 'elite-auth', skill: 'elite-auth', kind: 'check', title: 'Only the author can edit',
 ask: 'editPost(user, post, text) in solution.cjs lets anyone change any post. Fix it: only the author (user.id is the same as post.authorId) or an admin (user.role is \'admin\') may edit. Anyone else, including nobody signed in (user is null), gets new Error(\'Not allowed\') and the post must stay exactly as it was.',
 files: {'solution.cjs': `function editPost(user, post, text) {
  post.text = text;
  post.editedBy = user.id;
  return post;
}

module.exports = { editPost };
`},
 test: `const { editPost } = load('solution.cjs');
const fresh = () => ({ id: 1, authorId: 'ada', text: 'first' });
check('the author can edit', () => {
  const p = fresh();
  editPost({ id: 'ada', role: 'user' }, p, 'changed');
  assert.strictEqual(p.text, 'changed');
});
check('an admin can edit', () => {
  const p = fresh();
  editPost({ id: 'boss', role: 'admin' }, p, 'fixed by admin');
  assert.strictEqual(p.text, 'fixed by admin');
});
check('someone else is refused and nothing changes', () => {
  const p = fresh();
  assert.throws(() => editPost({ id: 'eve', role: 'user' }, p, 'hacked'), /Not allowed/);
  assert.deepStrictEqual(p, fresh(), 'the post was changed anyway');
});
check('nobody signed in is refused', () => {
  const p = fresh();
  assert.throws(() => editPost(null, p, 'hacked'), /Not allowed/);
  assert.deepStrictEqual(p, fresh());
});`,
 solve: {'solution.cjs': `function editPost(user, post, text) {
  const allowed = user && (user.id === post.authorId || user.role === 'admin');
  if (!allowed) throw new Error('Not allowed');
  post.text = text;
  post.editedBy = user.id;
  return post;
}

module.exports = { editPost };
`}},

{id: 'elite-complexity', skill: 'elite-complexity', kind: 'explain', title: 'How it grows',
 ask: 'Read sample.js. Each function takes a list. If the list gets 10 times longer, how much longer does each function take? Say it in plain words for all three, and why.',
 files: {'sample.js': "// prices is an object like { apple: 2, pear: 3 }\nfunction priceOf(prices, name) {\n  return prices[name];\n}\n\nfunction total(list) {\n  let sum = 0;\n  for (const n of list) sum += n;\n  return sum;\n}\n\nfunction pairsThatMatch(list) {\n  let count = 0;\n  for (const a of list) {\n    for (const b of list) {\n      if (a === b) count++;\n    }\n  }\n  return count;\n}\n"},
 model: 'priceOf takes the same time however big it gets: it jumps straight to the name, it never looks through the others. total looks at each item once, so 10 times the items is about 10 times the time. pairsThatMatch looks at every item for every item, so 10 times the items is 10 times 10, about 100 times the time. That last kind is the one that gets slow fast: 1,000 items is a million checks.'},

{id: 'elite-cache', skill: 'elite-cache', kind: 'check', title: 'Do not ask twice',
 ask: 'slowPrice(id) in solution.cjs is slow; pretend it asks a far away server every time. The page calls it again and again with the same ids. Write cachedPrice(id): the first time it sees an id it calls slowPrice and remembers the answer, and every time after it gives back the remembered answer without calling slowPrice. This is called a cache. Careful: a price of 0 is still an answer to remember. Leave slowPrice and calls as they are.',
 files: {'solution.cjs': `let calls = 0;

function slowPrice(id) {
  calls++;
  // pretend this asks a far away server and takes a second
  return id.length * 10;
}

function cachedPrice(id) {
  return slowPrice(id);
}

module.exports = { slowPrice, cachedPrice, calls: () => calls };
`},
 test: `const m = load('solution.cjs');
check('same answers as slowPrice', () => {
  assert.strictEqual(m.cachedPrice('ab'), 20);
  assert.strictEqual(m.cachedPrice('ab'), 20);
  assert.strictEqual(m.cachedPrice('abcd'), 40);
});
check('slowPrice runs only once per id', () => {
  const s = load('solution.cjs');
  for (const id of ['a', 'bb', 'a', 'bb', 'a', 'ccc', 'ccc', 'a']) s.cachedPrice(id);
  assert.strictEqual(s.calls(), 3, 'slowPrice ran ' + s.calls() + ' times for 3 different ids');
});
check('a price of 0 is remembered too', () => {
  const s = load('solution.cjs');
  assert.strictEqual(s.cachedPrice(''), 0);
  assert.strictEqual(s.cachedPrice(''), 0);
  assert.strictEqual(s.calls(), 1, 'the 0 price was asked for again');
});`,
 solve: {'solution.cjs': `let calls = 0;

function slowPrice(id) {
  calls++;
  // pretend this asks a far away server and takes a second
  return id.length * 10;
}

const cache = new Map();

function cachedPrice(id) {
  if (!cache.has(id)) cache.set(id, slowPrice(id));
  return cache.get(id);
}

module.exports = { slowPrice, cachedPrice, calls: () => calls };
`}},

{id: 'elite-race', skill: 'elite-race', kind: 'check', title: 'Two at the same time',
 ask: 'withdraw(amount) in solution.cjs checks the balance, waits for the bank, then takes the money. If two withdrawals of 70 start at the same time from 100, both check first, both see 100, and the account ends at 60 below zero. This is a race: two things running at once, and the answer depends on which finishes first. Fix withdraw so withdrawals run one after another, each waiting for the one before to finish. A simple way is a queue: keep the promise of the last withdrawal and chain the next one after it. Then the second one of 70 must fail with new Error(\'Not enough money\'). A failed withdrawal must not stop the ones after it.',
 files: {'solution.cjs': `const account = { balance: 100 };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function withdraw(amount) {
  if (account.balance < amount) throw new Error('Not enough money');
  await wait(10); // talking to the bank
  account.balance -= amount;
  return account.balance;
}

module.exports = { withdraw, account };
`},
 test: `await check('two at once: one works, one is refused', async () => {
  const { withdraw, account } = load('solution.cjs');
  const r = await Promise.allSettled([withdraw(70), withdraw(70)]);
  const ok = r.filter(x => x.status === 'fulfilled'), no = r.filter(x => x.status === 'rejected');
  assert.strictEqual(account.balance, 30, 'the balance ended at ' + account.balance);
  assert.strictEqual(ok.length, 1, ok.length + ' withdrawals went through');
  assert.strictEqual(ok[0].value, 30);
  assert.ok(no.length === 1 && /Not enough money/.test(no[0].reason && no[0].reason.message), 'the second should fail with Not enough money');
});
await check('a failure does not block the next one', async () => {
  const { withdraw, account } = load('solution.cjs');
  const r = await Promise.allSettled([withdraw(70), withdraw(70), withdraw(30)]);
  assert.deepStrictEqual(r.map(x => x.status), ['fulfilled', 'rejected', 'fulfilled']);
  assert.strictEqual(account.balance, 0);
});`,
 solve: {'solution.cjs': `const account = { balance: 100 };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function withdrawNow(amount) {
  if (account.balance < amount) throw new Error('Not enough money');
  await wait(10); // talking to the bank
  account.balance -= amount;
  return account.balance;
}

let last = Promise.resolve();

function withdraw(amount) {
  const run = last.then(() => withdrawNow(amount));
  last = run.catch(() => {});
  return run;
}

module.exports = { withdraw, account };
`}},

{id: 'elite-architecture', skill: 'elite-architecture', kind: 'explain', title: 'From 10 shops to 10,000',
 ask: 'A booking app runs on one server with one database. Every shop has its own booking page, and reminders are sent by a loop that checks every booking each minute. It works well for 10 shops. It is about to grow to 10,000. Say what breaks first, then next, in order, and what you would change for each. Say how you would know it is breaking before the shops tell you.',
 model: 'First, measure: add monitoring for response time, errors and database load, so you see it coming. Then the database: pages that load every booking with no index (a lookup table the database keeps so it can find rows fast) get slow; add indexes on shop and time, and page through results instead of loading all. Next the reminder loop: checking every booking every minute grows with every shop and will overlap itself; move reminders to a queue of jobs due at a time, run by a separate worker. Next the booking pages: every visit hits the server; cache the public pages at the edge so the server only does bookings. Then the limits of others: the email provider will cap how many you send, so batch and pick a plan. Then one shop can hurt everyone, with a huge import or a bot; add limits per shop. Last, a second server behind a load balancer only once the above are done, with backups tested and a way to deploy without downtime.'}

);
