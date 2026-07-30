import '../../domain/entities/consent_request.dart';

enum ConsentTab { incoming, outgoing }

class ConsentState {
  final ConsentTab tab;
  final List<ConsentRequestItem> incoming;
  final List<ConsentRequestItem> outgoing;
  final bool isLoading;
  final String? error;

  const ConsentState({
    this.tab = ConsentTab.incoming,
    this.incoming = const [],
    this.outgoing = const [],
    this.isLoading = false,
    this.error,
  });

  ConsentState copyWith({
    ConsentTab? tab,
    List<ConsentRequestItem>? incoming,
    List<ConsentRequestItem>? outgoing,
    bool? isLoading,
    String? error,
  }) {
    return ConsentState(
      tab: tab ?? this.tab,
      incoming: incoming ?? this.incoming,
      outgoing: outgoing ?? this.outgoing,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}
