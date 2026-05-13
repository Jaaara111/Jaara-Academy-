package com.jaara.academy.ui.common

import android.content.Intent
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.databinding.ItemSubjectBinding

data class Subject(val name: String, val icon: Int)

class SubjectAdapter(private val subjects: List<Subject>) : 
    RecyclerView.Adapter<SubjectAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemSubjectBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemSubjectBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val subject = subjects[position]
        holder.binding.tvSubjectName.text = subject.name
        holder.binding.ivIcon.setImageResource(subject.icon)
        
        holder.binding.root.setOnClickListener {
            val context = holder.binding.root.context
            when {
                subject.name.contains("Books") -> {
                    context.startActivity(Intent(context, com.jaara.academy.ui.dashboard.BooksActivity::class.java))
                }
                subject.name.contains("Challenge") -> {
                    context.startActivity(Intent(context, com.jaara.academy.ui.dashboard.ChallengeActivity::class.java))
                }
                subject.name.contains("Attendance") -> {
                    context.startActivity(Intent(context, com.jaara.academy.ui.dashboard.AttendanceActivity::class.java))
                }
                else -> {
                    val intent = Intent(context, com.jaara.academy.ui.dashboard.ExamsListActivity::class.java)
                    intent.putExtra("SUBJECT_NAME", subject.name)
                    context.startActivity(intent)
                }
            }
        }
    }

    override fun getItemCount() = subjects.size
}
