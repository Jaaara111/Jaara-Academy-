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

        var clickCount = 0
        binding.tvVersion.setOnClickListener {
            clickCount++
            if (clickCount >= 7) {
                clickCount = 0
                // Check if user is admin role (in a real app, verify against stored profile)
                val role = getSharedPreferences("JAARA_PREFS", MODE_PRIVATE).getString("USER_ROLE", "student")
                if (role == "admin") {
                    binding.btnAdminDashboard.visibility = android.view.View.VISIBLE
                    android.widget.Toast.makeText(this, "Admin Mode Unlocked", android.widget.Toast.LENGTH_SHORT).show()
                } else {
                    android.widget.Toast.makeText(this, "Secret Menu: Only for Admins", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnAdminDashboard.setOnClickListener {
            startActivity(Intent(this, AdminActivity::class.java))
        }

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
