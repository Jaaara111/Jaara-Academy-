package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.api.FirebaseService
import com.jaara.academy.databinding.ActivityManageStudentsBinding
import com.jaara.academy.databinding.ItemManageStudentBinding
import com.jaara.academy.models.User

class ManageStudentsActivity : AppCompatActivity() {
    private lateinit var binding: ActivityManageStudentsBinding
    private val students = mutableListOf<User>()
    private lateinit var adapter: StudentManageAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityManageStudentsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toolbar.setNavigationOnClickListener { finish() }

        setupRecyclerView()
        loadStudents()
    }

    private fun setupRecyclerView() {
        adapter = StudentManageAdapter(students) { student ->
            removeStudent(student)
        }
        binding.rvManageStudents.layoutManager = LinearLayoutManager(this)
        binding.rvManageStudents.adapter = adapter
    }

    private fun loadStudents() {
        FirebaseService.getUsers { list ->
            students.clear()
            students.addAll(list.filter { it.role != "admin" })
            adapter.notifyDataSetChanged()
        }
    }

    private fun removeStudent(student: User) {
        // In firebase rules, we'll allow admins to delete users from the users collection
        com.google.firebase.firestore.FirebaseFirestore.getInstance()
            .collection("users")
            .document(student.id)
            .delete()
            .addOnSuccessListener {
                Toast.makeText(this, "Student removed", Toast.LENGTH_SHORT).show()
                students.remove(student)
                adapter.notifyDataSetChanged()
            }
            .addOnFailureListener {
                Toast.makeText(this, "Failed: ${it.message}", Toast.LENGTH_SHORT).show()
            }
    }
}

class StudentManageAdapter(
    private val list: List<User>,
    private val onRemove: (User) -> Unit
) : RecyclerView.Adapter<StudentManageAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemManageStudentBinding) : RecyclerView.ViewHolder(binding.root)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        ItemManageStudentBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val s = list[position]
        holder.binding.tvStudentName.text = s.name
        holder.binding.tvStudentPhone.text = s.phone
        holder.binding.btnRemoveStudent.setOnClickListener { onRemove(s) }
    }
    override fun getItemCount() = list.size
}
