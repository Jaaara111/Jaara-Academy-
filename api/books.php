<?php
require_once 'config.php';

$grade = $_GET['grade'] ?? '';

// Sample Books Data for Somali Curriculum
$books = [
    ["id" => "1", "title" => "Physics Grade 12", "grade" => "Form 4", "subject" => "Physics", "pdfUrl" => "https://example.com/phys12.pdf"],
    ["id" => "2", "title" => "Biology Grade 8", "grade" => "Grade 8", "subject" => "Biology", "pdfUrl" => "https://example.com/bio8.pdf"],
    ["id" => "3", "title" => "Mathematics Grade 12", "grade" => "Form 4", "subject" => "Math", "pdfUrl" => "https://example.com/math12.pdf"],
    ["id" => "4", "title" => "Somali Language G8", "grade" => "Grade 8", "subject" => "Somali", "pdfUrl" => "https://example.com/somali8.pdf"],
    ["id" => "5", "title" => "History Form 2", "grade" => "Form 2", "subject" => "History", "pdfUrl" => "https://example.com/history2.pdf"],
    ["id" => "6", "title" => "Chemistry Form 3", "grade" => "Form 3", "subject" => "Chemistry", "pdfUrl" => "https://example.com/chem3.pdf"],
    ["id" => "7", "title" => "Geography Form 4", "grade" => "Form 4", "subject" => "Geography", "pdfUrl" => "https://example.com/geo4.pdf"]
];

// Simple filter by grade if provided
if ($grade) {
    $filtered = array_filter($books, function($b) use ($grade) {
        return strpos($b['grade'], $grade) !== false;
    });
    sendResponse(true, "Books for $grade", array_values($filtered));
} else {
    sendResponse(true, "All Books", $books);
}
?>
