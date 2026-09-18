/* Step by step for Part 0 Computer and Part 1 Reader */
window.OPESteps = window.OPESteps || {};
(function(){

  /* ------------------------------------------------------------ Part 0 pieces, Mac */
  function macOpen(sees){
    return 'On the card press Open the folder. A Finder window opens. You see ' + sees + '.';
  }
  var macTerminal = function(id){ return [
    'Press Command and Space together. A search box appears. Type `Terminal` and press Return. A window with a blinking cursor opens.',
    'In the Terminal window type `cd ` (the letter c, the letter d, then one space). Do not press Return yet.',
    'Click on the Finder window. Press Command and the Up arrow together. You now see the OPE Course folder, and in it a folder called ' + id + '.',
    'Drag the ' + id + ' folder onto the Terminal window and let go. Its full path appears after cd.',
    'Click on the Terminal window and press Return. The Terminal is now standing in the ' + id + ' folder.'
  ]; };
  var macTextEdit = [
    'Press Command and Space, type `TextEdit` and press Return. If a window asks which file to open, click New Document at the bottom left.',
    'In the menu bar at the top of the screen click Format, then Make Plain Text. If the menu says Make Rich Text instead, it is already plain, so leave it.'
  ];
  var macSave = function(name, into){ return [
    'In the menu bar click File, then Save. A save box drops down.',
    'In the Save As box delete what is there and type `' + name + '`.',
    'If you do not see a list of places on the left, click the small arrow button next to the Save As box so the box grows.',
    'In the list on the left click Desktop. Then double click OPE Course, then double click ' + into.join(', then double click ') + '.',
    'Click Save.'
  ]; };
  var macGitTools = 'The first time you use git, a window may pop up asking to install the command line developer tools. Press Install, wait until it says it is done, then type the git line again.';
  var macWho = [
    'If it says Please tell me who you are, type `git config --global user.name "Your Name"` with your own name and press Return.',
    'Then type `git config --global user.email "you@example.com"` with your own email and press Return. Now type the git commit line again and press Return.'
  ];
  var macRightClick = 'right click it (click with two fingers on a trackpad, or hold Control and click)';
  var macCheck = [
    'Go back to OPE and press Check my work.',
    'If every line says PASS, you are done. If a line says FAIL, read the words after FAIL, fix that one thing, and press Check my work again.'
  ];

  /* ------------------------------------------------------------ Part 0 pieces, Windows */
  function winOpen(sees){
    return 'On the card press Open the folder. A File Explorer window opens. You see ' + sees + '.';
  }
  var winExt = 'Make File Explorer show the whole file name. On Windows 11 click View at the top, then Show, then click File name extensions so it has a tick. On Windows 10 click the View tab and tick File name extensions.';
  var winTerminal = [
    'In the File Explorer window click the address bar at the top, where the folder name is shown. The text turns blue.',
    'Type `cmd` and press Enter. A black Command Prompt window opens, already standing in this folder.'
  ];
  var winNotepad = [
    'Press the Windows key, type `Notepad` and press Enter. An empty Notepad window opens.'
  ];
  var winSave = function(name, into){ return [
    'Click File, then Save as. A save window opens.',
    'On the left click Desktop. Then double click OPE Course, then double click ' + into.join(', then double click ') + '.',
    'At the bottom, click Save as type and choose All files.',
    'In File name delete what is there and type `' + name + '`.',
    'Click Save.'
  ]; };
  var winGitTools = 'If it says git is not recognized, go to git-scm.com, download Git for Windows and install it, leaving every choice as it is. Close the Command Prompt, open it again the same way, and type the git line again.';
  var winWho = [
    'If it says Please tell me who you are, type `git config --global user.name "Your Name"` with your own name and press Enter.',
    'Then type `git config --global user.email "you@example.com"` with your own email and press Enter. Now type the git commit line again and press Enter.'
  ];
  var winCheck = [
    'Go back to OPE and press Check my work.',
    'If every line says PASS, you are done. If a line says FAIL, read the words after FAIL, fix that one thing, and press Check my work again.'
  ];

  /* ------------------------------------------------------------ Part 1 pieces */
  var grey = function(lines){
    return 'Find the grey box on the card. It shows sample.js, ' + lines + ' lines. Get a piece of paper and a pen.';
  };
  var send = [
    'Press Send to my AI coder.',
    'Open your AI coder (for example Claude Code) in the project you switched to Learning.',
    'Type `grade my OPE answer` and press Return (Enter on Windows).',
    'Come back to OPE and look at the card. The verdict appears there by itself. If it says something is missing, read why, fix your answer in the box and send it again.'
  ];

  Object.assign(window.OPESteps, {

  /* ================================================================ 0 Computer */
  'files-folders': {
    mac: [].concat(
      macOpen('task.md and test.cjs'),
      'In the menu bar at the top of the screen click File, then New Folder. A new folder called untitled folder appears with its name highlighted.',
      'Type `notes` and press Return. The folder is now called notes.',
      macTextEdit,
      'Type a sentence, anything you like, for example `My first file.`',
      macSave('today.txt', ['files-folders', 'notes']),
      'In Finder double click the notes folder. You see today.txt inside it.',
      macCheck),
    win: [].concat(
      winOpen('task.md and test.cjs'),
      'Right click an empty part of the window, then click New, then Folder. A new folder appears with its name highlighted.',
      'Type `notes` and press Enter. The folder is now called notes.',
      winNotepad,
      'Type a sentence, anything you like, for example `My first file.`',
      winSave('today.txt', ['files-folders', 'notes']),
      'In File Explorer double click the notes folder. You see today.txt inside it.',
      winCheck)
  },

  'rename-move': {
    mac: [].concat(
      macOpen('draft.txt, a folder called old, task.md and test.cjs'),
      'Click draft.txt once so it is highlighted. Press Return. The word draft is highlighted, ready to change.',
      'Type `final` and press Return. The file is now called final.txt. If the whole name was highlighted, type `final.txt` instead. It must end up exactly final.txt.',
      'In the menu bar click File, then New Folder. A folder called untitled folder appears with its name highlighted.',
      'Type `archive` and press Return.',
      'In the menu bar click View, then as List. Now each folder has a small arrow on its left.',
      'Click the small arrow next to old. keep.txt shows underneath it.',
      'Drag keep.txt onto the archive folder and let go. It moves into archive.',
      'Click the small arrow next to archive. You see keep.txt inside archive, and old is now empty.',
      macCheck),
    win: [].concat(
      winOpen('draft.txt, a folder called old, task.md and test.cjs'),
      winExt,
      'Click draft.txt once so it is highlighted. Press F2. The name can now be changed.',
      'Change it to `final.txt` and press Enter. It must end up exactly final.txt.',
      'Right click an empty part of the window, then click New, then Folder.',
      'Type `archive` and press Enter.',
      'Double click the old folder. You see keep.txt.',
      'Right click keep.txt and click Cut (on Windows 11 it is the scissors icon at the top of the menu).',
      'Click the back arrow at the top left of the window to go back up.',
      'Double click the archive folder. Right click an empty part of the window and click Paste. keep.txt is now inside archive.',
      winCheck)
  },

  'paths': {
    mac: [].concat(
      macOpen('task.md and test.cjs'),
      'Press Command and the Up arrow together. You now see the OPE Course folder, and in it a folder called paths.',
      'Click the paths folder once, then ' + macRightClick + '. A menu opens.',
      'Hold down the Option key. The line Copy "paths" changes to Copy "paths" as Pathname. Click it while still holding Option. The path is now copied.',
      'Double click the paths folder to go back inside it.',
      macTextEdit,
      'Press Command and V to paste. You see a line like /Users/yourname/Desktop/OPE Course/paths',
      macSave('path.txt', ['paths']),
      macCheck),
    win: [].concat(
      winOpen('task.md and test.cjs'),
      'Click the address bar at the top of the window. The full path turns blue, for example C:\\Users\\yourname\\Desktop\\OPE Course\\paths',
      'Press Ctrl and C to copy it. Press Esc.',
      winNotepad,
      'Press Ctrl and V to paste. You see the path you copied.',
      winSave('path.txt', ['paths']),
      winCheck)
  },

  'file-types': {
    mac: [].concat(
      macOpen('task.md and test.cjs'),
      macTextEdit,
      'In the menu bar click Edit, then Substitutions. If Smart Quotes has a tick, click it to take the tick away. Code needs straight quotes.',
      'Type exactly `console.log("hi");`',
      macSave('hello.js', ['file-types']),
      'If a box asks about the .txt ending, click Use .js.',
      'Press Command and N for a new document. Click Format, then Make Plain Text again.',
      'Type exactly `{"name": "Ada"}`',
      macSave('data.json', ['file-types']),
      'If a box asks about the .txt ending, click Use .json.',
      'Press Command and N for a new document. Click Format, then Make Plain Text again.',
      'Type exactly `# My notes` as the first line.',
      macSave('notes.md', ['file-types']),
      'If a box asks about the .txt ending, click Use .md.',
      'Look in the Finder window. You see hello.js, data.json and notes.md.',
      macCheck),
    win: [].concat(
      winOpen('task.md and test.cjs'),
      winExt,
      winNotepad,
      'Type exactly `console.log("hi");`',
      winSave('hello.js', ['file-types']),
      'Click File, then New tab (or New) for an empty page.',
      'Type exactly `{"name": "Ada"}`',
      winSave('data.json', ['file-types']),
      'Click File, then New tab (or New) for an empty page.',
      'Type exactly `# My notes` as the first line.',
      winSave('notes.md', ['file-types']),
      'Look in the File Explorer window. You see hello.js, data.json and notes.md, with no .txt at the end.',
      winCheck)
  },

  'terminal': {
    mac: [].concat(
      macOpen('task.md and test.cjs'),
      macTerminal('terminal'),
      'Type `ls > list.txt` and press Return. Nothing seems to happen. That is right: the list went into a file instead of the screen.',
      'Double click the terminal folder in Finder to go back inside it. You see a new file, list.txt.',
      macCheck),
    win: [].concat(
      winOpen('task.md and test.cjs'),
      winTerminal,
      'Type `dir > list.txt` and press Enter. Nothing seems to happen. That is right: the list went into a file instead of the screen.',
      'Look in the File Explorer window. You see a new file, list.txt.',
      winCheck)
  },

  'terminal-navigate': {
    mac: [].concat(
      macOpen('a folder called a, task.md and test.cjs'),
      macTerminal('terminal-navigate'),
      'Type `pwd` and press Return. It prints the folder you are standing in, ending in terminal-navigate.',
      'Type `cd a/b/c` and press Return. You walked into a, then b, then c.',
      'Type `pwd` and press Return again. Now it ends in /a/b/c.',
      'Type `pwd > here.txt` and press Return. That saves where you stand into here.txt, inside c.',
      'Type `ls` and press Return. You see here.txt and readme.txt.',
      macCheck),
    win: [].concat(
      winOpen('a folder called a, task.md and test.cjs'),
      winTerminal,
      'Type `cd` and press Enter. It prints the folder you are standing in, ending in terminal-navigate.',
      'Type `cd a\\b\\c` and press Enter. You walked into a, then b, then c.',
      'Type `cd` and press Enter again. Now it ends in \\a\\b\\c.',
      'Type `cd > here.txt` and press Enter. That saves where you stand into here.txt, inside c.',
      'Type `dir` and press Enter. You see here.txt and readme.txt.',
      winCheck)
  },

  'terminal-files': {
    mac: [].concat(
      macOpen('style.css, old.html, task.md and test.cjs. Do not touch them in Finder, this task is all terminal'),
      macTerminal('terminal-files'),
      'Type `mkdir site` and press Return. This makes a folder called site.',
      'Type `mkdir site/css` and press Return. This makes a folder css inside site.',
      'Type `echo "<h1>Hi</h1>" > site/index.html` and press Return. This makes a file with words in it.',
      'Type `cp style.css site/css/style.css` and press Return. This copies style.css into site/css.',
      'Type `mv old.html site/about.html` and press Return. This moves old.html into site and renames it about.html.',
      'Type `ls site` and press Return. You see about.html, css and index.html.',
      macCheck),
    win: [].concat(
      winOpen('style.css, old.html, task.md and test.cjs. Do not touch them in File Explorer, this task is all Command Prompt'),
      winTerminal,
      'Type `mkdir site` and press Enter. This makes a folder called site.',
      'Type `mkdir site\\css` and press Enter. This makes a folder css inside site.',
      'Type `echo Hi > site\\index.html` and press Enter. This makes a file with words in it.',
      'Type `copy style.css site\\css\\style.css` and press Enter. It says 1 file(s) copied.',
      'Type `move old.html site\\about.html` and press Enter. This moves old.html into site and renames it about.html.',
      'Type `dir site` and press Enter. You see about.html, css and index.html.',
      winCheck)
  },

  'run-a-program': {
    mac: [].concat(
      macOpen('hello.cjs, task.md and test.cjs'),
      macTerminal('run-a-program'),
      'Type `node hello.cjs` and press Return. It prints one line starting with Hello from OPE.',
      'If it says command not found, go to nodejs.org, download the LTS version and install it. Then close Terminal, open it again the same way and try again.',
      'Type `node hello.cjs > out.txt` and press Return. This time nothing prints: the line went into out.txt.',
      'Type `cat out.txt` and press Return. You see the same line again, read from the file.',
      macCheck),
    win: [].concat(
      winOpen('hello.cjs, task.md and test.cjs'),
      winTerminal,
      'Type `node hello.cjs` and press Enter. It prints one line starting with Hello from OPE.',
      'If it says node is not recognized, go to nodejs.org, download the LTS version and install it. Then close the Command Prompt, open it again the same way and try again.',
      'Type `node hello.cjs > out.txt` and press Enter. This time nothing prints: the line went into out.txt.',
      'Type `type out.txt` and press Enter. You see the same line again, read from the file.',
      winCheck)
  },

  'git-save': {
    mac: [].concat(
      macOpen('note.txt, task.md and test.cjs'),
      'Click note.txt once, then ' + macRightClick + '. Click Open With, then TextEdit.',
      'Press Command and A to select all the words, then type your own words, for example `My own words.`',
      'Press Command and S to save. Press Command and W to close the window.',
      macTerminal('git-save'),
      'Type `git add -A` and press Return. This picks up every change for the checkpoint.',
      macGitTools,
      'Type `git commit -m "practice: my first checkpoint"` and press Return. The message must start with the word practice.',
      macWho,
      'You see a line like 1 file changed. The checkpoint is saved.',
      macCheck),
    win: [].concat(
      winOpen('note.txt, task.md and test.cjs'),
      'Right click note.txt, click Open with, then Notepad.',
      'Press Ctrl and A to select all the words, then type your own words, for example `My own words.`',
      'Press Ctrl and S to save. Close Notepad.',
      winTerminal,
      'Type `git add -A` and press Enter. This picks up every change for the checkpoint.',
      winGitTools,
      'Type `git commit -m "practice: my first checkpoint"` and press Enter. The message must start with the word practice.',
      winWho,
      'You see a line like 1 file changed. The checkpoint is saved.',
      winCheck)
  },

  'git-history': {
    mac: [].concat(
      macOpen('task.md and test.cjs'),
      macTerminal('git-history'),
      'Type `git log --reverse --format=%s` and press Return. It lists the message of every checkpoint, oldest at the top.',
      macGitTools,
      'If the list fills the screen and the last line is just a colon, scroll to the top and read it, then press q to leave the list.',
      'Look at the very top line. That is the first checkpoint ever. Note it exactly, every capital, space and colon.',
      macTextEdit,
      'Type that top line exactly as it appears, nothing else.',
      macSave('answer.txt', ['git-history']),
      macCheck),
    win: [].concat(
      winOpen('task.md and test.cjs'),
      winTerminal,
      'Type `git log --reverse --format=%s` and press Enter. It lists the message of every checkpoint, oldest at the top.',
      winGitTools,
      'If the list fills the screen and the last line is just a colon, scroll to the top and read it, then press q to leave the list.',
      'Look at the very top line. That is the first checkpoint ever. Note it exactly, every capital, space and colon.',
      winNotepad,
      'Type that top line exactly as it appears, nothing else.',
      winSave('answer.txt', ['git-history']),
      winCheck)
  },

  'git-diff': {
    mac: [].concat(
      macOpen('note.txt, task.md and test.cjs'),
      'Click note.txt once, then ' + macRightClick + '. Click Open With, then TextEdit. You see three lines.',
      'Pick one line and change its words to anything else. Leave the other two lines as they are.',
      'Press Command and S to save. Press Command and W to close the window.',
      macTerminal('git-diff'),
      'Type `git diff note.txt` and press Return. It shows what changed in note.txt since the last checkpoint.',
      macGitTools,
      'Find the line that starts with a minus sign, -. That line was taken away. The line starting with + is what you put in. If the last line is just a colon, press q to leave.',
      macTextEdit,
      'Type the taken away line exactly, without the - at the start.',
      macSave('answer.txt', ['git-diff']),
      'Do not save a checkpoint with git commit for this task.',
      macCheck),
    win: [].concat(
      winOpen('note.txt, task.md and test.cjs'),
      'Right click note.txt, click Open with, then Notepad. You see three lines.',
      'Pick one line and change its words to anything else. Leave the other two lines as they are.',
      'Press Ctrl and S to save. Close Notepad.',
      winTerminal,
      'Type `git diff note.txt` and press Enter. It shows what changed in note.txt since the last checkpoint.',
      winGitTools,
      'Find the line that starts with a minus sign, -. That line was taken away. The line starting with + is what you put in. If the last line is just a colon, press q to leave.',
      winNotepad,
      'Type the taken away line exactly, without the - at the start.',
      winSave('answer.txt', ['git-diff']),
      'Do not save a checkpoint with git commit for this task.',
      winCheck)
  },

  'git-undo': {
    mac: [].concat(
      macOpen('recipe.txt, task.md and test.cjs'),
      'Click recipe.txt once, then ' + macRightClick + '. Click Open With, then TextEdit. You see the pancake recipe.',
      'Press Command and A to select everything, then press Delete. The page is empty.',
      'Press Command and S to save. Press Command and W to close the window. The recipe is ruined on purpose.',
      macTerminal('git-undo'),
      'Type `git restore recipe.txt` and press Return.',
      macGitTools,
      'If it says restore is not a git command, type `git checkout -- recipe.txt` and press Return instead.',
      'In Finder double click the git-undo folder to go back inside it.',
      'Open recipe.txt again with TextEdit. The recipe is back, just as it was. Close it with Command and W.',
      macTextEdit,
      'Type the word `done`',
      macSave('done.txt', ['git-undo']),
      macCheck),
    win: [].concat(
      winOpen('recipe.txt, task.md and test.cjs'),
      'Right click recipe.txt, click Open with, then Notepad. You see the pancake recipe.',
      'Press Ctrl and A to select everything, then press Delete. The page is empty.',
      'Press Ctrl and S to save. Close Notepad. The recipe is ruined on purpose.',
      winTerminal,
      'Type `git restore recipe.txt` and press Enter.',
      winGitTools,
      'If it says restore is not a git command, type `git checkout -- recipe.txt` and press Enter instead.',
      'Open recipe.txt again with Notepad. The recipe is back, just as it was. Close Notepad.',
      winNotepad,
      'Type the word `done`',
      winSave('done.txt', ['git-undo']),
      winCheck)
  },

  'door-0': {
    mac: [].concat(
      macOpen('task.md and test.cjs'),
      'In the menu bar click File, then New Folder. Type `door` and press Return.',
      macTextEdit,
      'Type your name.',
      macSave('hello.txt', ['door-0', 'door']),
      macTerminal('door-0'),
      'Type `git add -A` and press Return.',
      macGitTools,
      'Type `git commit -m "door 0: my folder"` and press Return. The message must start with door 0.',
      macWho,
      'Double click the door-0 folder in Finder to go back inside it. You see the door folder.',
      'Click the door folder once, then ' + macRightClick + '. Hold down the Option key and click Copy "door" as Pathname.',
      'Click on the TextEdit window and press Command and N for a new document. Click Format, then Make Plain Text.',
      'Press Command and V to paste. You see a path ending in /door-0/door',
      macSave('where.txt', ['door-0']),
      'Check where.txt sits next to the door folder, not inside it.',
      macCheck),
    win: [].concat(
      winOpen('task.md and test.cjs'),
      'Right click an empty part of the window, click New, then Folder. Type `door` and press Enter.',
      winNotepad,
      'Type your name.',
      winSave('hello.txt', ['door-0', 'door']),
      winTerminal,
      'Type `git add -A` and press Enter.',
      winGitTools,
      'Type `git commit -m "door 0: my folder"` and press Enter. The message must start with door 0.',
      winWho,
      'In File Explorer double click the door folder. Click the address bar at the top, press Ctrl and C, then press Esc.',
      'Click the back arrow at the top left to go back to door-0.',
      'In Notepad click File, then New tab (or New) for an empty page.',
      'Press Ctrl and V to paste. You see a path ending in \\door-0\\door',
      winSave('where.txt', ['door-0']),
      'Check where.txt sits next to the door folder, not inside it.',
      winCheck)
  },

  /* ================================================================ 1 Reader */
  'read-values': { all: [].concat(
    grey('four'),
    'Line 1: `let price = 20;` makes a box called price and puts 20 in it. Write price = 20 on your paper.',
    'Line 2 makes tax from price. Work it out on paper: 20 times 0.1. Write tax = your answer.',
    'Line 3: `price = price + tax;` The right side is worked out first, with the numbers on your paper. The result then replaces what was in price. Cross out the old price and write the new one.',
    'Line 4 makes shown by putting a $ in front of price. Ask yourself: does this line change price, or does it only make something new?',
    'In the text box on the card, write what price is at the end. Then explain each line in your own words, one sentence per line.',
    send) },

  'read-strings': { all: [].concat(
    grey('six'),
    'Lines 1 and 2 put two pieces of text into first and last. Notice ada is all small letters. Write both down.',
    'Line 3: + glues pieces of text together. `\' \'` is a piece of text holding just one space. Glue first, the space, then last, and write full.',
    'Line 4: toUpperCase() gives a copy of full in capital letters. Write loud.',
    'Line 5: slice(0, 3) cuts out part of the text. Under each character of full write its number, starting at 0. The space gets a number too. slice takes from number 0 up to, but not including, number 3. Write short.',
    'Line 6: length counts every character in full, the space too. Count them and write the number.',
    'In the text box, write full, loud, short and the length, and say how you got each one.',
    send) },

  'read-math': { all: [].concat(
    grey('five'),
    'Lines 1 and 2: cookies is 14 and perBox is 4. Write them down.',
    'Line 3: % gives what is left over after dividing. On paper: how many full boxes of 4 fit into 14 cookies? How many cookies are left? That leftover is leftOver.',
    'Line 4: times is done before plus, like in school. Work out 3 times 4 first, then add 2. That is total.',
    'Line 5: brackets go first. Add 7 and 8, then divide by 2. Math.round then rounds to the nearest whole number, and a half rounds up. That is average.',
    'In the text box, write leftOver, total and average, and explain how you got each one.',
    send) },

  'read-if': { all: [].concat(
    grey('eight'),
    'Line 1: canEnter takes one number and calls it age.',
    'Line 2 asks: is age 18 or more? `>=` means more than or the same as. If yes, line 3 gives back yes and the function stops right there.',
    'Line 4 is only reached when line 2 said no. It asks: is age 16 or more? If yes, line 5 gives back with a parent.',
    'Line 7 is only reached when both questions said no.',
    'Try 17. Put 17 in place of age, ask the question on line 2, then on line 4 if you need to. Write down what comes back.',
    'Do the same for 18, then for 12.',
    'In the text box, write all three answers. For each one say which line gave it back and why.',
    send) },

  'read-logic': { all: [].concat(
    grey('seven'),
    'Line 1: canBook takes four things in this order: signedIn, slotsLeft, isOwner, banned.',
    'Line 2: the answer is true only when all three parts joined by && are true. The parts are signedIn, the bracket, and !banned.',
    'The bracket is true when slotsLeft > 0 is true OR isOwner is true. One of them is enough.',
    '!banned flips banned: true becomes false, false becomes true.',
    'Line 5: match the four values to the four names, in order. Write signedIn = true, slotsLeft = 0, isOwner = false, banned = false. Check each of the three parts, then decide true or false.',
    'Do the same for line 6, then line 7.',
    'In the text box, write true or false for each of the three lines, and say which part decided it.',
    send) },

  'read-loop': { all: [].concat(
    grey('six'),
    'Line 1: total starts at 0. Write total = 0.',
    'Line 2 is the loop. `let i = 1` starts i at 1. `i <= 6` means keep going while i is 6 or less. `i++` adds 1 to i after each turn. Write the values i will take in a column down your paper.',
    'Line 3: `i % 2` is what is left after dividing i by 2. `=== 0` asks whether that is exactly 0. That is only true for even numbers.',
    'Line 4 runs only when line 3 says true. It adds i to total.',
    'Go down your column one turn at a time. Next to each i write yes or no for line 3, and when it is yes, write the new total.',
    'The last total in your column is the answer.',
    'In the text box, write the final total and walk through each turn of the loop.',
    send) },

  'read-arrays': { all: [].concat(
    grey('five'),
    'Line 1: queue is a list with two names. Write them in a row, and under each one write its number, starting at 0.',
    'Line 2: push adds Ana to the end of the list. Add her to your row, with her number.',
    'Line 3: `queue[0]` means the item with number 0. Write first.',
    'Line 4: queue.length is how many items the list has now. Work out queue.length minus 1, then find the item with that number. Write last.',
    'Line 5 prints three things with a space between them: the length, first, then last. Write what it prints.',
    'In the text box, write what the last line prints, what queue holds after push, and how first and last were found.',
    send) },

  'read-objects': { all: [].concat(
    grey('nine'),
    'Lines 1 to 5 make one object called shop with named parts: name, open and address. address is an object of its own, with city and zip. Write every part and its value.',
    'Line 7: the dots walk inward. shop.address.city means the city inside the address inside shop. Cross out the old city and write the new one.',
    'Line 8 changes open. Update it on your paper.',
    'Line 9 glues text: shop.name, then ` in `, then the city, then `, open: `, then open. Use your updated notes and write what it prints.',
    'Last, look again at lines 7 and 8. Did any line change zip?',
    'In the text box, write what it prints and what shop.address.zip is at the end.',
    send) },

  'read-function': { all: [].concat(
    grey('four'),
    'Line 1: initials takes one thing and calls it name. Here name will be "Ada Lovelace".',
    'Line 2: `split(\' \')` cuts the text wherever there is a space and makes a list of the pieces. Write the list you get from "Ada Lovelace".',
    'Line 3, first part: map goes through each piece of the list. `p[0]` is the first letter of the piece, because counting starts at 0. toUpperCase() makes it a capital. Write the new list of letters.',
    'Line 3, last part: `join(\'\')` glues the list into one piece of text with nothing in between. Write the result.',
    'return gives that result back to whoever called initials.',
    'In the text box, say what initials takes, what it gives back, and what initials("Ada Lovelace") is.',
    send) },

  'read-return': { all: [].concat(
    grey('eleven'),
    'Lines 1 to 3: addAndPrint shows a + b on the screen with console.log. Look closely: there is no return line in it.',
    'Lines 5 to 7: addAndReturn prints nothing. It hands a + b back with return.',
    'Line 9 runs addAndPrint(2, 3). Something is printed right then. Write it as the first printed line. x gets whatever the function hands back, and a function with no return hands back undefined, which means no value.',
    'Line 10 runs addAndReturn(2, 3). Is anything printed? What does y get?',
    'Line 11 prints x and y with a space between. Write the second printed line.',
    'In the text box, write what it prints in order, what x and y hold, and why they are different.',
    send) },

  'read-callbacks': { all: [].concat(
    grey('three'),
    'Line 1: prices is a list of four numbers. Write them down.',
    'Line 2: `p => p > 5` is a small function. It takes one number p and says true if p is more than 5.',
    'filter runs that small function on each price in turn and keeps only the ones that said true, in the same order. Mark each price true or false, then write big.',
    'Line 3: `p => p * 2` takes a number and gives back double. map runs it on each item of big and makes a new list of the answers. Write doubled.',
    'Ask yourself: did any line change prices itself, or did filter and map make new lists?',
    'In the text box, write big and doubled, and say whether prices changed.',
    send) },

  'read-flow': { all: [].concat(
    grey('fifteen'),
    'Line 1: cart starts as an empty list. Write cart = [ ].',
    'Lines 3 to 5 and lines 7 to 11 only define two functions, add and total. Defining is like writing a recipe: nothing is cooked yet. Skip them for now.',
    'Line 13 is the first line that runs something: add(\'Coffee\', 3). Jump up to add. push puts a thing with that name and price at the end of cart. Write what cart holds now.',
    'Line 14 does the same for Cake. Update cart on your paper.',
    'Line 15: cart.length is how many things are in cart. total() jumps up to line 7: sum starts at 0 and the loop adds each price. Work out sum.',
    'Put line 15 together: the number, then ` things, $`, then the total. Write what it prints.',
    'In the text box, write what it prints, then list the line numbers in the order they really run.',
    send) },

  'door-1': { all: [].concat(
    grey('eighteen'),
    'Lines 1 to 5 make a list called people with three people. Each has a name and an age. Copy them onto your paper.',
    'Lines 7 to 11 only define label. It takes one person. The first if: age 18 or more gives the name plus (adult) and stops. The second if: 16 or more gives the name plus (16+). If neither, the name plus (child).',
    'Line 13: adults starts at 0.',
    'Line 14 is a loop. p is each person in turn: Sam, then Lee, then Ana.',
    'Line 15: if this person is 18 or more, `adults++` adds 1 to adults.',
    'Line 16 prints label(p). Use your notes on label to work out the line for this person.',
    'Do lines 15 and 16 for Sam, then Lee, then Ana. Each time write the printed line and the adults count.',
    'Line 18 runs once, after the loop is finished. It prints adults and the word adult.',
    'In the text box, write every printed line in order. Then explain the label function, what each if decides, and what the loop does, in order.',
    send) }

  });
})();
