const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    switchToPanel: () => ipcRenderer.send('switch-to-panel'),
    switchToBall: () => ipcRenderer.send('switch-to-ball')
});