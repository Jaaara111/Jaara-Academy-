package com.jaara.academy.ui.dashboard

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityPdfViewerBinding

class PdfViewerActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPdfViewerBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPdfViewerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val title = intent.getStringExtra("PDF_TITLE") ?: "Document"
        val url = intent.getStringExtra("PDF_URL")

        binding.toolbar.title = title
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        // Logic to load PDF from URL would go here
    }
}
