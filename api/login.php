<?php
require_once 'config.php';

$input = json_decode(file_get_contents("php://input"), true);
$phone = $input['phone'] ?? '';
$password = $input['password'] ?? '';

if (empty($phone) || empty($password)) {
    sendResponse(false, "Fadlan buuxi meelaha banaan");
}

$stmt = $conn->prepare("SELECT id, name, phone, role FROM users WHERE phone = ? AND password = ?");
$stmt->bind_param("ss", $phone, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    sendResponse(true, "Soo dhawaaw " . $user['name'], $user);
} else {
    sendResponse(false, "Nambarka ama sirtaada ayaa khaldan");
}
$stmt->close();
$conn->close();
?>
