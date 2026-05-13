package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.jaara.academy.api.FirebaseService
import com.jaara.academy.databinding.ActivityChatBinding
import com.jaara.academy.databinding.ItemChatMessageBinding
import com.jaara.academy.models.ChatMessage

class ChatActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChatBinding
    private val messages = mutableListOf<ChatMessage>()
    private lateinit var adapter: ChatAdapter
    private val currentUserId = FirebaseAuth.getInstance().currentUser?.uid ?: "anonymous"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toolbar.setNavigationOnClickListener { finish() }

        setupRecyclerView()
        loadMessages()

        binding.btnSend.setOnClickListener {
            val text = binding.etMessage.text.toString()
            if (text.isNotEmpty()) {
                FirebaseService.sendMessage("general_room", text, currentUserId)
                binding.etMessage.setText("")
            }
        }
    }

    private fun setupRecyclerView() {
        adapter = ChatAdapter(messages, currentUserId)
        binding.rvMessages.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        binding.rvMessages.adapter = adapter
    }

    private fun loadMessages() {
        FirebaseService.getMessages("general_room") { list ->
            messages.clear()
            messages.addAll(list)
            adapter.notifyDataSetChanged()
            if (messages.isNotEmpty()) {
                binding.rvMessages.smoothScrollToPosition(messages.size - 1)
            }
        }
    }
}

class ChatAdapter(private val list: List<ChatMessage>, private val myId: String) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemChatMessageBinding) : RecyclerView.ViewHolder(binding.root)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        ItemChatMessageBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val m = list[position]
        holder.binding.tvMessage.text = m.text
        
        val isMe = m.senderId == myId
        val params = holder.binding.cardMessage.layoutParams as LinearLayoutManager.LayoutParams
        if (isMe) {
            holder.binding.msgContainer.gravity = Gravity.END
            holder.binding.cardMessage.setCardBackgroundColor(android.graphics.Color.parseColor("#2563EB"))
            holder.binding.tvMessage.setTextColor(android.graphics.Color.WHITE)
        } else {
            holder.binding.msgContainer.gravity = Gravity.START
            holder.binding.cardMessage.setCardBackgroundColor(android.graphics.Color.WHITE)
            holder.binding.tvMessage.setTextColor(android.graphics.Color.BLACK)
        }
    }
    override fun getItemCount() = list.size
}
