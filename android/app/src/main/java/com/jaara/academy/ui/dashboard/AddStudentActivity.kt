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
                val student = hashMapOf(
                    "name" to name,
                    "phone" to phone,
                    "role" to "student",
                    "createdAt" to com.google.firebase.Timestamp.now()
                )
                
                com.google.firebase.firestore.FirebaseFirestore.getInstance()
                    .collection("users")
                    .add(student)
                    .addOnSuccessListener {
                        Toast.makeText(this, "Student '$name' added to Cloud!", Toast.LENGTH_LONG).show()
                        finish()
                    }
                    .addOnFailureListener {
                        Toast.makeText(this, "Save failed: ${it.message}", Toast.LENGTH_SHORT).show()
                    }
            } else {
                Toast.makeText(this, "Please fill required fields", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
