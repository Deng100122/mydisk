// 上传功能相关JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // 初始化上传表单
    initUploadForm();
});

// 初始化上传表单
function initUploadForm() {
    const uploadToggle = document.getElementById('upload-toggle');
    const uploadFormContainer = document.getElementById('upload-form-container');
    const fileInput = document.getElementById('file-input');
    const selectedFileContainer = document.getElementById('selected-file-container');
    const selectedFileName = document.getElementById('selected-file-name');
    const clearFileButton = document.getElementById('clear-file');
    const uploadButton = document.getElementById('upload-button');
    const progressBar = document.getElementById('progress-bar');
    const uploadStatus = document.getElementById('upload-status');
    
    // 切换上传表单显示/隐藏
    uploadToggle.addEventListener('click', () => {
        uploadFormContainer.classList.toggle('show');
        const isVisible = uploadFormContainer.classList.contains('show');
        uploadToggle.innerHTML = isVisible ? 
            '<i class="fas fa-chevron-up"></i> 隐藏上传表单' : 
            '<i class="fas fa-chevron-down"></i> 显示上传表单';
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            selectedFileName.textContent = file.name;
            selectedFileContainer.classList.remove('hidden');
            uploadButton.disabled = false;
            
            // 显示文件大小
            const fileSize = formatFileSize(file.size);
            selectedFileName.textContent = `${file.name} (${fileSize})`;
        } else {
            clearFileSelection();
        }
    });
    
    // 清除文件选择
    clearFileButton.addEventListener('click', () => {
        clearFileSelection();
    });
    
    // 上传文件
    uploadButton.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            uploadFile(fileInput.files[0]);
        }
    });
    
    // 清除文件选择
    function clearFileSelection() {
        fileInput.value = '';
        selectedFileContainer.classList.add('hidden');
        uploadButton.disabled = true;
        progressBar.style.width = '0%';
        uploadStatus.textContent = '';
    }
    
    // 上传文件
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        // 禁用上传按钮
        uploadButton.disabled = true;
        uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
        
        // 创建 XMLHttpRequest
        const xhr = new XMLHttpRequest();
        
        // 上传进度
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
                uploadStatus.textContent = `上传中... ${Math.round(percentComplete)}%`;
            }
        });
        
        // 上传完成
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.status === 'success') {
                    showNotification(response.message);
                    clearFileSelection();
                    
                    // 刷新文件列表
                    loadFilesFromDirectory();
                } else {
                    showNotification(response.message, 'error');
                }
            } catch (error) {
                showNotification('上传过程中发生错误', 'error');
            }
            
            // 恢复上传按钮
            uploadButton.disabled = false;
            uploadButton.innerHTML = '<i class="fas fa-upload"></i> 上传文件';
        });
        
        // 上传错误
        xhr.addEventListener('error', () => {
            showNotification('上传失败，请检查网络连接', 'error');
            
            // 恢复上传按钮
            uploadButton.disabled = false;
            uploadButton.innerHTML = '<i class="fas fa-upload"></i> 上传文件';
        });
        
        // 发送请求
        xhr.open('POST', 'files/upload.php', true);
        xhr.send(formData);
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
