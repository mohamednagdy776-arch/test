class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const resetPassword = '/reset-password';
  static const dashboard = '/dashboard';
  static const profile = '/profile';
  static const extendedProfile = '/profile/extended';
  static const feed = '/feed';
  static const createPost = '/feed/create';
  static const matching = '/matching';
  static const matchDetail = '/matching/:id';
  static const chat = '/chat';
  static const chatThread = '/chat/:conversationId';
  static const notifications = '/notifications';
  static const groups = '/groups'; // backlog, kept for the existing stub entity

  static String matchDetailPath(String id) => '/matching/$id';
  static String chatThreadPath(String conversationId) => '/chat/$conversationId';
}
