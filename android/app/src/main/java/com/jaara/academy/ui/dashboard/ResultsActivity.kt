package com.jaara.academy.ui.dashboard

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityResultsBinding

class ResultsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityResultsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityResultsBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
