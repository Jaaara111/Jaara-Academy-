package com.jaara.academy.ui.dashboard

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.api.FirebaseService
import com.jaara.academy.databinding.ActivityExamsListBinding
import com.jaara.academy.databinding.ItemExamBinding
import com.jaara.academy.models.Exam

class ExamsListActivity : AppCompatActivity() {
    private lateinit var binding: ActivityExamsListBinding
    private val exams = mutableListOf<Exam>()
    private lateinit var adapter: ExamAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityExamsListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toolbar.setNavigationOnClickListener { finish() }

        setupRecyclerView()
        loadExams()
    }

    private fun setupRecyclerView() {
        adapter = ExamAdapter(exams) { exam ->
            Toast.makeText(this, "Starting ${exam.title}...", Toast.LENGTH_SHORT).show()
            // Here you would navigate to a QuizActivity
        }
        binding.rvExams.layoutManager = LinearLayoutManager(this)
        binding.rvExams.adapter = adapter
    }

    private fun loadExams() {
        FirebaseService.getExams { list ->
            exams.clear()
            exams.addAll(list)
            adapter.notifyDataSetChanged()
        }
    }
}

class ExamAdapter(private val list: List<Exam>, private val onStart: (Exam) -> Unit) : RecyclerView.Adapter<ExamAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemExamBinding) : RecyclerView.ViewHolder(binding.root)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        ItemExamBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val e = list[position]
        holder.binding.tvExamTitle.text = e.title
        holder.binding.tvExamSubject.text = "${e.subject} - ${e.durationMinutes} mins"
        holder.binding.btnStartExam.setOnClickListener { onStart(e) }
    }
    override fun getItemCount() = list.size
}
