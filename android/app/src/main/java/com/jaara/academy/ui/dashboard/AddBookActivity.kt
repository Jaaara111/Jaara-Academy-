package com.jaara.academy.ui.dashboard

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityAddBookBinding

class AddBookActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAddBookBinding
    private var selectedPdfUri: Uri? = null

    private val pdfPickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            selectedPdfUri = result.data?.data
            binding.tvFileName.text = selectedPdfUri?.path ?: "File Selected"
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddBookBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSelectPdf.setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT)
            intent.type = "application/pdf"
            pdfPickerLauncher.launch(intent)
        }

        binding.btnUploadBook.setOnClickListener {
            val title = binding.etBookTitle.text.toString()
            val grade = binding.etGrade.text.toString()
            val subject = binding.etSubject.text.toString()

            if (title.isNotEmpty() && grade.isNotEmpty() && subject.isNotEmpty() && selectedPdfUri != null) {
                // Metadata upload to Firestore
                com.jaara.academy.api.FirebaseService.uploadBook(
                    title, grade, subject, "https://firebasestorage.googleapis.com/...dummy.pdf"
                ) { success ->
                    if (success) {
                        Toast.makeText(this, "Book '$title' uploaded successfully!", Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        Toast.makeText(this, "Upload failed. Please check connection.", Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                Toast.makeText(this, "Please fill all fields and select a PDF", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
