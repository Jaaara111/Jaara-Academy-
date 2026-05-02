<?php
require_once 'config.php';

$messages = [
    ["id" => "1", "senderId" => "101", "senderName" => "Hassan", "text" => "Walaal imtixaanka sidee u diyaarsan tahay?", "timestamp" => time() - 3600],
    ["id" => "2", "senderId" => "102", "senderName" => "Ali", "text" => "Si fiican alxamdulilaah, buugaagti ayaan akhrinayaa.", "timestamp" => time() - 1800],
    ["id" => "3", "senderId" => "103", "senderName" => "Zahra", "text" => "AI Tutor ka ma isticmaashay? Aad buu u fiican yahay.", "timestamp" => time() - 600]
];

sendResponse(true, "Messages loaded", $messages);
?>
