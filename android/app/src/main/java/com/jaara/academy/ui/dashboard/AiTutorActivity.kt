package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.jaara.academy.databinding.ActivityAiTutorBinding
import com.jaara.academy.models.ChatMessage

class AiTutorActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAiTutorBinding
    private val messages = mutableListOf<ChatMessage>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAiTutorBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val adapter = ChatAdapter(messages)
        binding.rvAiChat.layoutManager = LinearLayoutManager(this)
        binding.rvAiChat.adapter = adapter

        binding.btnAiSend.setOnClickListener {
            val text = binding.etAiInput.text.toString()
            if (text.isNotEmpty()) {
                messages.add(ChatMessage("", "me", "You", text, System.currentTimeMillis(), true))
                adapter.notifyItemInserted(messages.size - 1)
                binding.etAiInput.text.clear()
                
                // Simulate AI Response
                binding.aiLoader.visibility = View.VISIBLE
                binding.root.postDelayed({
                    binding.aiLoader.visibility = View.GONE
                    messages.add(ChatMessage("", "ai", "AI Tutor", "Fariintaada waa arkay. Waxaan kuu diyaarinayaa jawaabta su'aashaada ku saabsan $text.", System.currentTimeMillis(), false))
                    adapter.notifyItemInserted(messages.size - 1)
                    binding.rvAiChat.scrollToPosition(messages.size - 1)
                }, 1500)
            }
        }
    }
}
