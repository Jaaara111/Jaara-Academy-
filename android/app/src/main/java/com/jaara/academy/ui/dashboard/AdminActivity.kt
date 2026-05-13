package com.jaara.academy.ui.dashboard

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityAdminBinding

class AdminActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAdminBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadStats()

        binding.btnAddStudent.setOnClickListener {
            startActivity(Intent(this, AddStudentActivity::class.java))
        }

        binding.btnUploadPDF.setOnClickListener {
            startActivity(Intent(this, AddBookActivity::class.java))
        }

        // Additional Management Buttons
        binding.btnManageBooks.setOnClickListener {
            startActivity(Intent(this, ManageBooksActivity::class.java))
        }
        
        binding.btnManageStudents.setOnClickListener {
            startActivity(Intent(this, ManageStudentsActivity::class.java))
        }
    }

    private fun loadStats() {
        FirebaseService.getBooks { list ->
            binding.tvBooksCount.text = list.size.toString()
        }
        FirebaseService.getUsers { list ->
            binding.tvUsersCount.text = list.size.toString()
        }
    }
}
