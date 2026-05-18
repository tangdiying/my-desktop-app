const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// 定义两个状态的尺寸
const BALL_SIZE = 50;   // 悬浮球大小 (50x50)
const PANEL_WIDTH = 400; // 展开后的面板宽度
const PANEL_HEIGHT = 300; // 展开后的面板高度

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x: workX, y: workY, width: screenWidth } = primaryDisplay.workArea;
    
    const padding = 10; 
    // 初始状态是悬浮球，计算悬浮球在右上角的位置
    const winX = workX + screenWidth - BALL_SIZE - padding;
    const winY = workY + padding;

    mainWindow = new BrowserWindow({
        width: BALL_SIZE,     // 初始为悬浮球宽度
        height: BALL_SIZE,    // 初始为悬浮球高度
        x: winX, 
        y: winY, 
        frame: false,            
        transparent: true,       
        hasShadow: false,     // 悬浮球状态下可以先关闭阴影，展开时再打开
        resizable: false,        
        alwaysOnTop: true,
        webPreferences: {
            // 确保 preload.js 存在，用于桥接通信
            preload: path.join(__dirname, 'preload.js'), 
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

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


// --- IPC 进程间通信监听 ---
// 1. 切换到面板状态（展开）
ipcMain.on('switch-to-panel', () => {
    if (!mainWindow) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x: workX, y: workY, width: screenWidth } = primaryDisplay.workArea;
    const padding = 10;

    // 重新计算长方形面板的左上角 X 坐标，让它向左扩展而保持右上角对齐
    const newX = workX + screenWidth - PANEL_WIDTH - padding;
    
    mainWindow.setHasShadow(true); // 展开时开启阴影
    mainWindow.setBounds({
        x: newX,
        y: workY + padding,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT
    }, true); // true 表示启用平滑动画过渡 (Mac 上有效)
});

// 2. 切换到悬浮球状态（收起）
ipcMain.on('switch-to-ball', () => {
    if (!mainWindow) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x: workX, y: workY, width: screenWidth } = primaryDisplay.workArea;
    const padding = 10;

    // 重新计算圆球的 X 坐标，缩回右上角
    const newX = workX + screenWidth - BALL_SIZE - padding;

    mainWindow.setHasShadow(false); // 收起时关闭阴影
    mainWindow.setBounds({
        x: newX,
        y: workY + padding,
        width: BALL_SIZE,
        height: BALL_SIZE
    }, true);
});