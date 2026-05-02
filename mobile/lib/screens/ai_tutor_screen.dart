import 'package:flutter/material.dart';
import 'package:bubble/bubble.dart';

class AITutorScreen extends StatefulWidget {
  @override
  _AITutorScreenState createState() => _AITutorScreenState();
}

class _AITutorScreenState extends State<AITutorScreen> {
  final List<Map<String, dynamic>> _messages = [
    {'text': 'Hello! I am your Jaara IA Tutor. How can I help you today?', 'isMe': false}
  ];
  final _controller = TextEditingController();
  bool _isTyping = false;

  void _sendMessage() async {
    if (_controller.text.isEmpty) return;
    
    final userText = _controller.text;
    setState(() {
      _messages.add({'text': userText, 'isMe': true});
      _isTyping = true;
    });
    _controller.clear();

    // Mock AI response for now (normally calls ApiService)
    await Future.delayed(Duration(seconds: 1));
    
    setState(() {
      _messages.add({
        'text': 'I understand you are asking about "$userText". Studying this topic is key for the upcoming national exams.',
        'isMe': false
      });
      _isTyping = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(backgroundColor: Colors.blue[100], child: Icon(Icons.smart_toy, color: Colors.blue[800])),
            SizedBox(width: 12),
            Text('AI Tutor', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final msg = _messages[i];
                return Padding(
                  padding: EdgeInsets.symmetric(vertical: 4),
                  child: Bubble(
                    alignment: msg['isMe'] ? Alignment.topRight : Alignment.topLeft,
                    nip: msg['isMe'] ? BubbleNip.rightBottom : BubbleNip.leftBottom,
                    color: msg['isMe'] ? Colors.blue[600] : Colors.grey[200],
                    child: Text(
                      msg['text'],
                      style: TextStyle(color: msg['isMe'] ? Colors.white : Colors.black87),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isTyping) 
            Padding(
              padding: EdgeInsets.all(8.0),
              child: Text('AI is thinking...', style: TextStyle(fontSize: 12, color: Colors.grey)),
            ),
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Colors.grey[200]!))),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Type your question...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                FloatingActionButton(
                  onPressed: _sendMessage,
                  mini: true,
                  child: Icon(Icons.send, size: 18),
                  backgroundColor: Colors.blue[800],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
