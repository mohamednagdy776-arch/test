import '../entities/lab.dart';
import '../entities/lab_referral_code.dart';

// Deliberately scoped to the regular-end-user subset of
// backend/src/lab-portal/controllers/lab-portal.controller.ts. That
// controller also has auth/login, scan, and results/submit -- confirmed via
// web source that those back a SEPARATE lab-staff portal (web/src/app/lab/
// + web/src/app/lab/scan/, its own sessionStorage-based `lab_token`/
// `x-lab-token` login, entirely outside the regular JWT this mobile app
// uses) that a dating-app end user would never sign into. Only
// web/src/app/(main)/lab-portal/page.tsx's three calls
// (labs/my-referrals/referral-code/generate, via
// web/src/features/labs/api.ts's `labsApi`) are the regular-user surface,
// and that's the only thing mirrored here.
abstract class LabPortalRepository {
  Future<List<Lab>> getActiveLabs();

  Future<List<LabReferralCode>> getMyReferrals();

  Future<LabReferralCode> generateReferralCode(String labId);
}
