import 'package:flutter/material.dart';
import 'ai_tutor_screen.dart';
import 'books_screen.dart';

class DashboardScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  DashboardScreen({required this.user});

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _selectedIndex == 0 || _selectedIndex == 1 || _selectedIndex == 2
          ? AppBar(
              title: Text(_getTitle()),
              elevation: 0,
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              actions: [
                IconButton(icon: Icon(Icons.notifications_none), onPressed: () {}),
                IconButton(icon: Icon(Icons.person_outline), onPressed: () {}),
              ],
            )
          : null,
      body: _buildPage(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        selectedItemColor: Colors.blue[800],
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.book), label: 'Exams'),
          BottomNavigationBarItem(icon: Icon(Icons.message), label: 'Messages'),
          BottomNavigationBarItem(icon: Icon(Icons.smart_toy), label: 'AI Tutor'),
        ],
      ),
    );
  }

  String _getTitle() {
    switch (_selectedIndex) {
      case 0: return 'Welcome, ${widget.user['username']}';
      case 1: return 'National Exams';
      case 2: return 'Conversations';
      case 3: return 'AI Tutor';
      default: return 'Jaara';
    }
  }

  Widget _buildPage(int index) {
    switch (index) {
      case 0:
        return _buildHome();
      case 1:
        return _buildExams();
      case 3:
        return AITutorScreen();
      default:
        return Center(child: Text('Feature coming soon'));
    }
  }

  Widget _buildHome() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildQuickCard(),
          SizedBox(height: 24),
          Text('Recommended for you', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          SizedBox(height: 16),
          _buildSubjectGrid(),
        ],
      ),
    );
  }

  Widget _buildExams() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, i) {
        return Card(
          margin: EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: ListTile(
            leading: CircleAvatar(backgroundColor: Colors.blue[50], child: Icon(Icons.description, color: Colors.blue)),
            title: Text('National Exam 202${3-i}', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Mathematics • Grade 12'),
            trailing: Icon(Icons.file_download, color: Colors.grey),
            onTap: () {},
          ),
        );
      },
    );
  }

  Widget _buildQuickCard() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.blue[800],
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.blue.withOpacity(0.3), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ready to learn?', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text('Explore today\'s topics', style: TextStyle(color: Colors.white70)),
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {},
                  child: Text('Start Now'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.blue[800]),
                ),
              ],
            ),
          ),
          Icon(Icons.school, size: 80, color: Colors.white24),
        ],
      ),
    );
  }

  Widget _buildSubjectGrid() {
    final List<Map<String, dynamic>> items = [
      {'label': 'Mathematics', 'icon': Icons.calculate},
      {'label': 'Science', 'icon': Icons.science},
      {'label': 'History', 'icon': Icons.history},
      {'label': 'Physics', 'icon': Icons.bolt},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.5,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => BooksScreen()));
          },
          child: Container(
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(items[index]['icon'], color: Colors.blue[600]),
                SizedBox(height: 8),
                Text(items[index]['label'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ),
          ),
        );
      },
    );
  }
}
