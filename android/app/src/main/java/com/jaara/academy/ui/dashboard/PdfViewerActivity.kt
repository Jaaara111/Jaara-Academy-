package com.jaara.academy.ui.dashboard

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.jaara.academy.databinding.ActivityPdfViewerBinding

class PdfViewerActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPdfViewerBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPdfViewerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toolbar.setNavigationOnClickListener { finish() }

        val pdfUrl = intent.getStringExtra("PDF_URL") ?: ""
        val title = intent.getStringExtra("BOOK_TITLE") ?: "Reader"
        binding.toolbar.title = title

        setupWebView(pdfUrl)
    }

    private fun setupWebView(url: String) {
        binding.webView.settings.javaScriptEnabled = true
        binding.webView.settings.pluginState = WebSettings.PluginState.ON
        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                view?.loadUrl(url ?: "")
                return true
            }
        }
        
        // Using Google Drive Viewer to render online PDFs
        val googleDocsUrl = "https://docs.google.com/gview?embedded=true&url=$url"
        binding.webView.loadUrl(googleDocsUrl)
    }
}
