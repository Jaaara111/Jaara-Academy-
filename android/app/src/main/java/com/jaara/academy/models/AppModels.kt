package com.jaara.academy.models

data class User(
    val id: String,
    val name: String,
    val phone: String,
    val role: String,
    val token: String? = null
)

data class Exam(
    val id: String,
    val title: String,
    val subject: String,
    val year: String,
    val pdfUrl: String
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)

data class Book(
    val id: String,
    val title: String,
    val grade: String,
    val subject: String,
    val pdfUrl: String
)

data class ChatMessage(
    val id: String,
    val senderId: String,
    val senderName: String,
    val text: String,
    val timestamp: Long,
    val isMe: Boolean = false
)

data class Challenge(
    val id: String,
    val title: String,
    val points: Int,
    val difficulty: String
)
