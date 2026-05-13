package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.api.FirebaseService
import com.jaara.academy.databinding.ActivityManageBooksBinding
import com.jaara.academy.databinding.ItemManageBookBinding
import com.jaara.academy.models.Book

class ManageBooksActivity : AppCompatActivity() {
    private lateinit var binding: ActivityManageBooksBinding
    private val books = mutableListOf<Book>()
    private lateinit var adapter: ManageBookAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityManageBooksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toolbar.setNavigationOnClickListener { finish() }

        setupRecyclerView()
        loadBooks()
    }

    private fun setupRecyclerView() {
        adapter = ManageBookAdapter(books) { book ->
            deleteBook(book)
        }
        binding.rvManageBooks.layoutManager = LinearLayoutManager(this)
        binding.rvManageBooks.adapter = adapter
    }

    private fun loadBooks() {
        FirebaseService.getBooks { list ->
            books.clear()
            books.addAll(list)
            adapter.notifyDataSetChanged()
        }
    }

    private fun deleteBook(book: Book) {
        FirebaseService.deleteBook(book.id) { success ->
            if (success) {
                Toast.makeText(this, "Book deleted", Toast.LENGTH_SHORT).show()
                books.remove(book)
                adapter.notifyDataSetChanged()
            } else {
                Toast.makeText(this, "Failed to delete", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

class ManageBookAdapter(
    private val list: List<Book>,
    private val onDelete: (Book) -> Unit
) : RecyclerView.Adapter<ManageBookAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemManageBookBinding) : RecyclerView.ViewHolder(binding.root)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        ItemManageBookBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val b = list[position]
        holder.binding.tvTitle.text = b.title
        holder.binding.tvDetail.text = "${b.grade} - ${b.subject}"
        holder.binding.btnDelete.setOnClickListener { onDelete(b) }
    }
    override fun getItemCount() = list.size
}
