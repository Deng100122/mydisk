<?php
// 文件上传处理脚本

// 设置上传目录
$targetDir = "./";

// 检查是否有文件上传
if(isset($_FILES["file"])) {
    $targetFile = $targetDir . basename($_FILES["file"]["name"]);
    $uploadOk = 1;
    $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    
    // 检查文件是否已经存在
    if (file_exists($targetFile)) {
        $response = ["status" => "error", "message" => "文件已存在。"];
        $uploadOk = 0;
    }
    
    // 检查文件大小 (限制为100MB)
    if ($_FILES["file"]["size"] > 100000000) {
        $response = ["status" => "error", "message" => "文件过大，请上传小于100MB的文件。"];
        $uploadOk = 0;
    }
    
    // 如果没有错误，尝试上传文件
    if ($uploadOk == 1) {
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFile)) {
            $response = ["status" => "success", "message" => "文件 ". htmlspecialchars(basename($_FILES["file"]["name"])). " 已成功上传。"];
        } else {
            $response = ["status" => "error", "message" => "上传失败，请稍后重试。"];
        }
    }
    
    // 返回JSON响应
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>
