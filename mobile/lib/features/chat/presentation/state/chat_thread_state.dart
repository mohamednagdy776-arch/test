import '../../domain/entities/message.dart';

class ChatThreadState {
  final List<Message> messages;
  final bool isLoading;
  final bool isSending;
  final bool otherIsTyping;
  // Phase 22: presence + read receipts (backend already emits these over the
  // socket -- chat.gateway.ts's 'presence'/'getPresence' and 'messageSeen' --
  // the base Phase 6 chat feature just never subscribed to them).
  final bool isOtherOnline;
  final DateTime? otherSeenAt;
  // Phase 22: reply-to-message -- the message the composer is currently
  // quoting, shown as a strip above the input, cleared after send/cancel.
  final Message? replyTo;
  final bool isUploadingImage;
  final String? error;

  const ChatThreadState({
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
    this.otherIsTyping = false,
    this.isOtherOnline = false,
    this.otherSeenAt,
    this.replyTo,
    this.isUploadingImage = false,
    this.error,
  });

  ChatThreadState copyWith({
    List<Message>? messages,
    bool? isLoading,
    bool? isSending,
    bool? otherIsTyping,
    bool? isOtherOnline,
    DateTime? otherSeenAt,
    Message? replyTo,
    // copyWith can't tell "leave replyTo alone" apart from "clear it" with a
    // plain nullable param (both look like `null`), so clearing needs an
    // explicit flag -- same reasoning as the `error` field below.
    bool clearReplyTo = false,
    bool? isUploadingImage,
    String? error,
  }) {
    return ChatThreadState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      otherIsTyping: otherIsTyping ?? this.otherIsTyping,
      isOtherOnline: isOtherOnline ?? this.isOtherOnline,
      otherSeenAt: otherSeenAt ?? this.otherSeenAt,
      replyTo: clearReplyTo ? null : (replyTo ?? this.replyTo),
      isUploadingImage: isUploadingImage ?? this.isUploadingImage,
      // Deliberately NOT `error ?? this.error`: every call site must decide
      // explicitly whether an error should survive this update. This is what
      // stops the "finally clobbers the catch block's error" bug that has
      // hit this codebase before -- with `?? this.error` a finally block
      // that innocently omits `error:` would silently keep clobbering
      // nothing, which sounds safe until a *different* call site's finally
      // doesn't want to keep the old error and forgets to clear it. Requiring
      // every caller to always pass `error:` (either the new message, null,
      // or `state.error` to explicitly preserve it) makes the omission itself
      // impossible to get wrong silently.
      error: error,
    );
  }
}
