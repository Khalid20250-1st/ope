/* Part 0 Computer and Part 1 Reader: the milestones added for the 96 milestone course */
window.OPEBank.push(

/* ================================================================ 0 Computer */
{id: 'rename-move', skill: 'rename-move', kind: 'check', title: 'Rename a file and move one',
 ask: 'Do this by hand in Finder (or Explorer on Windows), not with code.\n1. Rename draft.txt to final.txt. In Finder, click it once, press Return, type the new name.\n2. Make a new folder here called archive.\n3. Move keep.txt out of the old folder and into archive by dragging it.\nWhen you are done there is a final.txt here and an archive/keep.txt.',
 files: {'draft.txt': 'The finished plan.\n', 'old/keep.txt': 'Keep this one safe.\n'},
 test: "check('draft.txt is now final.txt', () => {\n  const f = path.join(here, 'final.txt');\n  assert.ok(fs.existsSync(f), 'there is no final.txt yet');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), 'The finished plan.', 'final.txt does not have the words draft.txt had, so it is not the same file');\n});\ncheck('keep.txt is inside archive', () => {\n  const f = path.join(here, 'archive', 'keep.txt');\n  assert.ok(fs.existsSync(f), 'there is no archive/keep.txt yet');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), 'Keep this one safe.', 'archive/keep.txt does not have the words keep.txt had');\n});",
 solve: {'final.txt': 'The finished plan.\n', 'archive/keep.txt': 'Keep this one safe.\n'}},

{id: 'file-types', skill: 'file-types', kind: 'check', title: 'What the end of a file name means',
 ask: 'The letters after the dot in a file name tell programs what is inside.\n  .txt   plain words, nothing special\n  .js    JavaScript, code a computer can run\n  .json  data written in a strict shape, like {"name": "Ada"}\n  .md    Markdown, notes where a line starting with # is a heading\n  .html  a web page\n  .css   how a web page looks: colors, sizes, spacing\nMake three files here in a plain text editor (TextEdit set to plain text, or VS Code):\n1. hello.js with one line of JavaScript, for example  console.log("hi");\n2. data.json holding an object with a "name" key, for example  {"name": "Ada"}\n3. notes.md whose first line is a heading, for example  # My notes',
 test: "check('hello.js runs without an error', () => {\n  const f = path.join(here, 'hello.js');\n  assert.ok(fs.existsSync(f), 'there is no hello.js yet');\n  assert.ok(fs.readFileSync(f, 'utf8').trim(), 'hello.js is empty');\n  const r = require('child_process').spawnSync(process.execPath, [f], { encoding: 'utf8', timeout: 10000 });\n  assert.strictEqual(r.status, 0, 'hello.js stopped with an error: ' + (r.stderr || '').split('\\n').slice(0, 5).join(' '));\n});\ncheck('data.json is real JSON with a name', () => {\n  const f = path.join(here, 'data.json');\n  assert.ok(fs.existsSync(f), 'there is no data.json yet');\n  let d;\n  try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { throw new Error('data.json is not valid JSON: ' + e.message); }\n  assert.ok(d && typeof d === 'object' && 'name' in d, 'data.json has no \"name\" key');\n});\ncheck('notes.md starts with a heading', () => {\n  const f = path.join(here, 'notes.md');\n  assert.ok(fs.existsSync(f), 'there is no notes.md yet');\n  const first = fs.readFileSync(f, 'utf8').split('\\n').find(l => l.trim()) || '';\n  assert.ok(/^#/.test(first.trim()), 'the first line of notes.md does not start with #');\n});",
 solve: {'hello.js': 'console.log("hi");\n', 'data.json': '{"name": "Ada"}\n', 'notes.md': '# My notes\n\nFile names end in what they hold.\n'}},

{id: 'terminal-navigate', skill: 'terminal-navigate', kind: 'check', title: 'Walk into a folder',
 ask: 'In the terminal you are always standing in one folder. pwd prints which one (on Windows, cd on its own does it). cd moves you: cd a goes into a, cd .. goes back up one.\nOpen a terminal in this practice folder. There are folders a, then b inside it, then c inside that. Type  cd a/b/c  and press Return, then type  pwd > here.txt  (Windows:  cd > here.txt ). That saves where you are standing into here.txt, inside c.',
 files: {'a/b/c/readme.txt': 'You made it to c.\n'},
 test: "check('a/b/c/here.txt says you stood in c', () => {\n  const c = path.join(here, 'a', 'b', 'c');\n  const f = path.join(c, 'here.txt');\n  assert.ok(fs.existsSync(f), 'there is no here.txt inside a/b/c yet');\n  const said = fs.readFileSync(f, 'utf8').trim().replace(/[\\\\/]+$/, '');\n  assert.ok(said && fs.existsSync(said), 'here.txt does not hold a folder path');\n  assert.strictEqual(fs.realpathSync(said), fs.realpathSync(c), 'here.txt holds a different folder, not a/b/c');\n});",
 solve: function(c){ var o = {}; o['a/b/c/here.txt'] = c.here + '/a/b/c\n'; return o; }},

{id: 'terminal-files', skill: 'terminal-files', kind: 'check', title: 'Build a folder by command',
 ask: 'Use only the terminal for this, no Finder. Open a terminal in this practice folder, then:\n  mkdir site                          makes a folder\n  mkdir site/css                      makes a folder inside it\n  echo "<h1>Hi</h1>" > site/index.html   makes a file with words in it\n  cp style.css site/css/style.css     copies a file\n  mv old.html site/about.html         moves a file and renames it on the way\nOn Windows use  copy  and  move  in place of cp and mv, and backslashes in the paths.',
 files: {'style.css': 'body { color: navy; }\n', 'old.html': '<p>About us</p>\n'},
 test: "const s = path.join(here, 'site');\ncheck('site/index.html has something in it', () => {\n  const f = path.join(s, 'index.html');\n  assert.ok(fs.existsSync(f), 'there is no site/index.html yet');\n  assert.ok(fs.readFileSync(f, 'utf8').trim(), 'site/index.html is empty');\n});\ncheck('site/css/style.css is a copy of style.css', () => {\n  const f = path.join(s, 'css', 'style.css');\n  assert.ok(fs.existsSync(f), 'there is no site/css/style.css yet');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), 'body { color: navy; }', 'site/css/style.css is not the same as style.css');\n});\ncheck('old.html is now site/about.html', () => {\n  const f = path.join(s, 'about.html');\n  assert.ok(fs.existsSync(f), 'there is no site/about.html yet');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), '<p>About us</p>', 'site/about.html does not have the words old.html had');\n});",
 solve: {'site/index.html': '<h1>Hi</h1>\n', 'site/css/style.css': 'body { color: navy; }\n', 'site/about.html': '<p>About us</p>\n'}},

{id: 'run-a-program', skill: 'run-a-program', kind: 'check', title: 'Run a program',
 ask: 'A program is a file the computer follows line by line. node is the program that runs JavaScript files. Open a terminal in this practice folder and type  node hello.cjs  and press Return to see what it prints. Then type  node hello.cjs > out.txt  so what it prints is saved into out.txt instead.',
 files: {'hello.cjs': "const name = 'OPE';\nconsole.log('Hello from ' + name + ', ' + (6 * 7) + ' is the answer.');\n"},
 test: "check('out.txt holds what hello.cjs prints', () => {\n  const f = path.join(here, 'out.txt');\n  assert.ok(fs.existsSync(f), 'there is no out.txt yet');\n  const r = require('child_process').spawnSync(process.execPath, [path.join(here, 'hello.cjs')], { encoding: 'utf8', timeout: 10000 });\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim(), (r.stdout || '').trim(), 'out.txt is not what hello.cjs prints');\n});",
 solve: {'out.txt': 'Hello from OPE, 42 is the answer.\n'}},

{id: 'git-diff', skill: 'git-diff', kind: 'check', title: 'See what changed',
 ask: 'note.txt is already saved in a checkpoint. Open it and change one of its lines to anything else, then save the file. Now, in the terminal in your OPE Course folder, type  git diff  and press Return. It shows what changed since the last checkpoint: a line starting with - was taken away, a line starting with + was put in. Write the line git shows as taken away, without the - at the start, into answer.txt here. Do not save a checkpoint.',
 files: {'note.txt': 'Buy bread.\nCall the bank.\nWater the plants.\n'},
 test: "const rel = path.relative(root, path.join(here, 'note.txt')).split(path.sep).join('/');\nconst saved = sh('git show \"HEAD:' + rel + '\"').split('\\n').map(l => l.trim()).filter(Boolean);\nconst now = fs.readFileSync(path.join(here, 'note.txt'), 'utf8').split('\\n').map(l => l.trim()).filter(Boolean);\ncheck('note.txt has changed since the checkpoint', () => {\n  assert.notDeepStrictEqual(now, saved, 'note.txt is still the same as the checkpoint, change one line');\n});\ncheck('answer.txt holds the line that was taken away', () => {\n  const f = path.join(here, 'answer.txt');\n  assert.ok(fs.existsSync(f), 'there is no answer.txt yet');\n  const said = fs.readFileSync(f, 'utf8').trim().replace(/^-\\s*/, '');\n  assert.ok(saved.includes(said), 'that line was never in the saved note.txt');\n  assert.ok(!now.includes(said), 'that line is still in note.txt, so it was not taken away');\n});",
 solve: {'note.txt': 'Buy bread.\nCall my mom.\nWater the plants.\n', 'answer.txt': 'Call the bank.\n'}},

{id: 'git-undo', skill: 'git-undo', kind: 'check', title: 'Go back to the last checkpoint',
 ask: 'recipe.txt is saved in a checkpoint. Ruin it on purpose: open it, delete every word, and save. Now bring it back. In the terminal in this practice folder type  git restore recipe.txt  (older git:  git checkout -- recipe.txt ). Open it again and the words are back, just as they were at the last checkpoint. Last, make a file done.txt here with the word done in it.',
 files: {'recipe.txt': 'Pancakes\n2 eggs\n1 cup of flour\n1 cup of milk\nMix, then fry.\n'},
 test: "const rel = path.relative(root, path.join(here, 'recipe.txt')).split(path.sep).join('/');\ncheck('recipe.txt is back as it was at the checkpoint', () => {\n  const f = path.join(here, 'recipe.txt');\n  assert.ok(fs.existsSync(f), 'there is no recipe.txt, bring it back with git restore recipe.txt');\n  const saved = sh('git show \"HEAD:' + rel + '\"').replace(/\\r/g, '');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').replace(/\\r/g, ''), saved, 'recipe.txt is not the same as the checkpoint yet');\n});\ncheck('done.txt says done', () => {\n  const f = path.join(here, 'done.txt');\n  assert.ok(fs.existsSync(f), 'there is no done.txt yet');\n  assert.strictEqual(fs.readFileSync(f, 'utf8').trim().toLowerCase(), 'done', 'done.txt should hold just the word done');\n});",
 solve: {'recipe.txt': 'Pancakes\n2 eggs\n1 cup of flour\n1 cup of milk\nMix, then fry.\n', 'done.txt': 'done\n'}},

/* ================================================================ 1 Reader */
{id: 'read-strings', skill: 'read-strings', kind: 'explain', title: 'Join, shout, cut, count',
 ask: 'Read sample.js. What are full, loud and short, and what number is full.length? Say how you got each one.',
 files: {'sample.js': "const first = 'ada';\nconst last = 'Lovelace';\nconst full = first + ' ' + last;\nconst loud = full.toUpperCase();\nconst short = full.slice(0, 3);\nconsole.log(full.length);\n"},
 model: 'A string is a piece of text. + glues texts together, and the \' \' in the middle adds a space, so full is "ada Lovelace". toUpperCase gives a copy in capitals, so loud is "ADA LOVELACE". slice(0, 3) cuts out the letters from position 0 up to, but not including, position 3, so short is "ada". length counts every character, the space too: 3 plus 1 plus 8, so 12.'},

{id: 'read-math', skill: 'read-math', kind: 'explain', title: 'Boxes, sums and rounding',
 ask: 'Read sample.js. What are leftOver, total and average when it has run? Explain each.',
 files: {'sample.js': "const cookies = 14;\nconst perBox = 4;\nconst leftOver = cookies % perBox;\nconst total = 2 + 3 * 4;\nconst average = Math.round((7 + 8) / 2);\n"},
 model: '% gives what is left over after dividing. 14 cookies make 3 full boxes of 4, which is 12, and 2 are left, so leftOver is 2. Times is done before plus, like in school, so total is 3 times 4, which is 12, plus 2, which is 14. For average, the brackets go first: 7 plus 8 is 15, divided by 2 is 7.5, and Math.round rounds a half up, so average is 8.'},

{id: 'read-logic', skill: 'read-logic', kind: 'explain', title: 'Can they book',
 ask: 'Read sample.js. && means and, || means or, ! means not. What do the three canBook lines at the bottom give back, true or false? Say why for each.',
 files: {'sample.js': "function canBook(signedIn, slotsLeft, isOwner, banned) {\n  return signedIn && (slotsLeft > 0 || isOwner) && !banned;\n}\n\ncanBook(true, 0, false, false);\ncanBook(true, 0, true, false);\ncanBook(true, 5, false, true);\n"},
 model: 'All three parts must be true. First line: signed in, but there are 0 slots and they are not the owner, so the bracket is false and the answer is false. Second line: 0 slots, but they are the owner, so the bracket is true; they are not banned, so !banned is true; the answer is true. Third line: signed in and 5 slots, but banned is true, so !banned is false and the answer is false.'},

{id: 'read-arrays', skill: 'read-arrays', kind: 'explain', title: 'Who is in the queue',
 ask: 'Read sample.js. What does the last line print? Say what queue holds after push, and how first and last are found.',
 files: {'sample.js': "const queue = ['Sam', 'Lee'];\nqueue.push('Ana');\nconst first = queue[0];\nconst last = queue[queue.length - 1];\nconsole.log(queue.length, first, last);\n"},
 model: 'An array is a list. push adds to the end, so queue is Sam, Lee, Ana. Counting in a list starts at 0, so queue[0] is Sam. length is 3, and because counting starts at 0 the last item sits at 3 minus 1, which is 2, so last is Ana. It prints 3 Sam Ana.'},

{id: 'read-objects', skill: 'read-objects', kind: 'explain', title: 'A shop and its address',
 ask: 'Read sample.js. What does it print, and what is shop.address.zip at the end?',
 files: {'sample.js': "const shop = {\n  name: 'Blue Door',\n  open: true,\n  address: { city: 'Denver', zip: '80202' }\n};\n\nshop.address.city = 'Boulder';\nshop.open = false;\nconsole.log(shop.name + ' in ' + shop.address.city + ', open: ' + shop.open);\n"},
 model: 'An object is one thing with named parts. address is an object inside it, and the dots walk in: shop.address.city means the city part of the address part of shop. The two lines in the middle change city to Boulder and open to false. So it prints "Blue Door in Boulder, open: false". Nothing changed zip, so it is still "80202".'},

{id: 'read-return', skill: 'read-return', kind: 'explain', title: 'Printing is not giving back',
 ask: 'Read sample.js. What does it print, in order? What do x and y hold, and why are they different?',
 files: {'sample.js': "function addAndPrint(a, b) {\n  console.log(a + b);\n}\n\nfunction addAndReturn(a, b) {\n  return a + b;\n}\n\nconst x = addAndPrint(2, 3);\nconst y = addAndReturn(2, 3);\nconsole.log(x, y);\n"},
 model: 'addAndPrint shows 5 on the screen but gives nothing back, so the first line printed is 5 and x is undefined, which means empty, no value. addAndReturn prints nothing but hands 5 back, so y is 5. The last line prints "undefined 5". Printing is only for people to see; return is how a function hands a value to the rest of the code.'},

{id: 'read-callbacks', skill: 'read-callbacks', kind: 'explain', title: 'Keep some, change them all',
 ask: 'Read sample.js. What lists are big and doubled, and is prices changed at the end?',
 files: {'sample.js': "const prices = [4, 12, 7, 20];\nconst big = prices.filter(p => p > 5);\nconst doubled = big.map(p => p * 2);\n"},
 model: 'p => p > 5 is a small function handed to filter. filter runs it on every item and keeps the ones where it gives true, so big is [12, 7, 20]; 4 is dropped. map runs p => p * 2 on every item of big and makes a new list of the answers, so doubled is [24, 14, 40]. Both make new lists, so prices is still [4, 12, 7, 20].'}

);
