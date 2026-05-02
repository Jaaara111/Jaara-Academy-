package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jaara.academy.databinding.ActivityChallengeBinding
import com.jaara.academy.databinding.ItemChallengeBinding
import com.jaara.academy.models.Challenge

class ChallengeActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChallengeBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChallengeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        val challenges = listOf(
            Challenge("1", "Math Speed Contest", 500, "Hard"),
            Challenge("2", "Physics Quiz", 300, "Medium"),
            Challenge("3", "History Trivia", 200, "Easy")
        )

        binding.rvChallenges.layoutManager = LinearLayoutManager(this)
        binding.rvChallenges.adapter = ChallengeAdapter(challenges)
    }
}

class ChallengeAdapter(private val list: List<Challenge>) : RecyclerView.Adapter<ChallengeAdapter.ViewHolder>() {
    class ViewHolder(val binding: ItemChallengeBinding) : RecyclerView.ViewHolder(binding.root)
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        ItemChallengeBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val c = list[position]
        holder.binding.tvTitle.text = c.title
        holder.binding.tvPoints.text = "${c.points} XP"
        holder.binding.tvDiff.text = c.difficulty
    }
    override fun getItemCount() = list.size
}
