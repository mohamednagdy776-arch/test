import '../../domain/entities/subscription.dart';

class PremiumState {
  final List<Subscription> history;
  final Subscription? active;
  final bool isLoading;
  final bool isMutating;
  final String? error;

  const PremiumState({
    this.history = const [],
    this.active,
    this.isLoading = false,
    this.isMutating = false,
    this.error,
  });

  // GET /subscriptions/me/active already only returns a subscription while
  // it's active (confirmed live: cancelling one makes this endpoint go back
  // to `data: null`), but `active` is also re-set directly from the PATCH
  // .../cancel response for instant UI feedback, so re-check isActive too.
  String get activePlan => active?.isActive == true ? active!.plan : 'free';

  // `active` and `error` are always directly assigned (no `?? this.field`
  // fallback) so a null active subscription (no active plan) or a cleared
  // error can actually be set -- callers that mean to preserve the current
  // value must explicitly pass `active: state.active` / `error: state.error`,
  // same convention as every other notifier's `error` field in this app.
  PremiumState copyWith({
    List<Subscription>? history,
    Subscription? active,
    bool? isLoading,
    bool? isMutating,
    String? error,
  }) {
    return PremiumState(
      history: history ?? this.history,
      active: active,
      isLoading: isLoading ?? this.isLoading,
      isMutating: isMutating ?? this.isMutating,
      error: error,
    );
  }
}
