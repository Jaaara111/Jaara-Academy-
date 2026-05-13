package com.jaara.academy.models

import com.google.firebase.Timestamp

data class Subject(
    var id: String = "",
    val name: String = "",
    val icon: String = "" // Drawable name or URL
)

data class ChatMessage(
    val chatRoomId: String = "",
    val senderId: String = "",
    val text: String = "",
    val createdAt: Timestamp? = null
)

data class Exam(
    var id: String = "",
    val title: String = "",
    val subject: String = "",
    val grade: String = "",
    val durationMinutes: Int = 30
)

data class Question(
    val id: String = "",
    val text: String = "",
    val options: List<String> = emptyList(),
    val correctAnswerIndex: Int = 0
)
