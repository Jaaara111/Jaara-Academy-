package com.jaara.academy.ui.dashboard

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.jaara.academy.R
import com.jaara.academy.databinding.ActivityMainBinding
import com.jaara.academy.ui.common.Subject
import com.jaara.academy.ui.common.SubjectAdapter

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupNavigation()

        binding.tvHero.setOnClickListener {
            startActivity(Intent(this, AiTutorActivity::class.java))
        }
    }

    private fun setupNavigation() {
        binding.bottomNav.setOnItemSelectedListener { item ->
            when(item.itemId) {
                R.id.nav_home -> true
                R.id.nav_exams -> {
                    val intent = Intent(this, ExamsListActivity::class.java)
                    intent.putExtra("SUBJECT_NAME", "All Exams")
                    startActivity(intent)
                    false
                }
                R.id.nav_chat -> {
                    startActivity(Intent(this, ChatActivity::class.java))
                    false
                }
                R.id.nav_results -> {
                    startActivity(Intent(this, ResultsActivity::class.java))
                    false
                }
                R.id.nav_profile -> {
                    startActivity(Intent(this, ProfileActivity::class.java))
                    false
                }
                else -> false
            }
        }
    }

    private fun setupRecyclerView() {
        val subjects = listOf(
            Subject("Books G1-8", android.R.drawable.ic_menu_agenda),
            Subject("Books F1-4", android.R.drawable.ic_menu_agenda),
            Subject("8 Grade Exams", android.R.drawable.ic_menu_edit),
            Subject("Form 4 Exams", android.R.drawable.ic_menu_edit),
            Subject("Challenges", android.R.drawable.btn_star_big_on),
            Subject("Attendance", android.R.drawable.ic_menu_today)
        )

        binding.rvSubjects.layoutManager = GridLayoutManager(this, 2)
        binding.rvSubjects.adapter = SubjectAdapter(subjects)
    }
}
