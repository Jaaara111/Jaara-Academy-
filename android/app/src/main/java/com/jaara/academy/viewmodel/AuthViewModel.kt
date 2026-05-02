package com.jaara.academy.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jaara.academy.api.NetworkModule
import com.jaara.academy.models.User
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {
    private val _user = MutableLiveData<User?>()
    val user: LiveData<User?> = _user

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun login(phone: String, pass: String) {
        viewModelScope.launch {
            try {
                val response = NetworkModule.apiService.login(mapOf("phone" to phone, "password" to pass))
                if (response.isSuccessful && response.body()?.success == true) {
                    _user.postValue(response.body()?.data)
                } else {
                    _error.postValue(response.body()?.message ?: "Login failed")
                }
            } catch (e: Exception) {
                _error.postValue(e.message)
            }
        }
    }
}
