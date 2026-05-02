<?php
require_once 'config.php';

$exams = [
    [
        "id" => "1",
        "title" => "Imtixaanka Qaranka 2023",
        "subject" => "Mathematics",
        "year" => "2023",
        "pdfUrl" => "https://example.com/math2023.pdf"
    ],
    [
        "id" => "2",
        "title" => "Imtixaanka Qaranka 2022",
        "subject" => "Physics",
        "year" => "2022",
        "pdfUrl" => "https://example.com/phys2022.pdf"
    ],
    [
        "id" => "3",
        "title" => "Science Grade 12",
        "subject" => "Science",
        "year" => "2024",
        "pdfUrl" => "https://example.com/science.pdf"
    ]
];

sendResponse(true, "Success", $exams);
?>
