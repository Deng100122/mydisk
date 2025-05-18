// 主题设置
document.addEventListener('DOMContentLoaded', () => {
    // 检测系统主题偏好
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 从本地存储获取用户主题设置，如果没有则使用系统偏好
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // 应用主题
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
    
    // 主题切换按钮事件
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // 监听系统主题变化
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.setAttribute('data-theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
            }
        }
    });
    
    // 初始化文件列表
    loadFilesFromDirectory();
    
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            searchClear.classList.remove('hidden');
            filterFiles(searchTerm);
        } else {
            searchClear.classList.add('hidden');
            resetFileList();
        }
    });
    
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.add('hidden');
        resetFileList();
        searchInput.focus();
    });
});

// 从目录加载文件列表
async function loadFilesFromDirectory() {
    const fileList = document.getElementById('file-list');
    
    try {
        // 显示加载中状态
        fileList.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>加载文件列表...</span>
            </div>
        `;
        
        // 获取files目录内容
        const response = await fetch('files/');
        
        if (!response.ok) {
            throw new Error('无法获取文件列表');
        }
        
        const html = await response.text();
        
        // 解析目录HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 获取所有链接元素（文件链接）
        const links = Array.from(doc.querySelectorAll('a')).filter(a => {
            // 过滤掉父目录链接和非文件链接
            const href = a.getAttribute('href');
            return href && !href.endsWith('/') && href !== '../';
        });
        
        // 清空文件列表
        fileList.innerHTML = '';
        
        // 如果没有文件
        if (links.length === 0) {
            fileList.innerHTML = `
                <div class="no-files">
                    <i class="fas fa-folder-open"></i>
                    <p>没有可用的文件</p>
                </div>
            `;
            return;
        }
        
        // 处理每个文件链接
        links.forEach(link => {
            const fileName = decodeURIComponent(link.textContent.trim());
            const filePath = 'files/' + link.getAttribute('href');
            
            // 获取文件大小和日期（如果可用）
            let fileSize = '未知';
            let fileDate = '未知';
            
            // 尝试从链接的父元素获取文件信息
            const parentRow = link.closest('tr');
            if (parentRow) {
                const columns = parentRow.querySelectorAll('td');
                if (columns.length >= 3) {
                    fileSize = columns[1].textContent.trim();
                    fileDate = columns[2].textContent.trim();
                }
            }
            
            // 创建文件项
            const fileItem = createFileItem({
                name: fileName,
                path: filePath,
                size: fileSize,
                date: fileDate,
                type: getFileTypeFromName(fileName)
            });
            
            fileList.appendChild(fileItem);
        });
    } catch (error) {
        console.error('加载文件列表失败:', error);
        fileList.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>加载文件列表失败</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// 根据文件名获取文件类型
function getFileTypeFromName(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'xls': 'excel',
        'xlsx': 'excel',
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'svg': 'image',
        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'wmv': 'video',
        'mp3': 'audio',
        'wav': 'audio',
        'ogg': 'audio',
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive',
        'tar': 'archive',
        'gz': 'archive',
        'html': 'code',
        'css': 'code',
        'js': 'code',
        'php': 'code',
        'py': 'code',
        'java': 'code',
        'c': 'code',
        'cpp': 'code'
    };
    
    return typeMap[extension] || 'file';
}

// 创建文件项元素
function createFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.name = file.name.toLowerCase();
    
    // 根据文件类型选择图标
    const iconClass = getFileIconClass(file.type);
    
    fileItem.innerHTML = `
        <div class="file-name">
            <i class="${iconClass} file-icon"></i>
            <span>${file.name}</span>
        </div>
        <div class="file-size">${file.size}</div>
        <div class="file-date">${file.date}</div>
        <div class="file-actions">
            <button class="file-action-btn download-btn" title="下载文件">
                <i class="fas fa-download"></i>
            </button>
            <button class="file-action-btn copy-link-btn" title="复制链接">
                <i class="fas fa-link"></i>
            </button>
        </div>
    `;
    
    // 添加下载事件
    const downloadBtn = fileItem.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => {
        downloadFile(file);
    });
    
    // 添加复制链接事件
    const copyLinkBtn = fileItem.querySelector('.copy-link-btn');
    copyLinkBtn.addEventListener('click', () => {
        copyFileLink(file);
    });
    
    return fileItem;
}

// 根据文件类型获取对应的图标类
function getFileIconClass(fileType) {
    switch (fileType) {
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'word':
            return 'fas fa-file-word';
        case 'excel':
            return 'fas fa-file-excel';
        case 'powerpoint':
            return 'fas fa-file-powerpoint';
        case 'image':
            return 'fas fa-file-image';
        case 'video':
            return 'fas fa-file-video';
        case 'audio':
            return 'fas fa-file-audio';
        case 'archive':
            return 'fas fa-file-archive';
        case 'code':
            return 'fas fa-file-code';
        default:
            return 'fas fa-file';
    }
}

// 下载文件
function downloadFile(file) {
    console.log(`下载文件: ${file.name}`);
    
    // 创建一个临时链接并模拟点击
    const link = document.createElement('a');
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示通知
    showNotification(`文件 "${file.name}" 开始下载`);
}

// 复制文件链接
function copyFileLink(file) {
    // 获取完整的文件URL
    const fileUrl = `${window.location.origin}/${file.path}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(fileUrl)
        .then(() => {
            showNotification(`文件链接已复制到剪贴板`);
        })
        .catch(err => {
            console.error('复制失败:', err);
            showNotification(`复制失败，请手动复制`, 'error');
        });
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const icon = notification.querySelector('i');
    
    // 设置消息
    notificationMessage.textContent = message;
    
    // 设置图标
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // 显示通知
    notification.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 搜索过滤文件
function filterFiles(searchTerm) {
    const fileItems = document.querySelectorAll('.file-item');
    let hasResults = false;
    
    fileItems.forEach(item => {
        const fileName = item.dataset.name;
        if (fileName.includes(searchTerm)) {
            item.style.display = '';
            hasResults = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // 如果没有搜索结果
    const fileList = document.getElementById('file-list');
    const noResults = document.querySelector('.no-results');
    
    if (!hasResults) {
        if (!noResults) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <p>没有找到匹配 "${searchTerm}" 的文件</p>
            `;
            fileList.appendChild(noResultsDiv);
        }
    } else if (noResults) {
        noResults.remove();
    }
}

// 重置文件列表
function resetFileList() {
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.style.display = '';
    });
    
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.remove();
    }
}

// 添加刷新按钮功能
document.addEventListener('DOMContentLoaded', () => {
    // 创建刷新按钮
    const header = document.querySelector('header');
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'refresh-btn';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    refreshBtn.title = '刷新文件列表';
    header.appendChild(refreshBtn);
    
    // 添加刷新按钮样式
    const style = document.createElement('style');
    style.textContent = `
        .refresh-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            transition: transform 0.3s, background-color 0.3s;
            margin-left: 10px;
        }
        
        .refresh-btn:hover {
            background-color: var(--hover-color);
        }
        
        .refresh-btn.rotating i {
            animation: rotating 1s linear infinite;
        }
        
        @keyframes rotating {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
        }
        
        .header-controls {
            display: flex;
            align-items: center;
        }
    `;
    document.head.appendChild(style);
    
    // 重新组织header结构
    const logo = header.querySelector('.logo');
    const themeToggle = header.querySelector('.theme-toggle');
    
    header.innerHTML = '';
    header.appendChild(logo);
    
    const headerControls = document.createElement('div');
    headerControls.className = 'header-controls';
    headerControls.appendChild(refreshBtn);
    headerControls.appendChild(themeToggle);
    header.appendChild(headerControls);
    
    // 添加刷新事件
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('rotating');
        loadFilesFromDirectory().finally(() => {
            setTimeout(() => {
                refreshBtn.classList.remove('rotating');
            }, 500);
        });
    });
});
