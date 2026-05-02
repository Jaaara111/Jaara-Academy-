package com.jaara.academy.api

import com.jaara.academy.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("login.php")
    suspend fun login(@Body request: Map<String, String>): Response<ApiResponse<User>>

    @POST("register.php")
    suspend fun register(@Body request: Map<String, String>): Response<ApiResponse<User>>

    @GET("exams.php")
    suspend fun getExams(): Response<ApiResponse<List<Exam>>>

    @GET("books.php")
    suspend fun getBooks(@Query("grade") grade: String): Response<ApiResponse<List<Book>>>

    @POST("ai_tutor.php")
    suspend fun askAi(@Body request: Map<String, String>): Response<ApiResponse<String>>

    @GET("messages.php")
    suspend fun getMessages(): Response<ApiResponse<List<ChatMessage>>>

    @POST("send_message.php")
    suspend fun sendMessage(@Body msg: Map<String, String>): Response<ApiResponse<String>>
}
