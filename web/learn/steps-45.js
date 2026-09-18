/* Step by step for Part 4 Builder and Part 5 Debugger */
window.OPESteps = window.OPESteps || {};
Object.assign(window.OPESteps, {
  'build-blank': { all: [
    "Your AI coder is off from here on. These steps are your help, so do them one at a time.",
    "Plan it first, in plain words. wordCount takes one thing: a piece of text. It gives back one number: how many words are in that text.",
    "Click in the big text box under the solution.cjs tab. It is empty. That is the file you are building.",
    "On line 1 type `function wordCount(text) {` and press Return. Leave the next line empty for now, and on the line after it type `}` to close the function.",
    "Click on the empty line inside the function. Press Tab once to indent it, then type `const clean = text.trim();`. trim cuts off spaces, tabs and new lines at the start and the end of the text.",
    "Press Return and type `if (clean === '') return 0;`. If nothing is left after trimming, there are no words, so the answer is 0.",
    "Press Return and type `const words = clean.split(/\\s+/);`. split cuts the text into a list of pieces. `/\\s+/` means one or more spaces, tabs or new lines in a row, so a long gap still counts as one cut.",
    "Press Return and type `return words.length;`. length is how many pieces are in the list, which is how many words there are.",
    "Click after the closing `}`. Press Return twice and type `module.exports = { wordCount };`. module.exports is what this file hands to other files. Without it the test cannot see your function.",
    "Read it back in your head with the text \"  a b  \". trim gives \"a b\", it is not empty, split gives [\"a\", \"b\"], and length is 2.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-split': { all: [
    "Plan it first, in plain words. slugify takes a title, like \"Hello World!\", and gives back text, like \"hello-world\". You will split the job in two: one function makes it lower case, the other deals with the dashes. Then slugify calls both.",
    "Click in the big text box under the solution.cjs tab.",
    "Write the first helper. Type `function lower(text) {`, then on the next line `  return text.toLowerCase().trim();`, then `}`. toLowerCase makes every letter small. trim cuts the spaces off both ends.",
    "Leave an empty line. Start the second helper: `function dashes(text) {`.",
    "Inside it, type `  let s = text.replace(/\\s+/g, '-');`. replace swaps what matches for something else. `/\\s+/g` means every run of spaces. The g at the end means everywhere, not only the first one.",
    "Next line: `  s = s.replace(/[^a-z0-9-]/g, '');`. The square brackets mean one of these letters. The `^` at the start inside them means NOT. So this removes every character that is not a to z, 0 to 9 or a dash.",
    "Next line: `  s = s.replace(/-+/g, '-');`. This turns two or more dashes in a row into one dash.",
    "Next line: `  s = s.replace(/^-|-$/g, '');`. Outside square brackets `^` means the very start and `$` means the very end. This removes a dash at either end.",
    "Next line: `  return s;`, then close the function with `}`.",
    "Leave an empty line and write the main function: `function slugify(title) {`, then `  return dashes(lower(title));`, then `}`. lower runs first, and its answer goes straight into dashes.",
    "Leave an empty line and type `module.exports = { slugify };` so the test can use slugify.",
    "Follow \"Hello World!\" in your head. lower gives \"hello world!\", the spaces become a dash, the ! is removed, and you get \"hello-world\".",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-modules': { all: [
    "Plan it first, in plain words. formatCents takes a whole number of cents, like 1250, and gives back text, like \"$12.50\". cartLine takes one item, like { name: \"Tea\", qty: 2, cents: 250 }, and gives back one line of text, like \"Tea x2 $5.00\". Each lives in its own file.",
    "Click the money.cjs tab. Delete the line that says `// formatCents goes here`.",
    "Type `function formatCents(cents) {`, then `  return '$' + (cents / 100).toFixed(2);`, then `}`. Dividing by 100 turns cents into dollars. toFixed(2) writes the number with exactly two decimals, so 5 cents becomes \"0.05\".",
    "Leave an empty line and type `module.exports = { formatCents };`. This hands formatCents to any file that asks for it.",
    "Press Save, then click the cart.cjs tab. Delete the line that says `// cartLine goes here`.",
    "On line 1 type `const { formatCents } = require('./money.cjs');`. require loads another file and gives back what it exports. `./` means this same folder. The curly brackets take formatCents out by its name.",
    "Leave an empty line and type `function cartLine(item) {`.",
    "Next line: `  const cost = item.qty * item.cents;`. That is the price of all of them, in cents.",
    "Next line: `  return item.name + ' x' + item.qty + ' ' + formatCents(cost);`. Keep the space before the x and the space after the quantity.",
    "Close the function with `}`. Leave an empty line and type `module.exports = { cartLine };`.",
    "Follow the Tea in your head. cost is 2 times 250, which is 500. formatCents(500) is \"$5.00\". The line is \"Tea x2 $5.00\".",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-cli': { all: [
    "Plan it first, in plain words. The program reads two things typed after its name: the bill and the tip percent. It prints one line with the tip and the total. If either one is missing or is not a number, it prints the Usage line and stops with code 1.",
    "Click the tip.cjs tab and delete the comment line.",
    "On line 1 type `const bill = Number(process.argv[2]);`. process.argv is the list of words typed in the terminal. [0] is node, [1] is the file, and [2] is the first thing you typed after it. Number turns the text \"80\" into the number 80. Text that is not a number becomes NaN.",
    "Line 2: `const percent = Number(process.argv[3]);`.",
    "Leave an empty line and type `if (process.argv.length < 4 || Number.isNaN(bill) || Number.isNaN(percent)) {`. `||` means or. This asks: were fewer than two things typed, or is either one not a number?",
    "Inside the if, type `  console.log('Usage: node tip.cjs <bill> <percent>');`. Copy it exactly, with the angle brackets.",
    "Next line: `  process.exit(1);`, then close the if with `}`. process.exit(1) stops the program right there. Code 1 means it failed.",
    "Leave an empty line and type `const tip = bill * percent / 100;`.",
    "Last line: `console.log('Tip: $' + tip.toFixed(2) + ', total: $' + (bill + tip).toFixed(2));`. The brackets around `bill + tip` make it add first. toFixed(2) gives two decimals.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "To try it yourself, press Open the folder. Then open a terminal in it. On a Mac: press Command and Space, type Terminal, press Return, type `cd ` with a space after it, drag the folder onto the Terminal window, and press Return. On Windows: click the address bar at the top of File Explorer, type cmd, and press Enter.",
    "Type `node tip.cjs 80 15` and press Return (Enter on Windows). You should see `Tip: $12.00, total: $92.00`. Then type `node tip.cjs` alone. You should see the Usage line.",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-files': { all: [
    "Plan it first, in plain words. saveNote takes a file name and some text. It gives back nothing, it only adds the text as a new line at the end of the file. readNotes takes a file name and gives back a list of the lines, or an empty list if the file is not there.",
    "Click the solution.cjs tab. Line 1 already says `const fs = require('fs');`. fs is the part of Node that reads and writes files, and require loads it. Leave that line alone.",
    "Below it, type `function saveNote(file, text) {`.",
    "Next line: `  fs.appendFileSync(file, text + '\\n');`, then close with `}`. appendFileSync adds to the end of the file, and makes the file if it is not there yet. `'\\n'` is a new line, so each note sits on its own line.",
    "Leave an empty line and type `function readNotes(file) {`.",
    "Next line: `  if (!fs.existsSync(file)) return [];`. existsSync says whether the file is there. `!` means not. So if there is no file, give back an empty list.",
    "Next line: `  const all = fs.readFileSync(file, 'utf8');`. readFileSync reads the whole file. 'utf8' says give it back as text.",
    "Next line: `  return all.split('\\n').filter(line => line !== '');`, then close with `}`. split cuts the text at every new line. The file ends with a new line, which leaves one empty piece at the end, so filter keeps only the pieces that are not empty.",
    "Leave an empty line and type `module.exports = { saveNote, readNotes };`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-json': { all: [
    "Plan it first, in plain words. save takes a file name and a list. It gives back nothing, it writes the list into the file as JSON. load takes a file name and gives back the list. If the file is missing or broken, load gives back an empty list.",
    "Click the store.cjs tab and delete the comment line.",
    "On line 1 type `const fs = require('fs');`. This loads Node's file tools.",
    "Leave an empty line and type `function save(file, list) {`.",
    "Next line: `  fs.writeFileSync(file, JSON.stringify(list));`, then close with `}`. JSON.stringify turns the list into text. writeFileSync makes the file, or replaces what was in it.",
    "Leave an empty line and type `function load(file) {`, then on the next line `  try {`.",
    "Inside the try, type `    const text = fs.readFileSync(file, 'utf8');`, then `    return JSON.parse(text);`. JSON.parse turns the text back into the list.",
    "Next line: `  } catch (e) {`, then `    return [];`, then `  }`, then `}` to close load. try runs the code inside it. If anything in it throws an error, like a missing file or broken JSON, the program jumps into catch instead of crashing. e holds the error.",
    "Leave an empty line and type `module.exports = { save, load };`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-classes': { all: [
    "Plan it first, in plain words. A Basket keeps its own list of things. Each thing has a name and a price. It has five actions: add, remove, total, count, and the start (the constructor) that makes the empty list.",
    "Click the solution.cjs tab. The file already has `class Basket {` and `module.exports = { Basket };`. You will replace the line `// your code here`.",
    "Delete `// your code here`. In its place type `  constructor() {`, then `    this.items = [];`, then `  }`. The constructor runs once every time someone writes `new Basket()`. `this` means this one basket, so each basket gets its own list.",
    "Next, add: `  add(name, price) {`, then `    this.items.push({ name: name, price: price });`, then `  }`. Inside a class you do not write the word function.",
    "Next, remove: `  remove(name) {`, then `    const i = this.items.findIndex(item => item.name === name);`. findIndex gives the place of the first thing with that name, or -1 if there is none.",
    "Still inside remove: `    if (i !== -1) this.items.splice(i, 1);`, then `  }`. splice(i, 1) takes out 1 thing at place i. If i is -1, nothing happens.",
    "Next, total: `  total() {`, then `    let sum = 0;`, then `    for (const item of this.items) sum += item.price;`, then `    return sum;`, then `  }`.",
    "Next, count: `  count() {`, then `    return this.items.length;`, then `  }`.",
    "Check that the `}` that closes the class is still there, just above `module.exports`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-async': { all: [
    "Plan it first, in plain words. slowDouble takes a number, waits 50 milliseconds, then gives back the number times 2. doubleAll takes a list of numbers and gives back a list of them all doubled, in the same order, using slowDouble.",
    "Click the solution.cjs tab. It is empty.",
    "On line 1 type `const wait = ms => new Promise(done => setTimeout(done, ms));`. A Promise is an answer that comes later. setTimeout calls done after ms milliseconds. So wait(50) is something you can wait on.",
    "Leave an empty line and type `async function slowDouble(n) {`. async lets a function use await. An async function always gives back a Promise.",
    "Next line: `  await wait(50);`. await pauses this function until the wait is over.",
    "Next line: `  return n * 2;`, then close with `}`.",
    "Leave an empty line and type `async function doubleAll(list) {`, then `  const out = [];`.",
    "Next: `  for (const n of list) {`, then `    out.push(await slowDouble(n));`, then `  }`. A for of loop with await inside waits for each number before it moves on, so the order stays the same.",
    "Next: `  return out;`, then close with `}`.",
    "Leave an empty line and type `module.exports = { slowDouble, doubleAll };`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-fetch': { all: [
    "Plan it first, in plain words. getWeather takes a city name and fetchFn, the tool that asks another computer. It asks the weather address, waits for the answer, and gives back text like \"Paris: 21°\". If the answer is not ok, it throws an error.",
    "Click the solution.cjs tab. The function is already started, with async in front. Delete the line `// your code here`.",
    "In its place type `  const url = 'https://weather.example/api?city=' + encodeURIComponent(city);`. encodeURIComponent makes the city safe to put in an address. A space becomes %20, so New York becomes New%20York.",
    "Next line: `  const response = await fetchFn(url);`. Asking another computer takes time. await waits for the answer before going on.",
    "Next line: `  if (!response.ok) throw new Error('Could not get the weather');`. `!` means not. throw stops the function and hands the error to whoever called it. Spell the message exactly like that.",
    "Next line: `  const data = await response.json();`. json() reads the answer as an object like { temp: 21 }. It also takes time, so it needs await too.",
    "Next line: `  return city + ': ' + data.temp + '°';`. To type the ° sign on a Mac, press Option, Shift and 8. On Windows, hold Alt and type 0176 on the number pad. Or copy the ° from the task text above.",
    "Check that the `}` closing the function and the `module.exports` line are still there.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-search': { all: [
    "Plan it first, in plain words. sortBy takes a list and a key name, and gives back a new sorted list, leaving the old one alone. binarySearch takes a sorted list of numbers and a number to find, and gives back its place, or -1.",
    "Click the solution.cjs tab. In sortBy, delete `// your code here` and type `  const copy = [...list];`. The three dots copy every item into a brand new list, so the list you were given is never touched.",
    "Next line: `  copy.sort((a, b) => a[key] - b[key]);`. sort compares two items at a time. A negative answer puts a first. `a[key]` reads the property whose name is in key, like a.age.",
    "Next line: `  return copy;`.",
    "In binarySearch, delete `// your code here` and type `  let low = 0;`, then `  let high = sorted.length - 1;`. These are the first and last places the number could still be.",
    "Next line: `  while (low <= high) {`. Keep going while there is still somewhere left to look.",
    "Inside: `    const mid = Math.floor((low + high) / 2);`. That is the middle place. Math.floor rounds down to a whole number.",
    "Next: `    const value = sorted[mid];`. Read the middle item once and keep it in value. The test counts every look, so do not write `sorted[mid]` again below.",
    "Next: `    if (value === target) return mid;`. Found it, give back where.",
    "Next: `    if (value < target) low = mid + 1;`. The middle is too small, so the number can only be in the right half.",
    "Next: `    else high = mid - 1;`, then `  }` to close the while. The middle is too big, so keep only the left half.",
    "After the while, type `  return -1;`. Nothing left to look at, so it is not there.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-own-tests': { all: [
    "Plan it first, in plain words. mytest.cjs asks isLeapYear four questions you know the answers to. If any answer is wrong, assert stops the file with an error, and that is how a broken copy gets caught. Do not change solution.cjs, it is already correct.",
    "Click the mytest.cjs tab and delete the comment line.",
    "On line 1 type `const assert = require('assert');`. assert is Node's checking tool. It throws an error when something is wrong.",
    "Line 2: `const { isLeapYear } = require(process.env.TARGET || './solution.cjs');`. process.env.TARGET is a setting the check fills in with the path of a broken copy. When it is empty, `||` falls back to your real file.",
    "Line 3: `assert.strictEqual(isLeapYear(2024), true);`. strictEqual(what you got, what it should be) throws if they are different. This catches a copy that always says no.",
    "Line 4: `assert.strictEqual(isLeapYear(2023), false);`. A year that does not divide by 4.",
    "Line 5: `assert.strictEqual(isLeapYear(1900), false);`. Divides by 100 but not by 400. This catches a copy that only checks divides by 4.",
    "Line 6: `assert.strictEqual(isLeapYear(2000), true);`. Divides by 400. This catches a copy that forgets the 400 rule.",
    "Line 7: `console.log('all good');`. You only see this if every check passed.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "To try it yourself, press Open the folder and open a terminal in it. On a Mac: press Command and Space, type Terminal, press Return, type `cd ` with a space after it, drag the folder onto the Terminal window, and press Return. On Windows: click the address bar at the top of File Explorer, type cmd, and press Enter. Then type `node mytest.cjs` and press Return (Enter on Windows). It should print `all good`.",
    "Press Check my work. It runs your tests on the right function and on three broken copies.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'build-app': { all: [
    "Plan it first, in plain words. The file keeps one list of items and one next id number at the top. add takes a title and gives back the new item. done takes an id and marks that item finished. list gives back all items. remaining gives back how many are not done.",
    "Click the solution.cjs tab. On line 1 type `const items = [];` and on line 2 `let next = 1;`. These sit outside the functions, so all four functions share them.",
    "Leave an empty line and write add: `function add(title) {`, then `  const item = { id: next, title: title, done: false };`, then `  next = next + 1;`, then `  items.push(item);`, then `  return item;`, then `}`.",
    "Write done: `function done(id) {`, then `  const item = items.find(i => i.id === id);`, then `  if (item) item.done = true;`, then `}`. find gives back the first item that matches, or undefined if none does.",
    "Write list: `function list() {`, then `  return items;`, then `}`.",
    "Write remaining: `function remaining() {`, then `  return items.filter(i => !i.done).length;`, then `}`. filter keeps the items that are not done, and length counts them.",
    "Last line: `module.exports = { add, done, list, remaining };`.",
    "Press Save, then click the mytest.cjs tab.",
    "Type `const assert = require('assert');`, then on the next line `const todo = require('./solution.cjs');`. todo now holds your four functions.",
    "Next lines: `const a = todo.add('milk');`, then `todo.add('bread');`, then `todo.done(a.id);`.",
    "Next lines: `assert.strictEqual(todo.remaining(), 1);`, then `assert.strictEqual(a.done, true);`. If either is wrong, assert stops the file with an error.",
    "Last line: `console.log('my test passed');`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work. It checks your to do list and runs your mytest.cjs.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'door-4': { all: [
    "Plan it first, in plain words. createAccount takes nothing and gives back an object with four actions: deposit, withdraw, balance and history. The money and the history live inside createAccount, so every account gets its own.",
    "Click the solution.cjs tab. Type `function createAccount() {`.",
    "Inside, type `  let money = 0;` and on the next line `  const log = [];`. Each call to createAccount makes a fresh money and log.",
    "Next, a helper that checks amounts: `  function checkAmount(amount) {`, then `    if (!(amount > 0)) throw new Error('Bad amount');`, then `  }`. `!(amount > 0)` is true for 0, for minus numbers, and for anything that is not a number.",
    "Next line: `  return {`. This starts the object you give back.",
    "Write deposit: `    deposit(amount) {`, then `      checkAmount(amount);`, then `      money += amount;`, then `      log.push({ type: 'deposit', amount: amount });`, then `    },`. Keep the comma after `}`, because the actions in an object are separated by commas.",
    "Write withdraw: `    withdraw(amount) {`, then `      checkAmount(amount);`, then `      if (amount > money) throw new Error('Not enough money');`.",
    "Still in withdraw: `      money -= amount;`, then `      log.push({ type: 'withdraw', amount: amount });`, then `    },`. The throw comes before the money changes, so a failed withdraw leaves the balance as it was.",
    "Write balance: `    balance() { return money; },`.",
    "Write history: `    history() { return log.slice(); }`. slice gives back a copy, so nobody outside can change the real history. No comma after this last one.",
    "Close the object with `  };` and close createAccount with `}`.",
    "Leave an empty line and type `module.exports = { createAccount };`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-error': { all: [
    "Press Open the folder. Your task folder, OPE Course/debug-error on the Desktop, opens in Finder or File Explorer.",
    "Open a terminal in that folder. On a Mac: press Command and Space, type Terminal, press Return, type `cd ` with a space after it, drag the folder onto the Terminal window, and press Return. On Windows: click the address bar at the top of File Explorer, type cmd, and press Enter.",
    "Type `node broken.cjs` and press Return (Enter on Windows). It stops with an error.",
    "Read the first line of the error. It ends with `broken.cjs:11`. The number after the colon is the line where it broke. So the line is 11.",
    "Read the line that starts with `ReferenceError`. It says `totl is not defined`. A ReferenceError means the code used a name that was never made.",
    "In the card, click the answer.txt tab. Type only `11`, with nothing else, and press Save.",
    "Click the broken.cjs tab and find line 11: `console.log('Total: ' + totl);`.",
    "Look up at line 6. The name made there is `total`. So `totl` is a spelling mistake.",
    "On line 11, change `totl` to `total`.",
    "Press Save. In the terminal, type `node broken.cjs` again and press Return (Enter on Windows). It should print `Total: 7`.",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-typo': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. It says the answer was NaN when it should be 10. NaN means a sum used something that is not a number.",
    "Click the solution.cjs tab and look in orderTotal at the line that adds: `sum += item.prise * item.qty;`.",
    "Compare the names with an item the test sends: `{ name: 'tea', price: 3, qty: 2 }`. The item has price. The code reads prise.",
    "This kind of bug is a spelling mistake in a name. JavaScript does not complain. Reading a property that is not there gives undefined, and undefined times a number is NaN.",
    "Change `item.prise` to `item.price`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-types': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. It says the answer was '105' when it should be 15. The quote marks around 105 mean it is text, not a number.",
    "Click the solution.cjs tab and look in addUp at the line `return parts.reduce((sum, part) => sum + part);`.",
    "split gives back pieces of text: \"10,5\" becomes [\"10\", \"5\"]. When you use + on text, it glues the text together, so \"10\" + \"5\" is \"105\".",
    "There is a second problem on the same line. With no start value, reduce uses the first piece, which is text, as the starting sum.",
    "Change the line to `return parts.reduce((sum, part) => sum + Number(part), 0);`. Number turns each piece into a number, and it ignores spaces around it, so \" 4\" becomes 4. The 0 at the end makes the sum start at the number 0.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-off-by-one': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. For the last 2 of [1, 2, 3, 4, 5] it gave [3, 4, 5]. That is one too many.",
    "Click the solution.cjs tab and look in lastN at the line where the loop starts: `for (let i = list.length - n - 1; i < list.length; i++) {`.",
    "Work it out by hand. The list has 5 things and n is 2. 5 minus 2 minus 1 is 2, so the loop reads places 2, 3 and 4. That is three things. It should start at place 3.",
    "This kind of bug is called off by one: a loop starts or stops one place too early or too late.",
    "Remove the ` - 1`. The line becomes `for (let i = list.length - n; i < list.length; i++) {`.",
    "Check it by hand again. 5 minus 2 is 3, so the loop reads places 3 and 4, which hold 4 and 5.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-condition': { all: [
    "Before you change anything, press Check my work. Read the FAIL lines. It says no to someone with slots left who is not a member, and no to a member when there are no slots.",
    "Click the solution.cjs tab and look in canBook at `return slotsLeft > 0 && isMember;`.",
    "`&&` means and: both sides must be true. `||` means or: one side being true is enough.",
    "The task says yes when there is a slot OR the person is a member. So the code uses the wrong one.",
    "Change `&&` to `||`. The line becomes `return slotsLeft > 0 || isMember;`.",
    "Test it in your head. 3 slots and not a member: yes. 0 slots and a member: yes. 0 slots and not a member: no.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-equality': { all: [
    "Before you change anything, press Check my work. Read the two FAIL lines. countBad said 0 when there were two NaN. hasPoint said false when the point was there.",
    "Click the solution.cjs tab and look in countBad at `value === NaN`.",
    "NaN is the one value that is not equal to anything, not even to itself. So `value === NaN` is always false, and nothing gets counted.",
    "Change the line to `return list.filter(value => Number.isNaN(value)).length;`. Number.isNaN is the right way to ask whether something is NaN.",
    "Now look in hasPoint at `return list.includes(point);`.",
    "includes uses ===. For objects, === asks whether it is the very same object, not whether it has the same x and y. The test makes a new point with the same numbers, so it is never the same object.",
    "Change the line to `return list.some(p => p.x === point.x && p.y === point.y);`. some gives back true if at least one item passes the question, and here the question compares the x and the y.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-empty': { all: [
    "Before you change anything, press Check my work. Read the FAIL lines. average of an empty list gave NaN, not 0. biggest of an empty list gave undefined, not null.",
    "Click the solution.cjs tab and look in average at `return sum / list.length;`. With an empty list that is 0 divided by 0, which is NaN.",
    "This kind of bug is the empty case nobody planned for. The fix is a guard: handle the empty list at the very top, then the normal code runs untouched.",
    "Click at the end of the line `function average(list) {`, press Return, and type `  if (list.length === 0) return 0;`.",
    "Now look in biggest at `let best = list[0];`. An empty list has no place 0, so best is undefined.",
    "Click at the end of the line `function biggest(list) {`, press Return, and type `  if (list.length === 0) return null;`.",
    "Leave the rest of both functions as they are, so the normal answers stay right.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-float': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. 0.1 and 0.2 gave 0.30000000000000004, not 0.3.",
    "Understand the kind of bug. A computer cannot store 0.1 exactly, so tiny errors creep in and add up. Whole numbers are always exact. So add up whole cents, and turn them back into dollars at the end.",
    "Click the solution.cjs tab. In total, change `let sum = 0;` to `let cents = 0;`.",
    "Change the loop line to `  for (const p of prices) cents += Math.round(p * 100);`. p times 100 turns dollars into cents. Math.round is needed because 0.07 times 100 comes out as 7.000000000000001, and rounding makes it exactly 7.",
    "Change `return sum;` to `return cents / 100;`.",
    "Now look in format at `return '$' + amount;`. Change it to `return '$' + amount.toFixed(2);`. toFixed(2) always shows two decimals, so 0.3 shows as 0.30 and 5 shows as 5.00.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-scope': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. All three buttons said Button 4.",
    "Click the solution.cjs tab and look in makeButtons at the loop line: `for (var i = 1; i <= n; i++) {`.",
    "Understand the kind of bug. var makes one single i for the whole function. Every handler looks at that same i, but only later, when it is clicked. By then the loop has finished and pushed i up to 4.",
    "let is different. It makes a fresh i for each turn of the loop, so each handler keeps its own number.",
    "On the loop line, change `var i` to `let i`. The line becomes `for (let i = 1; i <= n; i++) {`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-async': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. loadAll gave back [] when it should give [2, 5, 3].",
    "Click the solution.cjs tab and look in loadAll at `ids.forEach(async id => {`.",
    "Understand the kind of bug. forEach does not wait for async functions. It starts all three and moves on at once, so `return out` runs while the list is still empty. The await is inside the small function, not in loadAll, so loadAll never waits.",
    "Select these three lines: `ids.forEach(async id => {`, `out.push(await fetchPrice(id));` and `});`. Delete them.",
    "In their place type `  for (const id of ids) {`, then `    out.push(await fetchPrice(id));`, then `  }`.",
    "Now the await is in loadAll itself, so loadAll waits for each price, one after the other, before it reaches `return out`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-state': { all: [
    "Before you change anything, press Check my work. Read the FAIL line. The tax is right, but the original cart is not untouched.",
    "Click the solution.cjs tab and look in withTax at `item.price = Math.round(item.price * 110) / 100;`.",
    "Understand the kind of bug. Objects are shared, not copied. The item in the loop is the very same object that sits in the cart of whoever called withTax, so changing its price changes theirs too.",
    "The fix is to build new items and never touch the old ones. Select everything between `function withTax(cart) {` and its closing `}`: the for loop and `return cart;`. Delete it.",
    "In its place type `  return cart.map(item => ({ ...item, price: Math.round(item.price * 110) / 100 }));`.",
    "What that does: map makes a new list. `{ ...item }` copies the name and the price into a new object. `price:` after it replaces the price in the copy only. The round brackets around the curly ones tell JavaScript this is an object, not the body of a function.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'debug-regression': { all: [
    "Press Open the folder. Your task folder, OPE Course/debug-regression on the Desktop, opens in Finder or File Explorer.",
    "Open a terminal in that folder. On a Mac: press Command and Space, type Terminal, press Return, type `cd ` with a space after it, drag the folder onto the Terminal window, and press Return. On Windows: click the address bar at the top of File Explorer, type cmd, and press Enter.",
    "Type `git diff --no-index before.cjs after.cjs` and press Return (Enter on Windows). The command is the same on a Mac and on Windows. If you see a `:` at the bottom and no prompt, press q to get back.",
    "Read the lines. Lines starting with a minus sign were in before.cjs. Lines starting with a plus sign are in after.cjs. before.cjs had a step `s = s.replace(/^-+|-+$/g, '');`, which removes dashes at the start and the end. after.cjs has no such step.",
    "Press Check my work to see it. The FAIL lines show \"tea-cake-\" with a dash at the end and \"-1-pick\" with a dash at the start.",
    "Understand the kind of bug. It is a regression: something that used to work broke when the code was changed. The tidy kept trim, but trim only removes spaces. The ! and the # still turn into dashes at the ends.",
    "In the card, click the after.cjs tab. Leave before.cjs alone.",
    "On the slugify line, click just before the last `;` and type `.replace(/^-+|-+$/g, '')`.",
    "The line should now read `const slugify = title => title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');`.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]},

  'door-5': { all: [
    "Before you change anything, press Check my work. You will see three FAIL lines: average, topScorer and inRange. Fix them one at a time.",
    "Click the solution.cjs tab and look in average at the loop: `for (let i = 0; i <= list.length; i++)`. `<=` goes one place past the end. That place is undefined, and adding undefined makes the sum NaN. This is an off by one.",
    "Change `i <= list.length` to `i < list.length`.",
    "average also breaks on an empty list, because 0 divided by 0 is NaN. Click at the end of `function average(list) {`, press Return, and type `  if (list.length === 0) return 0;`.",
    "Press Save and Check my work. The average line should now say PASS.",
    "Look in topScorer at `players.sort((a, b) => b.score - a.score);`. sort changes the list it is used on, and that list belongs to whoever called topScorer. This is the something changed bug.",
    "Change that line to `  const sorted = [...players].sort((a, b) => b.score - a.score);`. The three dots make a copy first, and only the copy is sorted.",
    "Change the next line to `  return sorted[0].name;`.",
    "Look in inRange at `return n > 1 && n < 10;`. `>` and `<` leave out 1 and 10 themselves. This is the wrong condition.",
    "Change it to `return n >= 1 && n <= 10;`. `>=` means more than or equal to, and `<=` means less than or equal to.",
    "Press Save (or Command S on a Mac, Control S on Windows).",
    "Press Check my work.",
    "If you see FAIL, read the words after FAIL. They say what is still wrong. Fix that one thing, press Save, and press Check my work again."
  ]}
});
