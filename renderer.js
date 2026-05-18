const textKey = 'memo_saved_content';
const textarea = document.getElementById('problemText');
const statusTip = document.getElementById('status');

// 1. 页面一加载，自动读取之前保存的内容
window.addEventListener('DOMContentLoaded', () => {
    const savedContent = localStorage.getItem(textKey);
    if (savedContent) {
        textarea.value = savedContent;
        showStatus('已加载历史内容');
    }
});

// 2. 点击保存按钮执行的操作
function saveProblem() {
    const content = textarea.value;
    localStorage.setItem(textKey, content);
    showStatus('保存成功！');
}

// 3. 增强体验：支持 Ctrl+S / Cmd+S 快捷键保存
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // 阻止浏览器默认保存网页的行为
        saveProblem();
    }
});

// 状态提示动效
function showStatus(msg) {
    statusTip.textContent = msg;
    statusTip.style.opacity = '1';
    // 3秒后提示文字半透明淡化
    setTimeout(() => {
        statusTip.style.opacity = '0.5';
    }, 3000);
}