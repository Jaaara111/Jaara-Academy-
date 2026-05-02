package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.databinding.ActivityBooksBinding
import com.jaara.academy.databinding.ItemBookBinding
import com.jaara.academy.models.Book

class BooksActivity : AppCompatActivity() {
    private lateinit var binding: ActivityBooksBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBooksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toolbar.setNavigationOnClickListener { finish() }

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        val dummyBooks = listOf(
            Book("1", "Physics Grade 12", "Form 4", "Physics", "url1"),
            Book("2", "Math Grade 8", "Grade 8", "Mathematics", "url2"),
            Book("3", "History Form 2", "Form 2", "History", "url3"),
            Book("4", "Chemistry Grade 12", "Form 4", "Chemistry", "url4")
        )

        binding.rvBooks.layoutManager = GridLayoutManager(this, 2)
        binding.rvBooks.adapter = BookAdapter(dummyBooks)
    }
}

class BookAdapter(private val books: List<Book>) : RecyclerView.Adapter<BookAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemBookBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val b = ItemBookBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(b)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val book = books[position]
        holder.binding.tvBookTitle.text = book.title
        holder.binding.tvBookGrade.text = book.grade
    }

    override fun getItemCount() = books.size
}
