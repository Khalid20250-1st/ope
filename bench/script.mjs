// The job both runs are given, word for word. The only difference is that the
// OPE run pastes the OPE prompt first and names each change by its number, the
// way someone using OPE would.
export const SPEC = `Build me a small task tracker. It is a Node.js app with no npm packages: start it with \`node server.js\`, it listens on the port in the PORT environment variable (default 3000). It stores tasks in a SQLite file called data.db using Node's built-in node:sqlite module. JSON API:
- POST /tasks with {"title"} creates a task and returns it with status 201: {"id", "title", "done": false}
- GET /tasks returns an array of all tasks
- PATCH /tasks/:id with {"done": true or false} updates it and returns it
- DELETE /tasks/:id deletes it and returns 204
- GET / serves a simple web page to add, tick and delete tasks.`;

export const STEPS = [
  { n: '1.0', kind: 'build', text: SPEC },
  { n: '1.1', kind: 'idea', text: 'New idea: every task can have a due date. POST and PATCH accept "due" as YYYY-MM-DD, tasks return "due" (null when not set), and GET /tasks?due=YYYY-MM-DD returns only tasks due that day.' },
  { n: '1.2', kind: 'idea', text: 'Another idea: tags. POST accepts "tags" as an array of strings, tasks return "tags" (an empty array when there are none), and GET /tasks?tag=work returns only tasks with that tag.' },
  { n: '1.3', kind: 'database', seedBefore: true, text: 'I need a priority on tasks, 1 (high) to 3 (low). Tasks already in data.db must keep working and get priority 2. POST and PATCH accept "priority", tasks return it, new tasks default to 2, and anything outside 1 to 3 is rejected with 400.' },
  { n: '1.4', kind: 'idea', text: 'One more idea: GET /stats returns {"total": number, "done": number}.' },
  { n: '1.5', kind: 'bug', text: 'Bug: I can create a task with an empty title, or a title that is only spaces. That should be a 400 with {"error": "..."}.' },
  { n: '1.6', kind: 'bug', text: 'Bug: PATCH or DELETE on a task id that does not exist should return 404, not succeed.' },
  { n: '1.7', kind: 'bug', text: 'Bug: GET /tasks should list tasks that are not done first, then done ones, each group oldest first.' },
  { n: 'end', kind: 'finish', text: 'That is everything for now. Make sure it all works before you finish.' },
];

export const REPLIES = {
  plan: 'Yes, build. It is free and needs no accounts. Take all the a.',
  handoff: 'I cannot do that part. Do it yourself and carry on.',
  question: 'Use your best judgement and carry on.',
};
