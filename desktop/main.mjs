// OPE for Windows. The window is Electron; everything behind it is the same
// Node bridge the interface is built against (scripts/dev-server.mjs), run in
// this process on 127.0.0.1 with a secret token, so only this window reaches it.
import { app, BrowserWindow, ipcMain, dialog, clipboard, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import net from 'node:net';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = app.isPackaged ? join(process.resourcesPath, 'ope') : join(HERE, '..');
const CHECK = process.argv.includes('--self-check');
const TOKEN = randomBytes(24).toString('hex');
let win = null, url = '';

if (!CHECK && !app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

function freePort(){
  return new Promise((ok, bad) => {
    const s = net.createServer().once('error', bad);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => ok(port)); });
  });
}

async function startBridge(){
  // the check keeps its library away from the person's real one
  if (CHECK) process.env.HOME = process.env.USERPROFILE = mkdtempSync(join(tmpdir(), 'ope-home-'));
  const port = await freePort();
  process.env.PORT = String(port);
  process.env.OPE_TOKEN = TOKEN;
  await import(pathToFileURL(join(BASE, 'scripts', 'dev-server.mjs')).href);
  url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(url + '/')).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error('The OPE bridge did not start.');
}

function hasGit(){
  try { execFileSync('git', ['--version'], { stdio: 'ignore', windowsHide: true }); return true; } catch { return false; }
}

ipcMain.on('ope-token', e => { e.returnValue = TOKEN; });
ipcMain.handle('ope', async (e, msg) => {
  switch (msg && msg.cmd) {
    case 'pick': {
      const r = await dialog.showOpenDialog(win, { title: 'Open a project', properties: ['openDirectory'] });
      return r.canceled || !r.filePaths[0] ? {} : { path: r.filePaths[0] };
    }
    case 'copy': clipboard.writeText(String(msg.text ?? '')); return { ok: true };
    case 'chatOpen': {
      if (typeof msg.url === 'string' && /^https:\/\//.test(msg.url)) { await shell.openExternal(msg.url); return { ok: true }; }
      const ollama = join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama app.exe');
      if (existsSync(ollama)) { spawn(ollama, [], { detached: true, stdio: 'ignore' }).unref(); return { ok: true }; }
      return { ok: false };
    }
    default: return { error: 'Unknown command' };
  }
});

function createWindow(){
  win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 900, minHeight: 560,
    backgroundColor: '#000000', title: 'OPE', show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#000000', symbolColor: '#FFFFFF', height: 40 },
    autoHideMenuBar: true,
    webPreferences: { preload: join(HERE, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  // links leave the app for the real browser; the window itself never navigates away
  win.webContents.setWindowOpenHandler(({ url: u }) => { if (/^https:\/\//.test(u)) shell.openExternal(u); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, u) => { if (!u.startsWith(url)) { e.preventDefault(); if (/^https:\/\//.test(u)) shell.openExternal(u); } });
  win.once('ready-to-show', () => { if (!CHECK) win.show(); });
  return win.loadURL(url);
}

/* --self-check: proves a built copy works end to end with no person at the
   screen. A tiny git project with version 1.0 and 1.1, then the window's own
   bridge opens it, reads the versions, lists files and adds the OPE system. */
async function selfCheck(){
  // a Windows window app has no console, so the result also goes to a file when asked
  const out = line => { console.log(line); if (process.env.OPE_CHECK_LOG) appendFileSync(process.env.OPE_CHECK_LOG, line + '\n'); };
  const say = (ok, what) => { out((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) throw new Error(what); };
  const dir = mkdtempSync(join(tmpdir(), 'ope-check-'));
  const g = (...a) => execFileSync('git', ['-C', dir, ...a], { stdio: 'pipe', windowsHide: true }).toString();
  try {
    say(hasGit(), 'git is installed');
    g('init', '-q'); g('config', 'user.email', 'check@ope.local'); g('config', 'user.name', 'OPE check');
    writeFileSync(join(dir, 'index.html'), '<h1>one</h1>\n'); g('add', '-A'); g('commit', '-qm', 'one'); g('tag', '1.0');
    writeFileSync(join(dir, 'app.js'), 'console.log(1)\n'); g('add', '-A'); g('commit', '-qm', 'two'); g('tag', '1.1');

    await createWindow();
    const call = (cmd, extra = {}) => win.webContents.executeJavaScript(`OPEBridge.call(${JSON.stringify(cmd)}, ${JSON.stringify(extra)})`);
    say(await win.webContents.executeJavaScript('typeof window.opeDesktop === "object" && !!document.getElementById("ope")'), 'the window loads the OPE page');
    const hello = await call('hello'); say(hello.kind === 'desktop', 'the bridge answers hello');
    const blocked = await fetch(url + '/bridge', { method: 'POST', body: '{"cmd":"hello"}' }); say(blocked.status === 403, 'the bridge refuses calls with no token');
    const opened = await call('open', { path: dir }); say(!!opened.root, 'opens a project');
    const tags = await call('git', { args: ['for-each-ref', '--format=%(refname:short)', 'refs/tags'] });
    say(/1\.0/.test(tags.out) && /1\.1/.test(tags.out), 'reads versions 1.0 and 1.1');
    const files = await call('list'); say(files.files.includes('index.html') && files.files.includes('app.js'), 'lists files with forward slashes');
    const read = await call('read', { path: 'app.js' }); say(/console/.test(read.text || ''), 'reads a file');
    const inst = await call('install'); say(inst.added.includes('AGENTS.md') && existsSync(join(dir, 'ope-system')), 'adds the OPE system');
    if (process.env.OPE_SHOT) {
      win.showInactive(); win.reload();
      await new Promise(r => setTimeout(r, 4000));
      writeFileSync(process.env.OPE_SHOT, (await win.webContents.capturePage()).toPNG());
      out('saved a picture of the window');
    }
    out('OPE self-check passed');
    return 0;
  } catch (e) { out('OPE self-check failed: ' + e.message); return 1; }
  finally { try { rmSync(dir, { recursive: true, force: true }); } catch {} }
}

app.whenReady().then(async () => {
  try { await startBridge(); }
  catch (e) { dialog.showErrorBox('OPE', e.message); return app.exit(1); }
  if (CHECK) return app.exit(await selfCheck());
  if (!hasGit()) {
    const r = await dialog.showMessageBox({ type: 'warning', title: 'OPE needs Git',
      message: 'OPE reads your versions with Git, and Git is not installed.',
      detail: 'Install Git for Windows, then open OPE again.', buttons: ['Get Git', 'Open OPE anyway'], defaultId: 0 });
    if (r.response === 0) shell.openExternal('https://git-scm.com/download/win');
  }
  await createWindow();
});
app.on('window-all-closed', () => app.quit());
