class User {
  final int id;
  final String username;
  final String role;
  final String? email;

  User({required this.id, required this.username, required this.role, this.email});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      role: json['role'] ?? 'user',
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'role': role,
      'email': email,
    };
  }
}
