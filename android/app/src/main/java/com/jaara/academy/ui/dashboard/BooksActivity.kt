package com.jaara.academy.ui.dashboard

import android.content.Intent
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

        loadBooks()
    }

    private fun loadBooks() {
        com.jaara.academy.api.FirebaseService.getBooks { list ->
            binding.rvBooks.layoutManager = GridLayoutManager(this, 2)
            binding.rvBooks.adapter = BookAdapter(list)
        }
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
        
        holder.itemView.setOnClickListener {
            val intent = Intent(it.context, PdfViewerActivity::class.java).apply {
                putExtra("PDF_URL", book.pdfUrl)
                putExtra("BOOK_TITLE", book.title)
            }
            it.context.startActivity(intent)
        }
    }

    override fun getItemCount() = books.size
}
