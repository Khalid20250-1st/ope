/* Step by step for Part 6 Designer and Part 7 Elite */
window.OPESteps = window.OPESteps || {};
(function(){
  var SAVE = [
    "Press Save under the editor, or press Command S (Control S on Windows).",
    "Press Check my work. It saves first, then runs the test and shows a PASS or FAIL line for each check.",
    "If a line says FAIL, read the words after FAIL. They say the one thing that is still wrong. Fix that one thing, press Save, and press Check my work again."
  ];
  var SEND = [
    "Press Send to my AI coder.",
    "Open your AI coder (for example Claude Code) in the project you switched to Learning, and type: grade my OPE answer",
    "Come back to this card. The verdict appears on it by itself. If it says Not yet, read why, add what is missing to your answer, and send it again."
  ];
  var WRITE = "Write your answer in the text box on the card, in your own words, in full sentences.";
  function check(list){ return { all: list.concat(SAVE) }; }
  function explain(list){ return { all: list.concat([WRITE], SEND) }; }

  Object.assign(window.OPESteps, {

  /* ============================================================ 6 Designer */
  'design-naming': check([
    "Read solution.cjs in the editor. f loops over x and adds `price * qty` into data2. doIt says `Date.now() > x.due && !x.paid`.",
    "The method: a name should say what a thing holds or does, so nobody has to read the body to know. You change only names, never the sums.",
    "On line 1 change `function f(x)` to `function totalPrice(items)`.",
    "data2 is the running total. Rename it to sum in all three places: `let sum = 0;`, `sum += ...` and `return sum;`.",
    "y is one item of the cart. Make the loop line `for (const item of items) sum += item.price * item.qty;`.",
    "Change `function doIt(x)` to `function isOverdue(invoice)`.",
    "Make its body `return Date.now() > invoice.due && !invoice.paid;`.",
    "Change the last line to `module.exports = { totalPrice, isOverdue };`.",
    "The test searches the whole file for the words f, doIt, data2, x and y standing on their own. Read the file once more from top to bottom. None of them may be left, not even in a comment."
  ]),

  'design-data': check([
    "Click the booking.json tab. It holds only `{` and `}`. Your booking goes on the lines between them.",
    "JSON rules: every name is in double quotes, text values are in double quotes, numbers have no quotes, a comma goes after every part except the last one.",
    "Type the id as text: `\"id\": \"bk_1\",`",
    "Type when as a date and time: `\"when\": \"2026-09-18T14:00:00Z\",` The T joins the date to the time, the Z means UTC time.",
    "Type person as an object inside the object: `\"person\": { \"name\": \"Ada\", \"email\": \"ada@example.com\" },` The email must have an @ in it.",
    "Type service with a number price: `\"service\": { \"name\": \"Haircut\", \"price\": 30 },` Write 30 with no quotes. \"30\" or \"$30\" would be text and fail.",
    "Type status last, with no comma after it: `\"status\": \"held\"` It must be exactly held, paid or cancelled, in small letters.",
    "Press Save. Look at every line: each ends with a comma except the status line.",
    "Click the why.md tab. It is empty.",
    "Write line one: why price is a number. Think: can you add up or compare the text \"$30\"?",
    "Write line two: why status is a fixed list of words. Think: what happens if one part of the app writes \"payed\" and another looks for \"paid\"? Both lines together must be more than 40 characters."
  ]),

  'design-schema': check([
    "Click the schema.sql tab. The line that starts with `--` is a comment and is ignored. Write under it.",
    "Start the table with `CREATE TABLE bookings (` on one line. It will end with `);` on its own line.",
    "Between them goes one column per line. Each line is the name, then the type, then the rules. Put a comma at the end of every column line except the last.",
    "Type the key: `id bigserial PRIMARY KEY,` bigserial is a number the database counts up by itself, so every row gets its own id.",
    "Type `client_email text NOT NULL,` NOT NULL means the row cannot be saved without it.",
    "Type `starts_at timestamptz NOT NULL,` timestamptz is a timestamp that also knows the time zone.",
    "Type `price_cents integer NOT NULL,` Whole cents in an integer never round wrong, so $12.50 is saved as 1250.",
    "Type the last column with no comma after it: `status text NOT NULL CHECK (status IN ('held', 'paid', 'cancelled'))` In SQL each word in the list sits in single quotes.",
    "Type `);` on the next line to close the table.",
    "Do not put anything you need after `--` on a line. The test throws away everything after `--`."
  ]),

  'design-api': explain([
    "No code is shown for this one. Plan it on paper first.",
    "List what people do in a library: the library adds a book, a member borrows one, a member gives one back, a member sees what they have, the library sees what is late.",
    "Turn each into one function. Give it a verb name that says what it does, like borrow or giveBack.",
    "For each function, write what goes in. Take the smallest thing it needs, like bookId and memberId, not the whole library.",
    "For each, write what comes out. Ask what the caller needs to know next. For borrow, think about the due date.",
    "For each, write what can go wrong. Think: an empty title, a book that is already out, a member with too many books, giving back a book that was never borrowed, a late return.",
    "Check you have the looking functions too: the books one member has out, and every loan that is late.",
    "Put it as one line per function: name, what it takes, what it gives back, what can go wrong. Aim for about five functions."
  ]),

  'design-interface': check([
    "Read the promise in the card: put, get, list and remove, and exactly what each gives back.",
    "The method: keep the items in a Map. A Map holds pairs of key and value: `map.set(key, value)`, `map.get(key)`, `map.has(key)`, and `map.delete(key)`, which gives back true if something was there and false if not.",
    "At the top of solution.cjs, under the comment, type `const items = new Map();` and on the next line `let next = 1;` next is the number the next new id will get.",
    "Start put: `function put(item) {`",
    "Make a copy so you never change the object you were handed: `const saved = Object.assign({}, item);`",
    "Give it an id only if it has none: `if (saved.id === undefined || saved.id === null) saved.id = next++;` next++ uses the number, then adds 1, so no id repeats.",
    "Save it and give it back: `items.set(saved.id, saved);` then `return saved;` then `}`. set with an id that is already there replaces it, which is what the promise asks.",
    "Write get: `function get(id) { return items.has(id) ? items.get(id) : null; }` A Map gives undefined for a missing key, and the promise says null.",
    "Write list: `function list() { return Array.from(items.values()); }`",
    "Write remove: `function remove(id) { return items.delete(id); }`",
    "Change the last line to `module.exports = { put, get, list, remove };`"
  ]),

  'design-modules': explain([
    "Read everything.js in the grey box.",
    "Go line by line and give each line a job: reading the form, checking it, saving it, sending the email, or showing a message.",
    "Group the lines into four jobs. Each job becomes one file.",
    "Give each file a name that says its job, ending in .js. Never a name like helpers or utils.",
    "For each file, write its one job in one sentence.",
    "For each file, say what only it knows. Which one is the only file that touches localStorage? Which one is the only file that knows the /api/mail address?",
    "Decide which file is the boss that calls the others in order. Do the other three need each other at all?",
    "Write the list of files with their jobs, then one line saying which file uses which."
  ]),

  'design-duplication': check([
    "Read solution.cjs. The four priceFor functions do the same sum. Only two numbers change: the tax multiplier and the shipping.",
    "The method: put the numbers in a table, and write the sum only once.",
    "Delete the four lines that start with `function priceFor`.",
    "At the top, type the table: `const COUNTRIES = {`",
    "Type one line per country: `US: { tax: 1.07, shipping: 5 },` then `UK: { tax: 1.2, shipping: 4 },` then `DE: { tax: 1.19, shipping: 4 },` then `FR: { tax: 1.2, shipping: 4 }` with no comma on the last.",
    "Close the table with `};`",
    "Inside price, delete the four if lines. Type `const c = COUNTRIES[country];` It finds that country's row, or undefined if there is none.",
    "Type `if (!c) throw new Error('Unknown country');` so a missing country stops loudly instead of giving back nothing.",
    "Type `return item.base * c.tax + c.shipping;`",
    "Leave `module.exports = { price };` as it is.",
    "The test counts every word function and every `=>` in the whole file, comments too. At most two. Do not write the word priceFor anywhere, not even in a comment."
  ]),

  'design-state': explain([
    "Read shop.js in the grey box.",
    "Find the three places the cart is kept: the cart list, the copy in localStorage under 'cart', and the number in the badge.",
    "Follow addToCart. Which of the three does it change? How does the badge get its number: from the cart, or by adding 1 to whatever the badge already said?",
    "Follow removeFromCart. Which of the three does it forget to change?",
    "Follow window.onload after a reload. The cart comes back from localStorage. What sets the badge? What does the badge show now?",
    "Write why the badge goes wrong. Name the exact function where it happens.",
    "Decide the one place the cart should truly live, and which code is the only code allowed to change it.",
    "Say how localStorage gets its value from that place: when it is written and when it is read.",
    "Say how the badge gets its value: counted up and down by hand, or drawn again from the length of the cart after every change?",
    "Finish with the rule in one sentence."
  ]),

  'design-errors': explain([
    "No code is shown. Picture the whole path first: they press the button, type their card, the bank answers, our server hears back, the time is held, they see a confirmation.",
    "At each point on that path, ask: what if it fails right here?",
    "The card: it is declined, or the bank asks for an extra check and they give up.",
    "The person: they close the page or lose signal halfway, or they press the button twice.",
    "Other people: someone else picks the same time while this person is paying.",
    "Our side: the payment company took the money but our server never heard back, or our server is down.",
    "For each one write two things: the exact words the person sees on the screen, and what the system does. Is the time held, for how long, is money taken or given back, who gets told?",
    "Check your list against three rules: nobody is charged twice, nobody pays without getting their time, no time stays held forever.",
    "Number them. You need at least five."
  ]),

  'design-plan': explain([
    "No code is shown. Walk through it as the person first: forgot my password, type the email, get an email, click the link, set a new password, done.",
    "Under a heading Steps, write each step and what the screen says.",
    "At the email step, think: if that email has no account, should the message be different? What could a stranger learn if it is?",
    "Think about the link: what makes it safe? Think about how long it is, how random, how many times it works and when it stops working.",
    "Under a heading Data, write what you must keep to check the link later: which user, the token (kept hashed, like a password), when it runs out, and whether it was used.",
    "Under a heading Risks, write at least three. Think about: finding out which emails have accounts, guessing links, a link used twice or found in an old email, someone still signed in after the reset.",
    "Next to each risk, write what you would do about it."
  ]),

  'design-tradeoff': explain([
    "No code is shown. Read the question again: the shop has no accounts.",
    "Think about the browser way: where it is kept (localStorage), what it costs, how fast it is, does it work offline?",
    "Think about the server way: whose cart would it be, when nobody signs in? What must the server keep and pay for?",
    "Pick one. Write it in one sentence.",
    "Give your reasons, and tie at least one to the fact that there are no accounts.",
    "Write plainly what you give up. Think: moving from phone to laptop, clearing the browser, prices that change while it sits in the cart.",
    "Say what the server must still do at checkout because it can never trust the total the browser sends."
  ]),

  'design-review': explain([
    "Read design.md in the grey box, one part at a time: Files, Data, Tests.",
    "Files: look at what config.js holds. The app has no server, so every file goes to every visitor. Can a visitor open config.js?",
    "Ask what a stranger could do with a Stripe secret key.",
    "Data: where are the invoices kept? What happens if the freelancer clears the browser or gets a new laptop? How much do invoices matter to a business?",
    "Files again: main.js does every job in 2,400 lines, and helpers2 and utils_final say nothing. Does that hurt today, or later?",
    "Tests: there are none. Is that as bad as the first two?",
    "Rank them by harm. Money or records lost now beats messy code.",
    "For each of your two biggest, write what it is, why it matters, and who gets hurt.",
    "Say which one you change first and exactly how: what to do today, where the key should live instead, and what should sit behind the app."
  ]),

  'door-6': explain([
    "This is the Part 6 door test. It uses everything in Part 6. No code is shown.",
    "Plan on paper under five headings: Data, Functions, Files, Order, Choice.",
    "Data: name every kind of record, such as the client, the appointment and the reminder. For each, list its fields and their types. Give anything with a state a fixed list of words.",
    "Functions: booking, cancelling, finding the reminders that are due now, sending one. For each, the name, what goes in, what comes out, and what can fail.",
    "Files: each file has one job and a name that says it. Say which file is the only one that touches the screen, and which one sends messages.",
    "Order: from the moment someone books until the reminder is sent and marked sent. Write which function runs at each step.",
    "Choice: name two ways you thought about, for example checking every minute or setting an exact timer for each appointment. Say which you picked and what you gave up.",
    "Read it over: every function should only use fields that exist in your Data."
  ]),

  /* ============================================================ 7 Elite */
  'elite-review': explain([
    "Read ai.js in the grey box, one line at a time.",
    "addUser: how is the password stored? Who can read it if they see the data?",
    "The console.log line: what does it print? Who gets to read the logs?",
    "What does addUser check before it saves? Try an empty name, the same name twice, an age that is not a number.",
    "findUser: what does it give back when nobody matches? Is that clear to the caller? Look at the == too.",
    "isAdult: run it in your head with age 18. Look hard at the `>`.",
    "users: where does the list live? What happens to it when the program restarts?",
    "Pick at least three problems, most serious first.",
    "For each one write: the problem, why it matters and who gets hurt, and the exact change you would ask for instead."
  ]),

  'elite-reject': explain([
    "Read change.js in the grey box. Compare the four priceFor lines. What is the same and what is different?",
    "Imagine adding a fifth country. What would you have to copy?",
    "Imagine the shipping rule changes for everyone. How many places must change, and what if one is missed?",
    "Run price in your head with a country that is not there, like 'JP'. What comes back? What would the checkout show or charge?",
    "Look at the == in the if lines.",
    "Start your review with the word Rejected.",
    "Say what is wrong, and why it hurts later even though it works and the tests pass today.",
    "End with a clear list of what would make you accept it, so the author can tick each one off."
  ]),

  'elite-security': check([
    "Read solution.cjs. The name is glued between quotes inside the SQL text with +.",
    "See the attack: if the name is `x' OR '1'='1`, its quote closes the text early and `OR '1'='1'` is true for every row, so every user comes back.",
    "The fix is a parameter. The SQL has a `?` where the value goes, and the value travels on its own in a list. The database never reads the value as SQL.",
    "Change the sql to exactly `'SELECT * FROM users WHERE name = ?'` with no + and no name glued in.",
    "Change params from `[]` to `[name]`.",
    "The whole line should now be `return { sql: 'SELECT * FROM users WHERE name = ?', params: [name] };`",
    "Read it once more: the variable name must only appear inside params, never inside the sql text."
  ]),

  'elite-xss': check([
    "Read solution.cjs. render glues comment.name and comment.text straight into the HTML with +.",
    "The method: write a small escape function that turns the five special characters into safe codes, and pass both name and text through it.",
    "Above render, start the function: `function escape(text) {` and on the next line `return String(text)`",
    "First add `.replace(/&/g, '&amp;')` It must come first: the other codes contain &, so if & went last it would break them into things like `&amp;lt;`.",
    "Then add `.replace(/</g, '&lt;')`",
    "Then add `.replace(/>/g, '&gt;')`",
    "Then add `.replace(/\"/g, '&quot;')`",
    "Then add `.replace(/'/g, '&#39;');` with the semicolon, and close the function with `}`. The g after each pattern means every match, not just the first one.",
    "In render, change `comment.name` to `escape(comment.name)` and `comment.text` to `escape(comment.text)`.",
    "Leave the tags `<div class=\"comment\">`, `<b>` and `<p>` as they are. They are yours, only the person's words get escaped."
  ]),

  'elite-secrets': check([
    "Read config.cjs. The key is typed into a string on the first line, so anyone who sees the code has it.",
    "Delete the whole first line, `const PAYMENTS_KEY = 'ope_live_...';`. The key text must not be anywhere in the file, not even in a comment.",
    "Know this: `process.env` holds the environment variables the computer hands the program when it starts. `process.env.PAYMENTS_KEY` is that value, or undefined when it is not set.",
    "Inside paymentsKey, replace the body with `const key = process.env.PAYMENTS_KEY;`",
    "Next line: `if (!key) throw new Error('PAYMENTS_KEY is not set');` `!key` is true both when it is missing and when it is empty text.",
    "Next line: `return key;`",
    "Leave `module.exports = { paymentsKey };` as it is.",
    "Press Save, then click the .env.example tab. It is empty.",
    "Type one line: `PAYMENTS_KEY=` with nothing after the equals sign. You may put a comment line starting with # above it. Never the real key."
  ]),

  'elite-auth': check([
    "Read solution.cjs. editPost changes the post without asking who is asking.",
    "The method: a guard at the very top. Decide if this user is allowed, and throw before anything changes.",
    "As the first line inside the function, type `const allowed = user && (user.id === post.authorId || user.role === 'admin');`",
    "Why `user &&` comes first: if user is null it stops right there, instead of crashing when it reads user.id.",
    "Next line: `if (!allowed) throw new Error('Not allowed');`",
    "Both lines must sit above `post.text = text;`. If the throw came after, the post would already be changed.",
    "Leave the rest of the function and the export as they are."
  ]),

  'elite-speed': check([
    "Read solution.cjs. For every item, the inner loop looks at every later item. 30,000 items is about 450 million comparisons.",
    "The method: walk the list once and remember what you have seen in a Set. A Set answers have I seen this at once, however big it is.",
    "Keep the first line `function hasDuplicates(list) {` and the last `}`. Delete both for loops and the `return false;` inside.",
    "Type `const seen = new Set();`",
    "Type `for (const item of list) {`",
    "Type `if (seen.has(item)) return true;` If it is already there, you found a duplicate.",
    "Type `seen.add(item);` and then `}` to close the loop.",
    "After the loop, type `return false;` An empty list never enters the loop, so it gives false too."
  ]),

  'elite-complexity': explain([
    "Read sample.js in the grey box. For each function, count how many items it looks at when the list has n items.",
    "priceOf: does it loop at all? How does it find the name?",
    "total: how many loops? How many times is each item looked at?",
    "pairsThatMatch: there is a loop inside a loop over the same list. For each a, how many b does it look at? So how many looks in all?",
    "Try it with numbers: a list of 10, then a list of 100, for each function.",
    "For each function write: when the list is 10 times longer, it takes about how many times as long, and why, pointing at the code.",
    "Say which one gets slow fast, and give a big example, such as 1,000 items."
  ]),

  'elite-cache': check([
    "Read solution.cjs. calls counts how many times slowPrice runs. cachedPrice calls it every single time.",
    "The method: a Map from id to price, kept outside the function so it lasts between calls.",
    "Just above `function cachedPrice`, type `const cache = new Map();`",
    "Replace the body of cachedPrice with `if (!cache.has(id)) cache.set(id, slowPrice(id));`",
    "Next line: `return cache.get(id);`",
    "Why has and not `if (!cache.get(id))`: a price of 0 counts as false, so that version would ask slowPrice again for every 0. has only asks whether the id was stored.",
    "Leave slowPrice, calls and module.exports exactly as they are."
  ]),

  'elite-race': check([
    "Read solution.cjs. withdraw checks the balance, then waits 10 ms for the bank, then takes the money. While it waits, the second withdrawal runs its check and also sees 100.",
    "The method: a promise queue. Keep the promise of the last withdrawal in a variable, and start each new one with .then after it, so only one runs at a time.",
    "Rename the async function: `async function withdrawNow(amount) {` and leave its body as it is.",
    "Below it, type `let last = Promise.resolve();` That is a promise that is already done, so the first withdrawal starts at once.",
    "Start a new plain function, not async: `function withdraw(amount) {`",
    "Type `const run = last.then(() => withdrawNow(amount));` It waits for the one before, then runs this one.",
    "Type `last = run.catch(() => {});` The next one waits for this one. The catch is only for the queue, so a Not enough money here does not stop the ones after it.",
    "Type `return run;` and then `}`. The caller still gets the real result or the real error.",
    "Leave `module.exports = { withdraw, account };` It now points at the new withdraw."
  ]),

  'elite-architecture': explain([
    "No code is shown. Picture 10,000 shops and ask what grows: rows in the database, the reminder loop, page visits, emails sent, one noisy shop.",
    "Start with seeing it coming: what would you measure, like response time, errors and database load, and who gets an alert?",
    "The database: every page loads bookings. What lets a database find rows fast without reading them all? Loading everything, or a page at a time?",
    "The reminder loop: it checks every booking every minute. What happens when one pass takes longer than a minute? What could run reminders instead, and where?",
    "The booking pages: the public page looks the same for every visitor. Where could it be served from so the server does not do the work every time?",
    "Outside limits: how many emails will your email provider let you send?",
    "One shop hurting everyone: a huge import or a bot. What limit would you add?",
    "More servers: when would you add a second one, and what must be ready first, like tested backups and deploying without downtime?",
    "Put it in order, first to break first. For each: what breaks, why, and what you change."
  ]),

  'elite-system': explain([
    "This one is about your own project, the one you are building with OPE. Do it from that project, not the course.",
    "Open your project folder. List the top folders and main files, and write each one's job in one line.",
    "Pick the main thing a person does in your app. Follow it from their click through each file and function to what they see. Write the file and function names in order.",
    "Where does the data live: a database, a file, the browser? What is kept there, and who can read it?",
    "Pick the one part you would rewrite first. Your reason must be something you can point at in the code, like a file that is too big, a key in the code, copied code or no tests.",
    "Write it as if to a new engineer on their first day: the parts, the one request followed through, the data, and the rewrite.",
    "Make sure the AI coder you grade with is open in THAT project, so it can check your answer against the real code."
  ]),

  'door-7': explain([
    "This is the Part 7 door test. It uses everything in Part 7. Read pr.diff in the grey box. Every line starting with + is being added.",
    "SQL: how does q get into the query? What if q has a quote in it?",
    "The page: how do q and r.name get into the HTML? What if a search or a product name holds a script tag?",
    "What does SELECT * bring back? Is there a limit on how many rows?",
    "Speed: look at the two loops over rows plus out.includes. How does that grow with the rows? Does it do anything a plain list would not?",
    "Correctness: r.cost is shown to shoppers. Is cost the price they pay?",
    "Rate each problem: serious, medium or small.",
    "Decide: merge or reject.",
    "List exactly what must change before you would accept it."
  ])

  });
})();
