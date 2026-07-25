import '../../domain/entities/message.dart';

class ChatThreadState {
  final List<Message> messages;
  final bool isLoading;
  final bool isSending;
  final bool otherIsTyping;
  final String? error;

  const ChatThreadState({
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
    this.otherIsTyping = false,
    this.error,
  });

  ChatThreadState copyWith({
    List<Message>? messages,
    bool? isLoading,
    bool? isSending,
    bool? otherIsTyping,
    String? error,
  }) {
    return ChatThreadState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      otherIsTyping: otherIsTyping ?? this.otherIsTyping,
      error: error,
    );
  }
}
