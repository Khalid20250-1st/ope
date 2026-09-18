/* THE SKILL LIST. Fixed, in order, the same for everybody.

   Eight stages from never having opened a terminal to reviewing and rejecting
   an AI's code. Every project in the world uses the same handful of things:
   values, ifs, loops, functions, data, errors. The list is those things in the
   order they can be learned. The practice comes from your own project; only the
   list is fixed.

   A skill id is what the AI coder writes into ope-learn/tags.json, so the ids
   never change once they are published. Add at the end of a stage, never rename. */
window.OPESkills = [
  {n: 0, name: 'Computer', can: 'use files, folders, the terminal and git', ai: true, skills: [
    {id: 'files-folders', name: 'Files and folders'},
    {id: 'paths',         name: 'Where a file lives: its path'},
    {id: 'terminal',      name: 'Running a command in the terminal'},
    {id: 'git-save',      name: 'Saving a checkpoint with git'},
    {id: 'git-history',   name: 'Reading the history'}
  ]},
  {n: 1, name: 'Reader', can: 'read code and say what it does', ai: true, skills: [
    {id: 'read-values',    name: 'Values and variables'},
    {id: 'read-if',        name: 'An if and an else'},
    {id: 'read-loop',      name: 'A loop'},
    {id: 'read-function',  name: 'A function: what goes in, what comes out'},
    {id: 'read-flow',      name: 'Following a whole file from top to bottom'}
  ]},
  {n: 2, name: 'Tweaker', can: 'change values, conditions and text without breaking anything', ai: true, skills: [
    {id: 'tweak-value',     name: 'Changing a value'},
    {id: 'tweak-condition', name: 'Changing a condition'},
    {id: 'tweak-text',      name: 'Changing what the person sees'},
    {id: 'tweak-data',      name: 'Adding to a list or an object'},
    {id: 'tweak-loop',      name: 'Changing how many times a loop runs'}
  ]},
  {n: 3, name: 'Writer', can: 'write small pieces that pass a test', ai: true, skills: [
    {id: 'write-function', name: 'Writing a function that returns something'},
    {id: 'write-if',       name: 'Writing the decision'},
    {id: 'write-loop',     name: 'Writing the loop'},
    {id: 'write-data',     name: 'Working with lists and objects'},
    {id: 'write-errors',   name: 'Handling what goes wrong'}
  ]},
  {n: 4, name: 'Builder', can: 'build a small program from a blank file', ai: false, skills: [
    {id: 'build-blank',     name: 'A program from a blank file'},
    {id: 'build-split',     name: 'Splitting it into functions'},
    {id: 'build-files',     name: 'Reading and writing files'},
    {id: 'build-async',     name: 'Waiting for something: async and await'},
    {id: 'build-app',       name: 'A small app with its own tests'}
  ]},
  {n: 5, name: 'Debugger', can: 'find and fix bugs, planted and real', ai: false, skills: [
    {id: 'debug-error',     name: 'Reading an error message'},
    {id: 'debug-off-by-one', name: 'The off by one'},
    {id: 'debug-condition', name: 'The wrong condition'},
    {id: 'debug-async',     name: 'The missing await'},
    {id: 'debug-state',     name: 'Something changed that should not have'}
  ]},
  {n: 6, name: 'Designer', can: 'plan data, functions and structure before any code', ai: false, skills: [
    {id: 'design-data',     name: 'The shape of the data'},
    {id: 'design-api',      name: 'What each function takes and gives back'},
    {id: 'design-modules',  name: 'Which file does which job'},
    {id: 'design-plan',     name: 'A plan before the code'},
    {id: 'design-tradeoff', name: 'Choosing between two ways, and saying why'}
  ]},
  {n: 7, name: 'Elite', can: 'review AI code, reject bad code and explain why', ai: false, skills: [
    {id: 'elite-review',   name: 'Reviewing code somebody else wrote'},
    {id: 'elite-reject',   name: 'Rejecting code, with the reason'},
    {id: 'elite-security', name: 'Spotting the hole an attacker would use'},
    {id: 'elite-speed',    name: 'Making slow code fast'},
    {id: 'elite-system',   name: 'Explaining the whole system'}
  ]}
];

/* the list flattened, each skill knowing its stage and its place */
window.OPESkills.all = function(){
  var out = [];
  window.OPESkills.forEach(function(st){
    st.skills.forEach(function(sk, i){ out.push({id: sk.id, name: sk.name, stage: st.n, stageName: st.name, index: i}); });
  });
  return out;
};
