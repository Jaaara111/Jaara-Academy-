package com.jaara.academy.ui.dashboard

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityAttendanceBinding

class AttendanceActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAttendanceBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAttendanceBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.calendarView.setOnDateChangeListener { _, year, month, dayOfMonth ->
            binding.tvDateStatus.text = "Date: ${month + 1}/$dayOfMonth/$year"
        }
    }
}
