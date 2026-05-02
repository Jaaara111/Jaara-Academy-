class Exam {
  final String id;
  final String title;
  final String subject;
  final String year;
  final String? fileUrl;

  Exam({required this.id, required this.title, required this.subject, required this.year, this.fileUrl});

  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      id: json['id'],
      title: json['title'],
      subject: json['subject'],
      year: json['year'],
      fileUrl: json['fileUrl'],
    );
  }
}

class Book {
  final String id;
  final String title;
  final String subject;
  final String? fileUrl;

  Book({required this.id, required this.title, required this.subject, this.fileUrl});

  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      id: json['id'],
      title: json['title'],
      subject: json['subject'],
      fileUrl: json['fileUrl'],
    );
  }
}

class Question {
  final String id;
  final String text;
  final String subject;
  final List<String> options;
  final int correctIndex;

  Question({required this.id, required this.text, required this.subject, required this.options, required this.correctIndex});

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      text: json['text'],
      subject: json['subject'],
      options: List<String>.from(json['options']),
      correctIndex: json['correctIndex'],
    );
  }
}
