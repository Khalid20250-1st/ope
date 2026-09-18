/* THE PRACTICE BANK. One task for every skill, and one door test for every
   stage, each with its own test.

   Used when your own project has nothing at your level that day, and for the
   stage door tests. A task is written into ope-learn/practice/<id>/ in your
   project: task.md says what to do, the starter files are what you work in, and
   test.cjs is what OPE runs to check it. Tests are plain Node, .cjs so they run
   the same whatever the project's own settings say.

   kind  check    OPE runs test.cjs; exit 0 is a pass
         explain  you write an answer; your AI coder grades it on its next run
   test  the body of an async test. check(name, fn) and load(file) are given.
   solve what "just do it for me" writes: files, or a function for the ones
         that depend on your machine
   model a good answer to an explain task, shown when you skip it */
window.OPEBank = [

/* ================================================================ 0 Computer */
{id: 'files-folders', skill: 'files-folders', kind: 'check', title: 'Make a folder and a file',
 ask: 'Inside this practice folder, make a folder called notes. Inside notes, make a file called today.txt and write anything in it.',
 test: "check('notes/today.txt exists and has words in it', () => {\n  const f = path.join(here, 'notes', 'today.txt');\n  assert.ok(fs.existsSync(f), 'there is no notes/today.txt yet');\n  assert.ok(fs.readFileSync(f, 'utf8').trim().length > 0, 'today.txt is empty');\n});",
 solve: {'notes/today.txt': 'My first file.\n'}},

{id: 'paths', skill: 'paths', kind: 'check', title: 'Where does this folder live',
 ask: 'Every file has an address called its path, like /Users/you/project/notes.txt. Write the full path of this practice folder into a file called path.txt here. In Finder, hold Option and right click the folder, then Copy as Pathname. On Windows, click the address bar in Explorer.',
 test: "check('path.txt holds the path of this folder', () => {\n  const f = path.join(here, 'path.txt');\n  assert.ok(fs.existsSync(f), 'there is no path.txt yet');\n  const said = fs.readFileSync(f, 'utf8').trim().replace(/[\\\\/]+$/, '');\n  assert.strictEqual(fs.realpathSync(said), fs.realpathSync(here), 'that is not the path of this folder');\n});",
 solve: function(c){ var o = {}; o['path.txt'] = c.here + '\n'; return o; }},

{id: 'terminal', skill: 'terminal', kind: 'check', title: 'Run a command',
 ask: 'Open a terminal in this practice folder (in Finder: right click the folder, New Terminal at Folder). Type  ls > list.txt  and press Return. On Windows type  dir > list.txt  instead. It lists the folder and saves the list into list.txt.',
 test: "check('list.txt lists this folder', () => {\n  const f = path.join(here, 'list.txt');\n  assert.ok(fs.existsSync(f), 'there is no list.txt yet');\n  assert.ok(/task\\.md/.test(fs.readFileSync(f, 'utf8')), 'list.txt does not list task.md, so it is not the list of this folder');\n});",
 solve: {'list.txt': 'list.txt\ntask.md\ntest.cjs\n'}},

{id: 'git-save', skill: 'git-save', kind: 'check', title: 'Save a checkpoint',
 ask: 'Git keeps every saved version of your project. Change the words in note.txt, then save a checkpoint from the terminal, in your OPE Course folder on the Desktop:\n  git add -A\n  git commit -m "practice: my first checkpoint"\nThe message has to start with the word practice.',
 files: {'note.txt': 'Change these words.\n'},
 test: "check('a checkpoint starting with practice saved note.txt', () => {\n  const rel = path.relative(root, path.join(here, 'note.txt'));\n  const out = sh('git log -n 30 --format=%s -- \"' + rel + '\"');\n  assert.ok(/^practice/m.test(out), 'no checkpoint starting with practice has saved note.txt yet');\n  assert.ok(!/^Change these words/.test(fs.readFileSync(path.join(here, 'note.txt'), 'utf8')), 'note.txt still has the words it started with');\n});",
 solve: {files: {'note.txt': 'My own words.\n'}, commit: 'practice: my first checkpoint'}},

{id: 'git-history', skill: 'git-history', kind: 'check', title: 'Read the history',
 ask: 'Find the message of the very first checkpoint ever saved in your OPE Course folder and write it, exactly, into answer.txt. In the terminal:  git log --reverse --format=%s  and the top line is the first one.',
 test: "check('answer.txt holds the first message', () => {\n  const f = path.join(here, 'answer.txt');\n  assert.ok(fs.existsSync(f), 'there is no answer.txt yet');\n  const first = sh('git log --reverse --format=%s').split('\\n')[0].trim();\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), first, 'that is not the first message');\n});",
 solve: function(c){ return c.git(['log', '--reverse', '--format=%s']).then(function(r){ return {'answer.txt': (r.out.split('\n')[0] || '') + '\n'}; }); }},

{id: 'door-0', door: 0, kind: 'check', title: 'Part 0 door test',
 ask: 'All of Part 0 at once. Make a folder called door with a file hello.txt in it that says your name. Then save a checkpoint whose message starts with  door 0. Finally write the path of the door folder into where.txt, here in the practice folder.',
 test: "const d = path.join(here, 'door');\ncheck('door/hello.txt has your name', () => {\n  assert.ok(fs.existsSync(path.join(d, 'hello.txt')), 'there is no door/hello.txt');\n  assert.ok(fs.readFileSync(path.join(d, 'hello.txt'), 'utf8').trim(), 'hello.txt is empty');\n});\ncheck('where.txt holds the path of door', () => {\n  const f = path.join(here, 'where.txt');\n  assert.ok(fs.existsSync(f), 'there is no where.txt');\n  assert.strictEqual(fs.realpathSync(fs.readFileSync(f, 'utf8').trim()), fs.realpathSync(d));\n});\ncheck('a checkpoint starting with door 0 saved it', () => {\n  assert.ok(/^door 0/m.test(sh('git log -n 30 --format=%s -- \"' + path.relative(root, d) + '\"')), 'no checkpoint starting with door 0 has saved the door folder');\n});",
 solve: function(c){ var o = {files: {}, commit: 'door 0: my folder'}; o.files['door/hello.txt'] = 'Me\n'; o.files['where.txt'] = c.here + '/door\n'; return o; }},

/* ================================================================ 1 Reader */
{id: 'read-values', skill: 'read-values', kind: 'explain', title: 'What is the price at the end',
 ask: 'Read sample.js. What is price when the last line has run, and why? Say it step by step.',
 files: {'sample.js': "let price = 20;\nlet tax = price * 0.1;\nprice = price + tax;\nlet shown = '$' + price;\n"},
 model: 'price starts at 20. tax is 20 times 0.1, which is 2. Then price is replaced by price plus tax, 20 plus 2, so price is 22. shown is the text "$22"; it does not change price.'},

{id: 'read-if', skill: 'read-if', kind: 'explain', title: 'Who gets in',
 ask: 'Read sample.js. What does canEnter(17) give back, and canEnter(18), and canEnter(12)? Why?',
 files: {'sample.js': "function canEnter(age) {\n  if (age >= 18) {\n    return 'yes';\n  } else if (age >= 16) {\n    return 'with a parent';\n  }\n  return 'no';\n}\n"},
 model: '17 is not 18 or more, so the first if is skipped; it is 16 or more, so it gives "with a parent". 18 passes the first check and gives "yes" straight away. 12 fails both checks and falls through to the last line, "no".'},

{id: 'read-loop', skill: 'read-loop', kind: 'explain', title: 'What does the loop add up',
 ask: 'Read sample.js. What is total when the loop is finished? Walk through each turn of the loop.',
 files: {'sample.js': "let total = 0;\nfor (let i = 1; i <= 6; i++) {\n  if (i % 2 === 0) {\n    total = total + i;\n  }\n}\n"},
 model: 'i goes 1, 2, 3, 4, 5, 6. % 2 === 0 means "even". Only 2, 4 and 6 are even, so total becomes 2, then 6, then 12. total is 12.'},

{id: 'read-function', skill: 'read-function', kind: 'explain', title: 'What goes in, what comes out',
 ask: 'Read sample.js. What does initials take, what does it give back, and what is initials("Ada Lovelace")?',
 files: {'sample.js': "function initials(name) {\n  const parts = name.split(' ');\n  return parts.map(p => p[0].toUpperCase()).join('');\n}\n"},
 model: 'It takes a name as text. split(" ") cuts it at the spaces into a list of words. map takes the first letter of each and makes it a capital. join("") glues them together. initials("Ada Lovelace") is "AL".'},

{id: 'read-flow', skill: 'read-flow', kind: 'explain', title: 'Follow the whole file',
 ask: 'Read sample.js from top to bottom. What does it print, and in what order do the lines actually run?',
 files: {'sample.js': "const cart = [];\n\nfunction add(name, price) {\n  cart.push({ name, price });\n}\n\nfunction total() {\n  let sum = 0;\n  for (const item of cart) sum += item.price;\n  return sum;\n}\n\nadd('Coffee', 3);\nadd('Cake', 4);\nconsole.log(cart.length + ' things, $' + total());\n"},
 model: 'The two functions are only defined at first, nothing runs inside them. Then add runs twice, putting Coffee (3) and Cake (4) into cart. The last line asks for cart.length, 2, and runs total, which adds 3 and 4. It prints "2 things, $7".'},

{id: 'door-1', door: 1, kind: 'explain', title: 'Part 1 door test',
 ask: 'Read sample.js. What does it print? Explain every function, what each if decides and what the loop does, in order.',
 files: {'sample.js': "const people = [\n  { name: 'Sam', age: 15 },\n  { name: 'Lee', age: 22 },\n  { name: 'Ana', age: 17 }\n];\n\nfunction label(person) {\n  if (person.age >= 18) return person.name + ' (adult)';\n  if (person.age >= 16) return person.name + ' (16+)';\n  return person.name + ' (child)';\n}\n\nlet adults = 0;\nfor (const p of people) {\n  if (p.age >= 18) adults++;\n  console.log(label(p));\n}\nconsole.log(adults + ' adult');\n"},
 model: 'The loop goes through the three people in order. For each it counts adults and prints label. Sam is 15, so "Sam (child)". Lee is 22, adults becomes 1, "Lee (adult)". Ana is 17, "Ana (16+)". Then "1 adult".'},

/* ================================================================ 2 Tweaker */
{id: 'tweak-value', skill: 'tweak-value', kind: 'check', title: 'Free shipping sooner',
 ask: 'In solution.cjs shipping is free over $100. Change it so it is free over $50. Change one value only.',
 files: {'solution.cjs': "const FREE_SHIPPING_OVER = 100;\n\nfunction shipping(total) {\n  return total > FREE_SHIPPING_OVER ? 0 : 5;\n}\n\nmodule.exports = { shipping };\n"},
 test: "const { shipping } = load('solution.cjs');\ncheck('$60 ships free', () => assert.strictEqual(shipping(60), 0));\ncheck('$40 still pays $5', () => assert.strictEqual(shipping(40), 5));",
 solve: {'solution.cjs': "const FREE_SHIPPING_OVER = 50;\n\nfunction shipping(total) {\n  return total > FREE_SHIPPING_OVER ? 0 : 5;\n}\n\nmodule.exports = { shipping };\n"}},

{id: 'tweak-condition', skill: 'tweak-condition', kind: 'check', title: 'Saturday counts too',
 ask: 'isWeekend in solution.cjs only knows Sunday. Change the condition so Saturday is the weekend too.',
 files: {'solution.cjs': "function isWeekend(day) {\n  return day === 'Sunday';\n}\n\nmodule.exports = { isWeekend };\n"},
 test: "const { isWeekend } = load('solution.cjs');\ncheck('Saturday is the weekend', () => assert.strictEqual(isWeekend('Saturday'), true));\ncheck('Sunday still is', () => assert.strictEqual(isWeekend('Sunday'), true));\ncheck('Monday is not', () => assert.strictEqual(isWeekend('Monday'), false));",
 solve: {'solution.cjs': "function isWeekend(day) {\n  return day === 'Sunday' || day === 'Saturday';\n}\n\nmodule.exports = { isWeekend };\n"}},

{id: 'tweak-text', skill: 'tweak-text', kind: 'check', title: 'Say it differently',
 ask: 'greet in solution.cjs says "Hello, Ada". Make it say "Welcome back, Ada!" instead, for any name.',
 files: {'solution.cjs': "function greet(name) {\n  return 'Hello, ' + name;\n}\n\nmodule.exports = { greet };\n"},
 test: "const { greet } = load('solution.cjs');\ncheck('Welcome back, Ada!', () => assert.strictEqual(greet('Ada'), 'Welcome back, Ada!'));\ncheck('works for any name', () => assert.strictEqual(greet('Sam'), 'Welcome back, Sam!'));",
 solve: {'solution.cjs': "function greet(name) {\n  return 'Welcome back, ' + name + '!';\n}\n\nmodule.exports = { greet };\n"}},

{id: 'tweak-data', skill: 'tweak-data', kind: 'check', title: 'Put juice on the menu',
 ask: 'Add Juice at $4 to the MENU list in solution.cjs, written the same way as the other two.',
 files: {'solution.cjs': "const MENU = [\n  { name: 'Coffee', price: 3 },\n  { name: 'Tea', price: 2 }\n];\n\nmodule.exports = { MENU };\n"},
 test: "const { MENU } = load('solution.cjs');\ncheck('three things on the menu', () => assert.strictEqual(MENU.length, 3));\ncheck('Juice is $4', () => assert.deepStrictEqual(MENU.find(m => m.name === 'Juice'), { name: 'Juice', price: 4 }));\ncheck('Coffee and Tea are still there', () => assert.ok(MENU.find(m => m.name === 'Coffee') && MENU.find(m => m.name === 'Tea')));",
 solve: {'solution.cjs': "const MENU = [\n  { name: 'Coffee', price: 3 },\n  { name: 'Tea', price: 2 },\n  { name: 'Juice', price: 4 }\n];\n\nmodule.exports = { MENU };\n"}},

{id: 'tweak-loop', skill: 'tweak-loop', kind: 'check', title: 'Count down from 5 to 0',
 ask: 'countdown in solution.cjs counts 10 down to 1. Change the loop so it counts 5 down to 0, and 0 is included.',
 files: {'solution.cjs': "function countdown() {\n  const out = [];\n  for (let i = 10; i > 0; i--) {\n    out.push(i);\n  }\n  return out;\n}\n\nmodule.exports = { countdown };\n"},
 test: "const { countdown } = load('solution.cjs');\ncheck('5, 4, 3, 2, 1, 0', () => assert.deepStrictEqual(countdown(), [5, 4, 3, 2, 1, 0]));",
 solve: {'solution.cjs': "function countdown() {\n  const out = [];\n  for (let i = 5; i >= 0; i--) {\n    out.push(i);\n  }\n  return out;\n}\n\nmodule.exports = { countdown };\n"}},

{id: 'door-2', door: 2, kind: 'check', title: 'Part 2 door test',
 ask: 'solution.cjs is a small shop. Make four changes: opening time 8 instead of 9; open on Saturday as well as weekdays; the sign says "Come in, we are open" when open; and add Bagel at $2 to ITEMS.',
 files: {'solution.cjs': "const OPENS = 9;\nconst CLOSES = 17;\nconst ITEMS = [{ name: 'Muffin', price: 3 }];\n\nfunction isOpen(day, hour) {\n  const workday = day !== 'Saturday' && day !== 'Sunday';\n  return workday && hour >= OPENS && hour < CLOSES;\n}\n\nfunction sign(day, hour) {\n  return isOpen(day, hour) ? 'Open' : 'Closed';\n}\n\nmodule.exports = { isOpen, sign, ITEMS };\n"},
 test: "const s = load('solution.cjs');\ncheck('open at 8 on a Monday', () => assert.strictEqual(s.isOpen('Monday', 8), true));\ncheck('open on Saturday', () => assert.strictEqual(s.isOpen('Saturday', 10), true));\ncheck('still shut on Sunday', () => assert.strictEqual(s.isOpen('Sunday', 10), false));\ncheck('still shut at 17', () => assert.strictEqual(s.isOpen('Monday', 17), false));\ncheck('the sign', () => { assert.strictEqual(s.sign('Monday', 10), 'Come in, we are open'); assert.strictEqual(s.sign('Sunday', 10), 'Closed'); });\ncheck('Bagel at $2', () => assert.deepStrictEqual(s.ITEMS.find(i => i.name === 'Bagel'), { name: 'Bagel', price: 2 }));",
 solve: {'solution.cjs': "const OPENS = 8;\nconst CLOSES = 17;\nconst ITEMS = [{ name: 'Muffin', price: 3 }, { name: 'Bagel', price: 2 }];\n\nfunction isOpen(day, hour) {\n  const workday = day !== 'Sunday';\n  return workday && hour >= OPENS && hour < CLOSES;\n}\n\nfunction sign(day, hour) {\n  return isOpen(day, hour) ? 'Come in, we are open' : 'Closed';\n}\n\nmodule.exports = { isOpen, sign, ITEMS };\n"}},

/* ================================================================ 3 Writer */
{id: 'write-function', skill: 'write-function', kind: 'check', title: 'Write total',
 ask: 'Write the function total(price, quantity) in solution.cjs. It gives back the price times the quantity.',
 files: {'solution.cjs': "function total(price, quantity) {\n  // your code here\n}\n\nmodule.exports = { total };\n"},
 test: "const { total } = load('solution.cjs');\ncheck('3 at $4 is 12', () => assert.strictEqual(total(4, 3), 12));\ncheck('none is 0', () => assert.strictEqual(total(9, 0), 0));",
 solve: {'solution.cjs': "function total(price, quantity) {\n  return price * quantity;\n}\n\nmodule.exports = { total };\n"}},

{id: 'write-if', skill: 'write-if', kind: 'check', title: 'Write grade',
 ask: 'Write grade(score) in solution.cjs: 90 or more is "A", 80 or more is "B", 70 or more is "C", anything else is "F".',
 files: {'solution.cjs': "function grade(score) {\n  // your code here\n}\n\nmodule.exports = { grade };\n"},
 test: "const { grade } = load('solution.cjs');\ncheck('95 is A', () => assert.strictEqual(grade(95), 'A'));\ncheck('90 is A', () => assert.strictEqual(grade(90), 'A'));\ncheck('85 is B', () => assert.strictEqual(grade(85), 'B'));\ncheck('70 is C', () => assert.strictEqual(grade(70), 'C'));\ncheck('69 is F', () => assert.strictEqual(grade(69), 'F'));",
 solve: {'solution.cjs': "function grade(score) {\n  if (score >= 90) return 'A';\n  if (score >= 80) return 'B';\n  if (score >= 70) return 'C';\n  return 'F';\n}\n\nmodule.exports = { grade };\n"}},

{id: 'write-loop', skill: 'write-loop', kind: 'check', title: 'Write sumTo',
 ask: 'Write sumTo(n) in solution.cjs with a loop. It adds up every whole number from 1 to n, so sumTo(4) is 1 + 2 + 3 + 4 = 10.',
 files: {'solution.cjs': "function sumTo(n) {\n  // your code here\n}\n\nmodule.exports = { sumTo };\n"},
 test: "const { sumTo } = load('solution.cjs');\ncheck('sumTo(4) is 10', () => assert.strictEqual(sumTo(4), 10));\ncheck('sumTo(1) is 1', () => assert.strictEqual(sumTo(1), 1));\ncheck('sumTo(100) is 5050', () => assert.strictEqual(sumTo(100), 5050));\ncheck('it uses a loop', () => assert.ok(/\\b(for|while)\\b/.test(fs.readFileSync(path.join(here, 'solution.cjs'), 'utf8')), 'write it with for or while'));",
 solve: {'solution.cjs': "function sumTo(n) {\n  let sum = 0;\n  for (let i = 1; i <= n; i++) sum += i;\n  return sum;\n}\n\nmodule.exports = { sumTo };\n"}},

{id: 'write-data', skill: 'write-data', kind: 'check', title: 'Write cheapNames',
 ask: 'Write cheapNames(items, max) in solution.cjs. items is a list like [{ name: "Tea", price: 2 }]. Give back a list of the names of every item that costs max or less, in the same order.',
 files: {'solution.cjs': "function cheapNames(items, max) {\n  // your code here\n}\n\nmodule.exports = { cheapNames };\n"},
 test: "const { cheapNames } = load('solution.cjs');\nconst items = [{ name: 'Tea', price: 2 }, { name: 'Cake', price: 5 }, { name: 'Coffee', price: 3 }];\ncheck('up to $3', () => assert.deepStrictEqual(cheapNames(items, 3), ['Tea', 'Coffee']));\ncheck('nothing that cheap', () => assert.deepStrictEqual(cheapNames(items, 1), []));",
 solve: {'solution.cjs': "function cheapNames(items, max) {\n  return items.filter(i => i.price <= max).map(i => i.name);\n}\n\nmodule.exports = { cheapNames };\n"}},

{id: 'write-errors', skill: 'write-errors', kind: 'check', title: 'Write parseAge',
 ask: 'Write parseAge(text) in solution.cjs. It turns text like "42" into the number 42. If the text is not a whole number, throw new Error("Not a number"). If it is more than 150, throw new Error("Too old").',
 files: {'solution.cjs': "function parseAge(text) {\n  // your code here\n}\n\nmodule.exports = { parseAge };\n"},
 test: "const { parseAge } = load('solution.cjs');\ncheck('\"42\" is 42', () => assert.strictEqual(parseAge('42'), 42));\ncheck('\"abc\" is not a number', () => assert.throws(() => parseAge('abc'), /Not a number/));\ncheck('\"4.5\" is not a whole number', () => assert.throws(() => parseAge('4.5'), /Not a number/));\ncheck('\"200\" is too old', () => assert.throws(() => parseAge('200'), /Too old/));",
 solve: {'solution.cjs': "function parseAge(text) {\n  if (!/^\\d+$/.test(String(text).trim())) throw new Error('Not a number');\n  const n = Number(text);\n  if (n > 150) throw new Error('Too old');\n  return n;\n}\n\nmodule.exports = { parseAge };\n"}},

{id: 'door-3', door: 3, kind: 'check', title: 'Part 3 door test',
 ask: 'Write receipt(items) in solution.cjs. items is a list like [{ name: "Tea", price: 2, qty: 3 }]. Give back { count, total, dearest }: count is how many things in all (add up qty), total is the money, dearest is the name of the item with the highest price. An empty list throws new Error("Nothing to pay for"). A price below 0 throws new Error("Bad price").',
 files: {'solution.cjs': "function receipt(items) {\n  // your code here\n}\n\nmodule.exports = { receipt };\n"},
 test: "const { receipt } = load('solution.cjs');\nconst items = [{ name: 'Tea', price: 2, qty: 3 }, { name: 'Cake', price: 5, qty: 1 }];\ncheck('count, total, dearest', () => assert.deepStrictEqual(receipt(items), { count: 4, total: 11, dearest: 'Cake' }));\ncheck('empty throws', () => assert.throws(() => receipt([]), /Nothing to pay for/));\ncheck('negative price throws', () => assert.throws(() => receipt([{ name: 'X', price: -1, qty: 1 }]), /Bad price/));",
 solve: {'solution.cjs': "function receipt(items) {\n  if (!items.length) throw new Error('Nothing to pay for');\n  let count = 0, total = 0, dearest = items[0];\n  for (const i of items) {\n    if (i.price < 0) throw new Error('Bad price');\n    count += i.qty;\n    total += i.price * i.qty;\n    if (i.price > dearest.price) dearest = i;\n  }\n  return { count, total, dearest: dearest.name };\n}\n\nmodule.exports = { receipt };\n"}},

/* ================================================================ 4 Builder */
{id: 'build-blank', skill: 'build-blank', kind: 'check', title: 'From nothing: wordCount',
 ask: 'solution.cjs is empty. From nothing, write and export wordCount(text): how many words are in the text. Spaces, tabs and new lines all separate words, and empty text has 0 words. No AI from here on.',
 files: {'solution.cjs': ''},
 test: "const s = load('solution.cjs');\ncheck('it exports wordCount', () => assert.strictEqual(typeof s.wordCount, 'function'));\ncheck('three words', () => assert.strictEqual(s.wordCount('the quick fox'), 3));\ncheck('extra spaces and lines', () => assert.strictEqual(s.wordCount('  a\\n b\\t c  '), 3));\ncheck('empty is 0', () => assert.strictEqual(s.wordCount('   '), 0));",
 solve: {'solution.cjs': "function wordCount(text) {\n  const words = String(text).trim().split(/\\s+/);\n  return words[0] === '' ? 0 : words.length;\n}\n\nmodule.exports = { wordCount };\n"}},

{id: 'build-split', skill: 'build-split', kind: 'check', title: 'slugify, in parts',
 ask: 'Write and export slugify(title) in solution.cjs: "Hello World!" becomes "hello-world". Lower case, spaces become dashes, anything that is not a to z, 0 to 9 or a dash is removed, and no dash at either end. Write it as at least two functions that each do one job.',
 files: {'solution.cjs': ''},
 test: "const s = load('solution.cjs');\ncheck('Hello World!', () => assert.strictEqual(s.slugify('Hello World!'), 'hello-world'));\ncheck('  My  2nd Post  ', () => assert.strictEqual(s.slugify('  My  2nd Post  '), 'my-2nd-post'));\ncheck('at least two functions', () => { const src = fs.readFileSync(path.join(here, 'solution.cjs'), 'utf8'); assert.ok((src.match(/function\\b|=>/g) || []).length >= 2, 'split it into two or more functions'); });",
 solve: {'solution.cjs': "function lower(text) {\n  return String(text).toLowerCase().trim();\n}\n\nfunction dashes(text) {\n  return text.replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');\n}\n\nfunction slugify(title) {\n  return dashes(lower(title));\n}\n\nmodule.exports = { slugify };\n"}},

{id: 'build-files', skill: 'build-files', kind: 'check', title: 'Notes in a file',
 ask: 'Write and export two functions in solution.cjs. saveNote(file, text) adds text as a new line at the end of the file, making the file if it is not there. readNotes(file) gives back the lines as a list, or an empty list if the file is not there. Use the fs module.',
 files: {'solution.cjs': "const fs = require('fs');\n\n"},
 test: "const s = load('solution.cjs');\nconst f = path.join(here, 'notes-test.txt');\ntry { fs.unlinkSync(f); } catch {}\ncheck('no file, no notes', () => assert.deepStrictEqual(s.readNotes(f), []));\ncheck('two notes come back in order', () => { s.saveNote(f, 'first'); s.saveNote(f, 'second'); assert.deepStrictEqual(s.readNotes(f), ['first', 'second']); });\ntry { fs.unlinkSync(f); } catch {}",
 solve: {'solution.cjs': "const fs = require('fs');\n\nfunction saveNote(file, text) {\n  fs.appendFileSync(file, text + '\\n');\n}\n\nfunction readNotes(file) {\n  if (!fs.existsSync(file)) return [];\n  return fs.readFileSync(file, 'utf8').split('\\n').filter(Boolean);\n}\n\nmodule.exports = { saveNote, readNotes };\n"}},

{id: 'build-async', skill: 'build-async', kind: 'check', title: 'Waiting with await',
 ask: 'Write and export two async functions in solution.cjs. slowDouble(n) waits 50 milliseconds, then gives back n times 2. doubleAll(list) gives back every number doubled, using slowDouble, in the same order.',
 files: {'solution.cjs': ''},
 test: "const s = load('solution.cjs');\nawait check('slowDouble waits, then doubles', async () => { const t = Date.now(); assert.strictEqual(await s.slowDouble(4), 8); assert.ok(Date.now() - t >= 45, 'it did not wait'); });\nawait check('doubleAll', async () => assert.deepStrictEqual(await s.doubleAll([1, 2, 3]), [2, 4, 6]));",
 solve: {'solution.cjs': "const wait = ms => new Promise(done => setTimeout(done, ms));\n\nasync function slowDouble(n) {\n  await wait(50);\n  return n * 2;\n}\n\nasync function doubleAll(list) {\n  return Promise.all(list.map(slowDouble));\n}\n\nmodule.exports = { slowDouble, doubleAll };\n"}},

{id: 'build-app', skill: 'build-app', kind: 'check', title: 'A to do list, with your own test',
 ask: 'Build a to do list in solution.cjs and export add(title), done(id), list() and remaining(). add gives back the new item { id, title, done: false } with ids 1, 2, 3 and so on. done marks one finished. list gives back every item. remaining gives back how many are not done. Then write your own test in mytest.cjs that checks it, and exits with an error if something is wrong.',
 files: {'solution.cjs': '', 'mytest.cjs': ''},
 test: "const s = load('solution.cjs');\ncheck('add, done, list, remaining', () => {\n  const a = s.add('milk'), b = s.add('bread');\n  assert.deepStrictEqual(a, { id: a.id, title: 'milk', done: false });\n  assert.strictEqual(b.id, a.id + 1);\n  s.done(a.id);\n  assert.strictEqual(s.list().find(i => i.id === a.id).done, true);\n  assert.strictEqual(s.remaining(), s.list().filter(i => !i.done).length);\n});\ncheck('your own test exists and passes', () => {\n  const t = path.join(here, 'mytest.cjs');\n  assert.ok(fs.readFileSync(t, 'utf8').trim().length > 40, 'mytest.cjs is empty');\n  const r = require('child_process').spawnSync(process.execPath, [t], { cwd: here, encoding: 'utf8' });\n  assert.strictEqual(r.status, 0, 'mytest.cjs failed: ' + (r.stderr || r.stdout).slice(0, 300));\n});",
 solve: {'solution.cjs': "const items = [];\nlet next = 1;\n\nfunction add(title) {\n  const item = { id: next++, title, done: false };\n  items.push(item);\n  return item;\n}\n\nfunction done(id) {\n  const item = items.find(i => i.id === id);\n  if (item) item.done = true;\n}\n\nfunction list() {\n  return items;\n}\n\nfunction remaining() {\n  return items.filter(i => !i.done).length;\n}\n\nmodule.exports = { add, done, list, remaining };\n",
          'mytest.cjs': "const assert = require('assert');\nconst todo = require('./solution.cjs');\n\nconst a = todo.add('milk');\ntodo.add('bread');\ntodo.done(a.id);\nassert.strictEqual(todo.remaining(), 1);\nconsole.log('my test passed');\n"}},

{id: 'door-4', door: 4, kind: 'check', title: 'Part 4 door test',
 ask: 'From a blank file, build a bank account in solution.cjs. Export createAccount(), which gives back an object with deposit(amount), withdraw(amount), balance() and history(). Amounts must be more than 0, or throw new Error("Bad amount"). Taking out more than is there throws new Error("Not enough money"). history() gives back a list like [{ type: "deposit", amount: 10 }]. Two accounts never share money.',
 files: {'solution.cjs': ''},
 test: "const s = load('solution.cjs');\ncheck('deposit and withdraw', () => { const a = s.createAccount(); a.deposit(50); a.withdraw(20); assert.strictEqual(a.balance(), 30); });\ncheck('history', () => { const a = s.createAccount(); a.deposit(10); a.withdraw(4); assert.deepStrictEqual(a.history(), [{ type: 'deposit', amount: 10 }, { type: 'withdraw', amount: 4 }]); });\ncheck('not enough money', () => { const a = s.createAccount(); a.deposit(5); assert.throws(() => a.withdraw(6), /Not enough money/); assert.strictEqual(a.balance(), 5); });\ncheck('bad amounts', () => { const a = s.createAccount(); assert.throws(() => a.deposit(0), /Bad amount/); assert.throws(() => a.deposit(-3), /Bad amount/); });\ncheck('two accounts are separate', () => { const a = s.createAccount(), b = s.createAccount(); a.deposit(9); assert.strictEqual(b.balance(), 0); });",
 solve: {'solution.cjs': "function createAccount() {\n  let money = 0;\n  const log = [];\n  function check(amount) {\n    if (!(amount > 0)) throw new Error('Bad amount');\n  }\n  return {\n    deposit(amount) { check(amount); money += amount; log.push({ type: 'deposit', amount }); },\n    withdraw(amount) {\n      check(amount);\n      if (amount > money) throw new Error('Not enough money');\n      money -= amount;\n      log.push({ type: 'withdraw', amount });\n    },\n    balance() { return money; },\n    history() { return log.slice(); }\n  };\n}\n\nmodule.exports = { createAccount };\n"}},

/* ================================================================ 5 Debugger */
{id: 'debug-error', skill: 'debug-error', kind: 'check', title: 'Read the error',
 ask: 'Run  node broken.cjs  in a terminal in this folder. It stops with an error. Read the error: which line of broken.cjs does it break on? Write only that line number into answer.txt. Then fix the bug so broken.cjs prints the total.',
 files: {'broken.cjs': "const orders = [\n  { item: 'Tea', price: 2 },\n  { item: 'Cake', price: 5 }\n];\n\nlet total = 0;\nfor (const order of orders) {\n  total += order.price;\n}\n\nconsole.log('Total: ' + totl);\n"},
 test: "check('answer.txt has the right line', () => {\n  const f = path.join(here, 'answer.txt');\n  assert.ok(fs.existsSync(f), 'there is no answer.txt yet');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), '11', 'that is not the line the error points at');\n});\ncheck('broken.cjs runs now', () => {\n  const r = require('child_process').spawnSync(process.execPath, [path.join(here, 'broken.cjs')], { encoding: 'utf8' });\n  assert.strictEqual(r.status, 0, 'it still breaks: ' + r.stderr.split('\\n').slice(0, 5).join(' '));\n  assert.ok(/Total: 7/.test(r.stdout), 'it should print Total: 7');\n});",
 solve: {'answer.txt': '11\n', 'broken.cjs': "const orders = [\n  { item: 'Tea', price: 2 },\n  { item: 'Cake', price: 5 }\n];\n\nlet total = 0;\nfor (const order of orders) {\n  total += order.price;\n}\n\nconsole.log('Total: ' + total);\n"}},

{id: 'debug-off-by-one', skill: 'debug-off-by-one', kind: 'check', title: 'One too many',
 ask: 'lastN(list, n) in solution.cjs should give back the last n things in the list. It is wrong by one. Find the bug and fix it.',
 files: {'solution.cjs': "function lastN(list, n) {\n  const out = [];\n  for (let i = list.length - n - 1; i < list.length; i++) {\n    out.push(list[i]);\n  }\n  return out;\n}\n\nmodule.exports = { lastN };\n"},
 test: "const { lastN } = load('solution.cjs');\ncheck('last 2 of 1..5', () => assert.deepStrictEqual(lastN([1, 2, 3, 4, 5], 2), [4, 5]));\ncheck('last 1', () => assert.deepStrictEqual(lastN(['a', 'b'], 1), ['b']));",
 solve: {'solution.cjs': "function lastN(list, n) {\n  const out = [];\n  for (let i = list.length - n; i < list.length; i++) {\n    out.push(list[i]);\n  }\n  return out;\n}\n\nmodule.exports = { lastN };\n"}},

{id: 'debug-condition', skill: 'debug-condition', kind: 'check', title: 'The wrong condition',
 ask: 'canBook(slotsLeft, isMember) in solution.cjs should say yes when there is at least one slot left, OR when the person is a member (members can always book). It says no to people it should let in. Fix the condition.',
 files: {'solution.cjs': "function canBook(slotsLeft, isMember) {\n  return slotsLeft > 0 && isMember;\n}\n\nmodule.exports = { canBook };\n"},
 test: "const { canBook } = load('solution.cjs');\ncheck('slots left, not a member', () => assert.strictEqual(canBook(3, false), true));\ncheck('no slots, member', () => assert.strictEqual(canBook(0, true), true));\ncheck('no slots, not a member', () => assert.strictEqual(canBook(0, false), false));",
 solve: {'solution.cjs': "function canBook(slotsLeft, isMember) {\n  return slotsLeft > 0 || isMember;\n}\n\nmodule.exports = { canBook };\n"}},

{id: 'debug-async', skill: 'debug-async', kind: 'check', title: 'The missing wait',
 ask: 'loadAll(ids) in solution.cjs should give back every price. It gives back an empty list, because it does not wait. Fix it.',
 files: {'solution.cjs': "const PRICES = { a: 2, b: 5, c: 3 };\nconst fetchPrice = id => new Promise(done => setTimeout(() => done(PRICES[id]), 20));\n\nasync function loadAll(ids) {\n  const out = [];\n  ids.forEach(async id => {\n    out.push(await fetchPrice(id));\n  });\n  return out;\n}\n\nmodule.exports = { loadAll };\n"},
 test: "const { loadAll } = load('solution.cjs');\nawait check('every price, in order', async () => assert.deepStrictEqual(await loadAll(['a', 'b', 'c']), [2, 5, 3]));",
 solve: {'solution.cjs': "const PRICES = { a: 2, b: 5, c: 3 };\nconst fetchPrice = id => new Promise(done => setTimeout(() => done(PRICES[id]), 20));\n\nasync function loadAll(ids) {\n  const out = [];\n  for (const id of ids) {\n    out.push(await fetchPrice(id));\n  }\n  return out;\n}\n\nmodule.exports = { loadAll };\n"}},

{id: 'debug-state', skill: 'debug-state', kind: 'check', title: 'It changed my cart',
 ask: 'withTax(cart) in solution.cjs gives back the cart with 10% tax on each price. The answer is right, but it also changes the cart it was given, so the prices are wrong everywhere else. Fix it so the original cart is left alone.',
 files: {'solution.cjs': "function withTax(cart) {\n  for (const item of cart) {\n    item.price = Math.round(item.price * 110) / 100;\n  }\n  return cart;\n}\n\nmodule.exports = { withTax };\n"},
 test: "const { withTax } = load('solution.cjs');\ncheck('tax is added', () => assert.deepStrictEqual(withTax([{ name: 'Tea', price: 2 }]), [{ name: 'Tea', price: 2.2 }]));\ncheck('the original cart is untouched', () => { const cart = [{ name: 'Tea', price: 2 }]; withTax(cart); assert.deepStrictEqual(cart, [{ name: 'Tea', price: 2 }]); });",
 solve: {'solution.cjs': "function withTax(cart) {\n  return cart.map(item => ({ ...item, price: Math.round(item.price * 110) / 100 }));\n}\n\nmodule.exports = { withTax };\n"}},

{id: 'door-5', door: 5, kind: 'check', title: 'Part 5 door test',
 ask: 'solution.cjs has three bugs. average(list) should give back the average and 0 for an empty list. topScorer(players) should give back the name with the highest score without changing the list. inRange(n) should say whether n is from 1 to 10, both included. Find and fix all three.',
 files: {'solution.cjs': "function average(list) {\n  let sum = 0;\n  for (let i = 0; i <= list.length; i++) sum += list[i];\n  return sum / list.length;\n}\n\nfunction topScorer(players) {\n  players.sort((a, b) => b.score - a.score);\n  return players[0].name;\n}\n\nfunction inRange(n) {\n  return n > 1 && n < 10;\n}\n\nmodule.exports = { average, topScorer, inRange };\n"},
 test: "const s = load('solution.cjs');\ncheck('average', () => { assert.strictEqual(s.average([2, 4, 6]), 4); assert.strictEqual(s.average([]), 0); });\ncheck('topScorer leaves the list alone', () => { const p = [{ name: 'A', score: 1 }, { name: 'B', score: 9 }]; assert.strictEqual(s.topScorer(p), 'B'); assert.strictEqual(p[0].name, 'A'); });\ncheck('inRange includes 1 and 10', () => { assert.ok(s.inRange(1) && s.inRange(10) && s.inRange(5)); assert.ok(!s.inRange(0) && !s.inRange(11)); });",
 solve: {'solution.cjs': "function average(list) {\n  if (!list.length) return 0;\n  let sum = 0;\n  for (let i = 0; i < list.length; i++) sum += list[i];\n  return sum / list.length;\n}\n\nfunction topScorer(players) {\n  const sorted = [...players].sort((a, b) => b.score - a.score);\n  return sorted[0].name;\n}\n\nfunction inRange(n) {\n  return n >= 1 && n <= 10;\n}\n\nmodule.exports = { average, topScorer, inRange };\n"}},

/* ================================================================ 6 Designer */
{id: 'design-data', skill: 'design-data', kind: 'check', title: 'The shape of a booking',
 ask: 'Before any code, decide what a booking looks like. In booking.json write one example booking with: id (text), when (a date and time like "2026-09-18T14:00:00Z"), person { name, email }, service { name, price } where price is a number, and status, which is one of "held", "paid" or "cancelled". Then, in why.md, say in two lines why price is a number and status is a fixed list of words.',
 files: {'booking.json': '{\n}\n', 'why.md': ''},
 test: "check('booking.json has the right shape', () => {\n  const b = JSON.parse(fs.readFileSync(path.join(here, 'booking.json'), 'utf8'));\n  assert.strictEqual(typeof b.id, 'string', 'id should be text');\n  assert.ok(!isNaN(Date.parse(b.when)) && /T\\d\\d:\\d\\d/.test(b.when), 'when should be a date and time');\n  assert.ok(b.person && typeof b.person.name === 'string' && /@/.test(b.person.email || ''), 'person needs a name and an email');\n  assert.ok(b.service && typeof b.service.name === 'string' && typeof b.service.price === 'number', 'service needs a name and a number price');\n  assert.ok(['held', 'paid', 'cancelled'].includes(b.status), 'status must be held, paid or cancelled');\n});\ncheck('why.md explains it', () => assert.ok(fs.readFileSync(path.join(here, 'why.md'), 'utf8').trim().length > 40, 'say why in why.md'));",
 solve: {'booking.json': '{\n  "id": "bk_1",\n  "when": "2026-09-18T14:00:00Z",\n  "person": { "name": "Ada", "email": "ada@example.com" },\n  "service": { "name": "Haircut", "price": 30 },\n  "status": "held"\n}\n', 'why.md': 'Price is a number so it can be added up and compared; text like "$30" cannot.\nStatus is a fixed list so every part of the app agrees on what a booking can be, and a typo cannot invent a new state.\n'}},

{id: 'design-api', skill: 'design-api', kind: 'explain', title: 'Plan the functions',
 ask: 'A small library app lets people borrow and return books. Without writing code, list the functions it needs. For each: its name, what it takes, what it gives back, and what can go wrong.',
 model: 'addBook(title, author) gives back the new book; fails on an empty title. borrow(bookId, memberId) gives back the loan with a due date; fails if the book is out or the member has too many. giveBack(bookId) closes the loan and says if it is late; fails if it was never borrowed. booksOut(memberId) gives back their list. overdue() gives back every late loan.'},

{id: 'design-modules', skill: 'design-modules', kind: 'explain', title: 'Which file does which job',
 ask: 'Read everything.js. It is one file doing four jobs. Say which files you would split it into, what each file is called, what its one job is, and which file uses which.',
 files: {'everything.js': "// reads the form, checks it, saves it, and emails\nfunction onSubmit(form) {\n  const email = form.email.trim();\n  if (!/@/.test(email)) return show('Bad email');\n  if (form.name.length < 2) return show('Name too short');\n  const row = { email, name: form.name, at: Date.now() };\n  const all = JSON.parse(localStorage.getItem('people') || '[]');\n  all.push(row);\n  localStorage.setItem('people', JSON.stringify(all));\n  fetch('/api/mail', { method: 'POST', body: JSON.stringify({ to: email, text: 'Welcome ' + form.name }) });\n  show('Thanks!');\n}\nfunction show(text) { document.getElementById('msg').textContent = text; }\n"},
 model: 'validate.js checks the form and gives back what is wrong. storage.js saves and reads people and is the only file that touches localStorage. mail.js sends the welcome and is the only one that knows the /api/mail address. form.js reads the form, calls validate, then storage, then mail, and shows the message. Only form.js uses the other three; none of them use each other.'},

{id: 'design-plan', skill: 'design-plan', kind: 'explain', title: 'A plan before the code',
 ask: 'Plan a "forgot my password" feature before any code: the steps the person goes through, the data you need to keep, and at least three things that could go wrong or be attacked, with what you would do about each.',
 model: 'Steps: they type their email; we always say "if it exists, we sent a link"; the email has a link with a long random one-time token; the link opens a page to set a new password; the token is used up. Data: a hash of the token, which user, when it expires (say 30 minutes), used or not. Risks: finding out which emails have accounts (always give the same answer); guessing tokens (long random, stored hashed, short expiry, rate limit); the link reused or leaked (one use, and every session signed out after a reset).'},

{id: 'design-tradeoff', skill: 'design-tradeoff', kind: 'explain', title: 'Two ways, pick one',
 ask: 'A small online shop can keep the cart in the browser, or on the server. Pick one for a shop with no accounts, say why, and say plainly what you give up.',
 model: 'The browser. With no accounts there is nobody to save a server cart for, it costs nothing, and it works offline and fast. What I give up: the cart does not follow them from phone to laptop, it is lost if they clear their browser, and prices in it can be stale, so the server must check every price again at checkout and never trust the browser total.'},

{id: 'door-6', door: 6, kind: 'explain', title: 'Part 6 door test',
 ask: 'Design an appointment reminder app before any code. Give: the data (every kind of record and its fields), the functions (name, what goes in, what comes out), the files (each with one job), the order things happen in, and one choice you made between two ways with what you gave up.',
 model: 'A good answer names Client, Appointment and Reminder with their fields and a status list; functions such as book, cancel, dueReminders(now) and send(reminder); files split into data, scheduling, sending and the screen, with only the screen touching the page; the flow from booking to the reminder being sent and marked; and one honest trade off, such as checking every minute instead of scheduling exact timers, giving up a minute of precision for something that survives a restart.'},

/* ================================================================ 7 Elite */
{id: 'elite-review', skill: 'elite-review', kind: 'explain', title: 'Review the AI',
 ask: 'An AI wrote ai.js. It runs. Find at least three real problems with it, say why each one matters, and what you would ask for instead.',
 files: {'ai.js': "let users = [];\n\nfunction addUser(name, password, age) {\n  users.push({ name: name, password: password, age: age });\n  console.log('Added ' + name + ' with password ' + password);\n  return true;\n}\n\nfunction findUser(name) {\n  for (var i = 0; i < users.length; i++) {\n    if (users[i].name == name) return users[i];\n  }\n}\n\nfunction isAdult(user) {\n  if (user.age > 18) return true;\n  else return false;\n}\n"},
 model: 'The password is stored as plain text and printed to the log, so anyone who sees the log or the data has every password: hash it and never log it. addUser checks nothing, so two users can share a name and an empty name is fine: validate and reject duplicates. isAdult says 18 is not an adult because it uses > instead of >=. findUser gives back nothing at all when there is no match and uses ==; give back null and use ===. users is a global list, so it is lost on restart.'},

{id: 'elite-reject', skill: 'elite-reject', kind: 'explain', title: 'Say no, and why',
 ask: 'Read change.js. It works, and the tests pass. Write the review that rejects it: what is wrong, why it matters later even though it works today, and exactly what would make you accept it.',
 files: {'change.js': "function priceForUS(item) { return item.base * 1.07 + 5; }\nfunction priceForUK(item) { return item.base * 1.2 + 4; }\nfunction priceForDE(item) { return item.base * 1.19 + 4; }\nfunction priceForFR(item) { return item.base * 1.2 + 4; }\n\nfunction price(item, country) {\n  if (country == 'US') return priceForUS(item);\n  if (country == 'UK') return priceForUK(item);\n  if (country == 'DE') return priceForDE(item);\n  if (country == 'FR') return priceForFR(item);\n}\n"},
 model: 'Rejected. The same sum is copied four times with different numbers, so the next country is a fifth copy and a change to how shipping works has to be made in four places. An unknown country gives back nothing, and the checkout will show "undefined" or charge nothing. I would accept one table of countries with their tax and shipping, one price function that reads it, and a clear error for a country that is not in the table.'},

{id: 'elite-security', skill: 'elite-security', kind: 'check', title: 'Close the hole',
 ask: 'findUser(name) in solution.cjs builds its database query by gluing the name into the text. Someone can type  x\' OR \'1\'=\'1  and read every user. Fix it: give back { sql, params } where sql uses a ? where the name goes, and params is [name]. The name must never be inside sql.',
 files: {'solution.cjs': "function findUser(name) {\n  return { sql: \"SELECT * FROM users WHERE name = '\" + name + \"'\", params: [] };\n}\n\nmodule.exports = { findUser };\n"},
 test: "const { findUser } = load('solution.cjs');\nconst evil = \"x' OR '1'='1\";\ncheck('the name is never in the query text', () => { const q = findUser(evil); assert.ok(!q.sql.includes(evil) && !q.sql.includes(\"'1'='1\"), 'the name is still glued into sql'); });\ncheck('a ? and the name in params', () => { const q = findUser('ada'); assert.ok(/name\\s*=\\s*\\?/.test(q.sql), 'use name = ?'); assert.deepStrictEqual(q.params, ['ada']); });",
 solve: {'solution.cjs': "function findUser(name) {\n  return { sql: 'SELECT * FROM users WHERE name = ?', params: [name] };\n}\n\nmodule.exports = { findUser };\n"}},

{id: 'elite-speed', skill: 'elite-speed', kind: 'check', title: 'Make it fast',
 ask: 'hasDuplicates(list) in solution.cjs is right but slow: it compares every item with every other one. With 30,000 items it takes seconds. Make it give the same answers in a fraction of the time.',
 files: {'solution.cjs': "function hasDuplicates(list) {\n  for (let i = 0; i < list.length; i++) {\n    for (let j = i + 1; j < list.length; j++) {\n      if (list[i] === list[j]) return true;\n    }\n  }\n  return false;\n}\n\nmodule.exports = { hasDuplicates };\n"},
 test: "const { hasDuplicates } = load('solution.cjs');\ncheck('right answers', () => { assert.strictEqual(hasDuplicates([1, 2, 3, 2]), true); assert.strictEqual(hasDuplicates([1, 2, 3]), false); assert.strictEqual(hasDuplicates([]), false); });\ncheck('30,000 items in under 50 ms', () => { const big = Array.from({ length: 30000 }, (_, i) => i); const t = Date.now(); assert.strictEqual(hasDuplicates(big), false); const ms = Date.now() - t; assert.ok(ms < 50, 'it took ' + ms + ' ms'); });",
 solve: {'solution.cjs': "function hasDuplicates(list) {\n  const seen = new Set();\n  for (const item of list) {\n    if (seen.has(item)) return true;\n    seen.add(item);\n  }\n  return false;\n}\n\nmodule.exports = { hasDuplicates };\n"}},

{id: 'elite-system', skill: 'elite-system', kind: 'explain', title: 'Explain your own system',
 ask: 'Explain the project you are building with OPE, as if to a new engineer on their first day: every main part and its job, what happens from the moment a person does the main thing until they see the result, where the data lives, and the one part you would rewrite first and why. Send it from that project, so your AI coder checks it against the real code.',
 model: 'A good answer names the real folders and files, follows one real request through them in order, says where data is stored and who can read it, and picks a weak part with a reason the code actually supports.'},

{id: 'door-7', door: 7, kind: 'explain', title: 'Part 7 door test',
 ask: 'pr.diff is a change an AI wants to merge. Review it like a senior engineer: every problem you find (security, correctness, speed, design), how serious each one is, and your decision, merge or reject, with what must change first.',
 files: {'pr.diff': "+ // add search to the shop\n+ app.get('/search', async (req, res) => {\n+   const q = req.query.q;\n+   const rows = await db.query(\"SELECT * FROM products WHERE name LIKE '%\" + q + \"%'\");\n+   const out = [];\n+   for (const r of rows) {\n+     for (const r2 of rows) {\n+       if (r.id === r2.id && !out.includes(r)) out.push(r);\n+     }\n+   }\n+   res.send('<h1>Results for ' + q + '</h1>' + out.map(r => '<p>' + r.name + ' $' + r.cost + '</p>').join(''));\n+ });\n"},
 model: 'Reject. Serious: the search text is glued into SQL (injection, anyone can read or delete the database) and into the HTML (cross site scripting). It selects every column, including anything private, with no limit. The double loop plus includes is slow for no reason and does nothing a plain list would not. It shows r.cost, which is probably the shop\'s cost, not the price. Needs: a parameter for the query, escaped output, chosen columns, a limit, and the loop removed.'}
];

/* the test file OPE writes: the task's own checks inside a small harness that
   prints PASS or FAIL for each one and exits 1 if any failed */
window.OPEBank.testFile = function(body){
  return [
    '// Written by OPE. Run it with: node test.cjs',
    "const assert = require('assert'), fs = require('fs'), path = require('path');",
    'const here = __dirname;',
    "let root = process.cwd();",
    "try { root = require('child_process').execSync('git rev-parse --show-toplevel', { cwd: here, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || root; } catch (e) {}",
    "const sh = cmd => require('child_process').execSync(cmd, { cwd: root, encoding: 'utf8' });",
    'function load(f){ const p = path.join(here, f); delete require.cache[require.resolve(p)]; return require(p); }',
    'let failed = 0;',
    "async function check(name, fn){ try { await fn(); console.log('PASS ' + name); } catch (e) { failed++; console.log('FAIL ' + name + ': ' + (e && e.message || e)); } }",
    '(async () => {',
    'try {',
    body,
    "} catch (e) { failed++; console.log('FAIL it did not run: ' + (e && e.message || e)); }",
    '})().then(() => process.exit(failed ? 1 : 0));',
    ''
  ].join('\n');
};
