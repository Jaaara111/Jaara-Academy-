package com.jaara.academy.api

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.jaara.academy.models.Book
import com.jaara.academy.models.Subject
import com.jaara.academy.models.ChatMessage
import com.jaara.academy.models.Exam

object FirebaseService {
    private val db = Firebase.firestore

    fun uploadBook(title: String, grade: String, subject: String, pdfUrl: String, onComplete: (Boolean) -> Unit) {
        val book = hashMapOf(
            "title" to title,
            "grade" to grade,
            "subject" to subject,
            "pdfUrl" to pdfUrl,
            "createdAt" to com.google.firebase.Timestamp.now()
        )

        db.collection("books")
            .add(book)
            .addOnSuccessListener { onComplete(true) }
            .addOnFailureListener { onComplete(false) }
    }

    fun getBooks(onResult: (List<Book>) -> Unit) {
        db.collection("books")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    onResult(emptyList())
                    return@addSnapshotListener
                }
                val books = snapshot?.map { doc ->
                    Book(
                        id = doc.id,
                        title = doc.getString("title") ?: "",
                        grade = doc.getString("grade") ?: "",
                        subject = doc.getString("subject") ?: "",
                        pdfUrl = doc.getString("pdfUrl") ?: ""
                    )
                } ?: emptyList()
                onResult(books)
            }
    }

    fun deleteBook(bookId: String, onComplete: (Boolean) -> Unit) {
        db.collection("books").document(bookId)
            .delete()
            .addOnSuccessListener { onComplete(true) }
            .addOnFailureListener { onComplete(false) }
    }

    fun getUsers(onResult: (List<com.jaara.academy.models.User>) -> Unit) {
        db.collection("users")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    onResult(emptyList())
                    return@addSnapshotListener
                }
                val users = snapshot?.mapNotNull { doc ->
                    try {
                        com.jaara.academy.models.User(
                            id = doc.id,
                            name = doc.getString("name") ?: "",
                            phone = doc.getString("phone") ?: "",
                            role = doc.getString("role") ?: "student"
                        )
                    } catch (e: Exception) { null }
                } ?: emptyList()
                onResult(users)
            }
    }

    fun getSubjects(onResult: (List<Subject>) -> Unit) {
        db.collection("subjects").addSnapshotListener { snapshot, _ ->
            val list = snapshot?.documents?.mapNotNull { it.toObject(Subject::class.java)?.apply { id = it.id } } ?: emptyList()
            onResult(list)
        }
    }

    // Chat functionality
    fun sendMessage(chatRoomId: String, text: String, senderId: String) {
        val msg = hashMapOf(
            "chatRoomId" to chatRoomId,
            "senderId" to senderId,
            "text" to text,
            "createdAt" to com.google.firebase.Timestamp.now()
        )
        db.collection("chat_messages").add(msg)
    }

    fun getMessages(chatRoomId: String, onResult: (List<ChatMessage>) -> Unit) {
        db.collection("chat_messages")
            .whereEqualTo("chatRoomId", chatRoomId)
            .orderBy("createdAt")
            .addSnapshotListener { snapshot, _ ->
                val list = snapshot?.documents?.mapNotNull { it.toObject(ChatMessage::class.java) } ?: emptyList()
                onResult(list)
            }
    }

    fun getExams(onResult: (List<Exam>) -> Unit) {
        db.collection("exams").addSnapshotListener { snapshot, _ ->
            val list = snapshot?.documents?.mapNotNull { it.toObject(Exam::class.java)?.apply { id = it.id } } ?: emptyList()
            onResult(list)
        }
    }
}
