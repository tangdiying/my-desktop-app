const textKey = 'memo_saved_content';
const textarea = document.getElementById('problemText');
const statusTip = document.getElementById('status');

// 页面加载，自动读取数据
window.addEventListener('DOMContentLoaded', () => {
    const savedContent = localStorage.getItem(textKey);
    if (savedContent) {
        textarea.value = savedContent;
        showStatus('已加载历史内容');
    }
});

// 保存数据
function saveProblem() {
    const content = textarea.value;
    localStorage.setItem(textKey, content);
    showStatus('保存成功！');
}

// 展开面板
function expandToPanel() {
    document.body.className = 'is-panel'; // 切换前端样式
    window.electronAPI.switchToPanel();   // 放大主窗口
}

// 收起为悬浮球
function collapseToBall() {
    // 收起的时候，自动顺便保存一下，体验极佳
    saveProblem();
    
    document.body.className = 'is-ball';  // 切换前端样式
    window.electronAPI.switchToBall();    // 缩小主窗口
}

// 支持快捷键保存
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProblem();
    }
});

function showStatus(msg) {
    statusTip.textContent = msg;
    statusTip.style.opacity = '1';
    setTimeout(() => { statusTip.style.opacity = '0.5'; }, 3000);
}