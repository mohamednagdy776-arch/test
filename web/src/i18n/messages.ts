// Lightweight client-side i18n message catalogs (#49). The app stores the chosen
// locale in localStorage ('tayyibt_lang'); this provides real UI translation on
// top of the existing direction switch. Arabic + English are fully translated;
// other locales fall back to English then Arabic, so they can be filled in
// incrementally without breaking anything.

export type Locale = 'ar' | 'en' | 'ur' | 'tr' | 'id' | 'ms' | 'fr';

export const defaultLocale: Locale = 'ar';

const RTL = new Set<Locale>(['ar', 'ur']);
export function localeDir(l: Locale): 'rtl' | 'ltr' {
  return RTL.has(l) ? 'rtl' : 'ltr';
}

type Dict = Record<string, string>;

const ar: Dict = {
  'app.name': 'طيبت',
  // nav sections
  'section.main': 'الرئيسية',
  'section.connect': 'التواصل',
  'section.content': 'المحتوى',
  'section.premium': 'المميز',
  'section.account': 'الحساب',
  // nav items
  'nav.home': 'الرئيسية',
  'nav.search': 'البحث',
  'nav.messages': 'المحادثات',
  'nav.notifications': 'الإشعارات',
  'nav.saved': 'المحفوظات',
  'nav.matching': 'التوافق',
  'nav.interests': 'الاهتمامات',
  'nav.friends': 'الأصدقاء',
  'nav.family': 'العائلة',
  'nav.events': 'الفعاليات',
  'nav.communities': 'المجتمعات',
  'nav.pages': 'الصفحات',
  'nav.memories': 'الذكريات',
  'nav.watch': 'Watch',
  'nav.reels': 'ريلز',
  'nav.childPrediction': 'توقع شكل طفلك',
  'nav.childPredictionShort': 'التوقع',
  'nav.labPortal': 'بوابة المختبرات',
  'nav.labPortalShort': 'المختبرات',
  'nav.affiliates': 'برنامج الإحالة',
  'nav.affiliatesShort': 'الإحالة',
  'nav.profile': 'الملف الشخصي',
  'nav.profileShort': 'ملفي',
  'nav.settings': 'الإعدادات',
  'nav.logout': 'تسجيل الخروج',
  'nav.logoutShort': 'خروج',
  'nav.premium': 'مميز',
  'nav.menu': 'القائمة',
  'nav.account': 'حسابي',
  'nav.user': 'المستخدم',
  'nav.welcome': 'مرحباً بك في طيبت',
  // upgrade banner
  'upgrade.title': 'ترقية الحساب',
  'upgrade.desc': 'احصل على توافق متقدم وفلاتر حصرية',
  'upgrade.cta': 'ابدأ الآن مجاناً',
  // language page
  'lang.title': 'اللغة',
  'lang.subtitle': 'اختر لغة واجهة التطبيق',
  'lang.back': 'العودة للإعدادات',
  'lang.save': 'حفظ',
  'lang.saved': 'محفوظ',
  'lang.savedMsg': 'تم حفظ اللغة بنجاح',
  'lang.hint': 'اختر اللغة ثم اضغط حفظ',
  'lang.noteTitle': 'ملاحظة',
  'lang.note': 'سيتم تطبيق اللغة فور الضغط على حفظ. قد يلزم تحديث الصفحة لرؤية التغيير بالكامل.',
};

const en: Dict = {
  'app.name': 'Tayyibt',
  'section.main': 'Main',
  'section.connect': 'Connect',
  'section.content': 'Content',
  'section.premium': 'Premium',
  'section.account': 'Account',
  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.messages': 'Messages',
  'nav.notifications': 'Notifications',
  'nav.saved': 'Saved',
  'nav.matching': 'Matches',
  'nav.interests': 'Interests',
  'nav.friends': 'Friends',
  'nav.family': 'Family',
  'nav.events': 'Events',
  'nav.communities': 'Communities',
  'nav.pages': 'Pages',
  'nav.memories': 'Memories',
  'nav.watch': 'Watch',
  'nav.reels': 'Reels',
  'nav.childPrediction': 'Child Prediction',
  'nav.childPredictionShort': 'Prediction',
  'nav.labPortal': 'Lab Portal',
  'nav.labPortalShort': 'Labs',
  'nav.affiliates': 'Referral Program',
  'nav.affiliatesShort': 'Referral',
  'nav.profile': 'Profile',
  'nav.profileShort': 'Profile',
  'nav.settings': 'Settings',
  'nav.logout': 'Log out',
  'nav.logoutShort': 'Sign out',
  'nav.premium': 'Premium',
  'nav.menu': 'Menu',
  'nav.account': 'My Account',
  'nav.user': 'User',
  'nav.welcome': 'Welcome to Tayyibt',
  'upgrade.title': 'Upgrade Account',
  'upgrade.desc': 'Get advanced matching and exclusive filters',
  'upgrade.cta': 'Start now for free',
  'lang.title': 'Language',
  'lang.subtitle': 'Choose the app interface language',
  'lang.back': 'Back to settings',
  'lang.save': 'Save',
  'lang.saved': 'Saved',
  'lang.savedMsg': 'Language saved successfully',
  'lang.hint': 'Choose a language then tap Save',
  'lang.noteTitle': 'Note',
  'lang.note': 'The language is applied as soon as you tap Save. You may need to refresh the page to see the change fully.',
};

export const messages: Partial<Record<Locale, Dict>> = { ar, en };
