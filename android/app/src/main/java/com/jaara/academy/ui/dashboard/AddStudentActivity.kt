package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityAddStudentBinding

class AddStudentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAddStudentBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddStudentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSaveStudent.setOnClickListener {
            val name = binding.etStudentName.text.toString()
            val phone = binding.etStudentPhone.text.toString()
            
            if (name.isNotEmpty() && phone.isNotEmpty()) {
                // Mock API call to register.php but with admin context
                Toast.makeText(this, "Student $name added successfully", Toast.LENGTH_LONG).show()
                finish()
            } else {
                Toast.makeText(this, "Please fill required fields", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
