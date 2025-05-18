<?php
// 简单的目录列表生成脚本
$dir = './';
$files = scandir($dir);
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Directory Listing</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 8px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Directory Listing</h2>
    <table>
        <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Date Modified</th>
        </tr>
        <?php foreach($files as $file): ?>
        <?php if($file != '.' && $file != '..' && $file != 'index.php'): ?>
        <?php
            $filePath = $dir . '/' . $file;
            $size = is_file($filePath) ? filesize($filePath) : '-';
            $date = date("Y-m-d H:i:s", filemtime($filePath));
        ?>
        <tr>
            <td><a href="<?php echo htmlspecialchars($file); ?>"><?php echo htmlspecialchars($file); ?></a></td>
            <td><?php echo $size; ?></td>
            <td><?php echo $date; ?></td>
        </tr>
        <?php endif; ?>
        <?php endforeach; ?>
    </table>
</body>
</html>
