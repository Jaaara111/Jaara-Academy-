package com.jaara.academy.ui.dashboard

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityProfileBinding
import com.jaara.academy.ui.auth.LoginActivity

class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Mock data
        binding.tvUserName.text = "Hassan Jaara"
        binding.tvUserPhone.text = "0615551122"

        binding.btnLogout.setOnClickListener {
            // Clear session logic here
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

        binding.btnEditProfile.setOnClickListener {
            // Navigate to edit profile screen
        }
    }
}
