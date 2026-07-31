import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/subscription.dart';
import '../../domain/use_cases/premium_use_case.dart';
import 'premium_state.dart';

class PremiumNotifier extends StateNotifier<PremiumState> {
  final PremiumUseCase _useCase;
  PremiumNotifier(this._useCase) : super(const PremiumState());

  Future<void> loadInitial() async {
    state = state.copyWith(active: state.active, isLoading: true, error: null);
    try {
      final active = await _useCase.getActiveSubscription();
      final history = await _useCase.getMySubscriptions();
      state = state.copyWith(history: history, active: active, isLoading: false, error: null);
    } catch (_) {
      // Explicitly re-pass active (not just isLoading: false) -- copyWith
      // resets `active` to null unless it's passed on every call, which would
      // otherwise silently drop an already-loaded active subscription.
      state = state.copyWith(active: state.active, isLoading: false, error: 'تعذّر تحميل بيانات الاشتراك');
    }
  }

  Future<Subscription?> subscribe(String plan) async {
    state = state.copyWith(active: state.active, isMutating: true, error: null);
    try {
      final sub = await _useCase.createSubscription(plan);
      state = state.copyWith(
        history: [sub, ...state.history],
        active: sub,
        isMutating: false,
        error: null,
      );
      return sub;
    } catch (_) {
      state = state.copyWith(active: state.active, isMutating: false, error: 'تعذّر إتمام الاشتراك، حاول مجدداً');
      return null;
    }
  }

  Future<bool> cancel(String id) async {
    state = state.copyWith(active: state.active, isMutating: true, error: null);
    try {
      final cancelled = await _useCase.cancelSubscription(id);
      state = state.copyWith(
        history: state.history.map((s) => s.id == cancelled.id ? cancelled : s).toList(),
        active: cancelled,
        isMutating: false,
        error: null,
      );
      return true;
    } catch (_) {
      state = state.copyWith(active: state.active, isMutating: false, error: 'فشل إلغاء الاشتراك، حاول مجدداً');
      return false;
    }
  }
}
