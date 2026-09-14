<img src="logo/png/icon-white-512.png" width="96" alt="OPE">

# OPE

**Out Past Engineering.** See the app your AI built, version by version.

OPE is a free Mac app for vibe coders: people who build software by talking to an
AI coder, and who can't see what is behind the screen. Give your AI the OPE
prompt, build in numbered versions, then open the project in OPE and see exactly
which folders, files and lines each version made.

![A version picked: the folders it touched are boxed in green](docs/version.png)

## How it works

1. **Copy the prompt.** OPE opens with a prompt you give your AI coder (Claude
   Code, Cursor, Codex, anything that edits files) once per project. It teaches
   the AI to build in numbered versions, 1.0, 1.1, 1.2, and to save a checkpoint
   at the end of each one.
2. **Build.** Tell your AI: "project 1.0, build me ...". Then "project 1.1, add ...".
3. **Open the folder in OPE.** Pick a project, then a version.
   - Every folder that version touched gets a **green box**.
   - Open a folder and the files it touched are boxed.
   - Open a file and the **lines that version wrote** are boxed.
4. **Fix it right there.** Edit the code, press Save (⌘S), and the real file
   changes. Press Checkpoint to keep your edit as its own save point.

Keep every project folder you have in the Projects list. The open one expands to
show its numbered projects, and any other opens with one click. The list is kept
on your Mac only.

OPE watches the folder. When your AI writes files or saves a new version, OPE
updates on its own.

![A file open: the lines from version 1.1 are boxed in green](docs/lines.png)

## Projects built without the prompt

They still open. The files always show. If the folder has a git history, every
commit shows as a step. If it has none, OPE offers to start tracking it as 1.0.

## Install

Download `OPE.dmg` from [Releases](../../releases), open it, and drag OPE into
Applications. OPE needs macOS 13 or newer and git, which comes with Apple's
command line tools (`xcode-select --install`).

## Build it yourself

```
npm install
zsh scripts/build.sh      # builds build/OPE.app and copies it to ~/Applications
```

Working on the interface in a browser:

```
OPE_ROOT=/path/to/a/project npm run dev    # then open http://localhost:8790
```

## How it is made

| Part | What it does |
|---|---|
| `mac/main.swift` | The Mac window. Serves the interface from inside the app, opens folders, reads and writes files, runs git, watches the folder for changes |
| `web/` | The interface: projects, versions, files and code. The code view is [Monaco](https://github.com/microsoft/monaco-editor), the editor inside VS Code, bundled so OPE works offline |
| `web/git.js` | Versions are git tags named `1.0`, `1.1`. What a version touched is the difference from the version before it. Which lines it wrote comes from `git blame` on the file as it is now |
| `prompt/OPE-PROMPT.md` | The prompt your AI coder follows |
| `scripts/dev-server.mjs` | Runs the same interface in a browser, answering the same commands the Mac app does |

Your code never leaves your Mac. OPE has no account, no server and no tracking.

## Coming soon

**OPE Chat:** ask OPE about your project and build the next version without
leaving the app.

## Licence

MIT
