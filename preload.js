const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    switchToPanel: () => ipcRenderer.send('switch-to-panel'),
    switchToBall: () => ipcRenderer.send('switch-to-ball'),
    showContextMenu: () => ipcRenderer.send('show-context-menu'), // 【新增】触发右键菜单
    onFocusTextarea: (callback) => ipcRenderer.on('focus-textarea', callback),
    // 🌟 增加这两个监听，让右键菜单的“显示/隐藏”点击能通知到前端
    onExecuteCollapse: (callback) => ipcRenderer.on('execute-collapse', callback),
    onExecuteExpand: (callback) => ipcRenderer.on('execute-expand', callback)
});