package com.jaara.academy.ui.dashboard

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.databinding.ActivityExamsListBinding
import com.jaara.academy.databinding.ItemExamBinding
import com.jaara.academy.models.Exam

class ExamsListActivity : AppCompatActivity() {
    private lateinit var binding: ActivityExamsListBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityExamsListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val subject = intent.getStringExtra("SUBJECT_NAME") ?: "Exams"
        binding.toolbar.title = subject
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        val dummyExams = listOf(
            Exam("1", "National Exam 2023", "Mathematics", "2023", "url1"),
            Exam("2", "National Exam 2022", "Mathematics", "2022", "url2"),
            Exam("3", "Midterm Exam 2023", "Mathematics", "2023", "url3")
        )

        binding.rvExams.layoutManager = LinearLayoutManager(this)
        binding.rvExams.adapter = ExamAdapter(dummyExams) { exam ->
            val intent = Intent(this, PdfViewerActivity::class.java)
            intent.putExtra("PDF_TITLE", exam.title)
            intent.putExtra("PDF_URL", exam.pdfUrl)
            startActivity(intent)
        }
    }
}

class ExamAdapter(
    private val exams: List<Exam>,
    private val onClick: (Exam) -> Unit
) : RecyclerView.Adapter<ExamAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemExamBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemExamBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val exam = exams[position]
        holder.binding.tvExamTitle.text = exam.title
        holder.binding.tvExamInfo.text = "${exam.subject} • ${exam.year}"
        holder.binding.root.setOnClickListener { onClick(exam) }
    }

    override fun getItemCount() = exams.size
}
