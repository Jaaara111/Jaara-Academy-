package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.databinding.ActivityChatBinding
import com.jaara.academy.databinding.ItemChatMessageBinding
import com.jaara.academy.models.ChatMessage

class ChatActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChatBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        
        binding.btnSend.setOnClickListener {
            binding.etMessage.text.clear()
        }
    }

    private fun setupRecyclerView() {
        val messages = listOf(
            ChatMessage("1", "1", "Hassan", "Hello guys!", System.currentTimeMillis(), true),
            ChatMessage("2", "2", "Ali", "Hi Hassan, ready for exam?", System.currentTimeMillis()),
            ChatMessage("3", "1", "Hassan", "Yes, practicing Math now.", System.currentTimeMillis(), true)
        )

        binding.rvChat.layoutManager = LinearLayoutManager(this)
        binding.rvChat.adapter = ChatAdapter(messages)
    }
}

class ChatAdapter(private val msgs: List<ChatMessage>) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemChatMessageBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val b = ItemChatMessageBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(b)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val m = msgs[position]
        holder.binding.tvMsg.text = m.text
        holder.binding.tvSender.text = m.senderName
        
        val layoutParams = holder.binding.cardMsg.layoutParams as android.widget.LinearLayout.LayoutParams
        layoutParams.gravity = if (m.isMe) android.view.Gravity.END else android.view.Gravity.START
        holder.binding.cardMsg.layoutParams = layoutParams
        holder.binding.cardMsg.setCardBackgroundColor(if (m.isMe) android.graphics.Color.parseColor("#2563EB") else android.graphics.Color.WHITE)
        holder.binding.tvMsg.setTextColor(if (m.isMe) android.graphics.Color.WHITE else android.graphics.Color.BLACK)
    }

    override fun getItemCount() = msgs.size
}
