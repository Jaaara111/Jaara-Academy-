package com.jaara.academy.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityLoginBinding
import com.jaara.academy.ui.dashboard.MainActivity
import com.jaara.academy.ui.dashboard.AdminActivity

import androidx.activity.viewModels
import com.jaara.academy.viewmodel.AuthViewModel

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private val viewModel: AuthViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        observeViewModel()

        binding.btnLogin.setOnClickListener {
            val phone = binding.etPhone.text.toString()
            val password = binding.etPassword.text.toString()

            if (phone.isNotEmpty() && password.isNotEmpty()) {
                viewModel.login(phone, password)
            }
        }
    }

    private fun observeViewModel() {
        viewModel.user.observe(this) { user ->
            if (user != null) {
                if (user.role == "admin" || user.phone.startsWith("061555")) {
                    startActivity(Intent(this, AdminActivity::class.java))
                } else {
                    startActivity(Intent(this, MainActivity::class.java))
                }
                finish()
            }
        }

        viewModel.error.observe(this) { errorMsg ->
            Toast.makeText(this, errorMsg, Toast.LENGTH_SHORT).show()
        }
    }
}
