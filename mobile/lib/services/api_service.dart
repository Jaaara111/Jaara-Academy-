import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://your-api-domain.com/api';

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login.php'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }

  Future<List<dynamic>> getExams() async {
    final response = await http.get(Uri.parse('$baseUrl/exams.php'));
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load exams');
  }

  Future<List<dynamic>> getBooks() async {
    final response = await http.get(Uri.parse('$baseUrl/books.php'));
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load books');
  }

  Future<List<dynamic>> getQuestions() async {
    final response = await http.get(Uri.parse('$baseUrl/questions.php'));
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('Failed to load questions');
  }

  Future<Map<String, dynamic>> sendAIMessage(String message) async {
    final response = await http.post(
      Uri.parse('$baseUrl/ai_tutor.php'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'message': message}),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    throw Exception('AI unreachable');
  }
}
