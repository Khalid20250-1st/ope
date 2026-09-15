// The small door between the OPE page and the window. The page talks to the
// same Node bridge as the browser twin; only these few things need the window.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('opeDesktop', {
  token: ipcRenderer.sendSync('ope-token'),
  platform: process.platform,
  call: msg => ipcRenderer.invoke('ope', msg),
});
