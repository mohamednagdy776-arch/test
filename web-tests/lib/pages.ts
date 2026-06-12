import { PageMeta } from './helpers';

// Real fixture values pulled from the live database for dynamic routes.
// NOTE: do not use the username "admin" — nginx routes /admin/ to the admin
// dashboard app (location /admin/ -> http://admin/), so it never reaches the
// web /[username] page. The logged-in user's own profile is covered by the
// static /profile route instead.
export const FIX = {
  otherUsername: 'tamerfarouk21',
  pageId: '110e2521-454e-4008-8af9-d89882dc3070',
  groupId: '8990be98-fb6a-43c1-aabd-c85b11c8c7e6',
};

// ---- Public pages (no auth) -------------------------------------------------
export const PUBLIC_PAGES: PageMeta[] = [
  { name: 'Landing', path: '/', heading: /طيبت/, auth: 'guest' },
  { name: 'Privacy Policy', path: '/privacy', heading: /سياسة الخصوصية/, auth: 'guest' },
  { name: 'Terms of Service', path: '/terms', heading: /شروط الخدمة/, auth: 'guest' },
  { name: 'Mockups', path: '/mockups', heading: /Tayyibt Mockups/, auth: 'guest' },
];

// ---- Auth pages (no auth) ---------------------------------------------------
export const AUTH_PAGES: PageMeta[] = [
  { name: 'Login', path: '/login', heading: /تسجيل الدخول/, auth: 'guest' },
  { name: 'Register', path: '/register', heading: /إنشاء حساب جديد/, auth: 'guest' },
  { name: 'Forgot Password', path: '/forgot-password', heading: /نسيت كلمة المرور/, auth: 'guest' },
  { name: 'Verify Email', path: '/verify-email', heading: /البريد الإلكتروني/, auth: 'guest' },
  { name: 'Reset Password', path: '/reset-password/test-token-123', heading: /كلمة المرور/, auth: 'guest' },
];

// ---- Main authenticated pages ----------------------------------------------
export const MAIN_PAGES: PageMeta[] = [
  { name: 'Dashboard', path: '/dashboard', heading: /الرئيسية/, auth: 'user' },
  { name: 'Profile', path: '/profile', heading: /الملف الشخصي/, auth: 'user' },
  { name: 'Search', path: '/search', heading: /البحث/, auth: 'user' },
  { name: 'Upgrade', path: '/upgrade', heading: /اختر الخطة المناسبة/, auth: 'user' },
  { name: 'Pages', path: '/pages', heading: /الصفحات/, auth: 'user' },
  { name: 'Events', path: '/events', heading: /الأحداث/, auth: 'user' },
  { name: 'Groups', path: '/groups', heading: /المجتمعات/, auth: 'user' },
  { name: 'Saved', path: '/saved', heading: /المحفوظات/, auth: 'user' },
  { name: 'Chat', path: '/chat', heading: /المحادثات/, auth: 'user' },
  { name: 'Friends', path: '/friends', heading: /الأصدقاء/, auth: 'user' },
  { name: 'Matching', path: '/matching', heading: /التوافق/, auth: 'user' },
  { name: 'Memories', path: '/memories', heading: /الذكريات/, auth: 'user' },
  { name: 'Notifications', path: '/notifications', heading: /الإشعارات/, auth: 'user' },
  { name: 'Posts', path: '/posts', heading: /المنشورات/, auth: 'user' },
  { name: 'Watch', path: '/watch', heading: /Watch/, auth: 'user' },
];

// ---- Settings pages (authenticated) ----------------------------------------
export const SETTINGS_PAGES: PageMeta[] = [
  { name: 'Settings', path: '/settings', heading: /الإعدادات/, auth: 'user' },
  { name: 'Settings · Account', path: '/settings/account', auth: 'user' },
  { name: 'Settings · Appearance', path: '/settings/appearance', heading: /المظهر/, auth: 'user' },
  { name: 'Settings · Help', path: '/settings/help', heading: /المساعدة والدعم/, auth: 'user' },
  { name: 'Settings · Language', path: '/settings/language', heading: /اللغة/, auth: 'user' },
  { name: 'Settings · Notifications', path: '/settings/notifications', heading: /الإشعارات/, auth: 'user' },
  { name: 'Settings · Privacy', path: '/settings/privacy', heading: /الخصوصية/, auth: 'user' },
  { name: 'Settings · Security', path: '/settings/security', heading: /الأمان/, auth: 'user' },
  { name: 'Settings · Report', path: '/settings/report', heading: /الإبلاغ عن مشكلة/, auth: 'user' },
];

// ---- Dynamic routes (authenticated) ----------------------------------------
export const DYNAMIC_PAGES: PageMeta[] = [
  { name: 'User Profile (by username)', path: `/${FIX.otherUsername}`, auth: 'user' },
  { name: 'Page detail', path: `/pages/${FIX.pageId}`, auth: 'user' },
  { name: 'Group detail', path: `/groups/${FIX.groupId}`, auth: 'user' },
];

// Paths that must redirect unauthenticated visitors to /login.
export const GATED_PATHS: string[] = [
  ...MAIN_PAGES.map((p) => p.path),
  ...SETTINGS_PAGES.map((p) => p.path),
  ...DYNAMIC_PAGES.map((p) => p.path),
];
