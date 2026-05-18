const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // 获取当前主屏幕
    const primaryDisplay = screen.getPrimaryDisplay();
    // 使用 workArea 确保适配了任务栏/导航栏的位置
    const { x: workX, y: workY, width: screenWidth } = primaryDisplay.workArea;
    
    const winWidth = 400;
    const winHeight = 300;
    
    // 精准计算右上角位置
    const winX = workX + screenWidth - winWidth;
    const winY = workY;

    mainWindow = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        x: winX, 
        y: winY, 
        frame: false,             // 无边框
        transparent: true,       // 透明背景
        alwaysOnTop: true,       // 初始置顶
        skipTaskbar: true,       // (可选) 不在任务栏/Dock栏显示，更像一个纯粹的组件
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // 现代 Electron 推荐开启安全策略
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');

    // 针对 macOS 的高级置顶与跨虚拟桌面（Space）配置
    if (process.platform === 'darwin') {
        // 允许窗口在全屏应用和所有虚拟桌面上方显示
        mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        // 设置极高层级
        mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
        // 避免全屏切换时动画导致的闪烁
        app.dock.hide(); // 隐藏 Dock 图标，让它彻底变成后台常驻挂件
    }

    // 监听窗口被销毁
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 确保只运行单例（防止重复启动多个应用实例）
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.on('ready', createWindow);
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});