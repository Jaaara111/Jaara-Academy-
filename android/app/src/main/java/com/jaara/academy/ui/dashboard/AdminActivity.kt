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

        binding.btnAddStudent.setOnClickListener {
            startActivity(Intent(this, AddStudentActivity::class.java))
        }

        binding.btnUploadPDF.setOnClickListener {
            // In a real app, use FilePicker or launch a dedicated Upload Activity
            Toast.makeText(this, "Select PDF from storage...", Toast.LENGTH_SHORT).show()
        }
    }
}
