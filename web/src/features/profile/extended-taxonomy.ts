// Curated interests/skills tag taxonomy for the Extended Profile section.
// Stored flat as string[] on Profile#interests / Profile#skills; grouped
// here only for the picker UI. Values are the raw Arabic labels themselves
// (no separate enum) since these are free-form self-description tags, not
// fields the backend branches logic on.

export interface TagGroup {
  labelKey: string;
  label: string;
  options: string[];
}

export const INTEREST_GROUPS: TagGroup[] = [
  {
    label: 'الهوايات',
    labelKey: 'extendedProfile.interests.hobbies',
    options: ['قراءة', 'كتابة', 'رسم', 'تصوير', 'طبخ', 'بستنة', 'ألعاب فيديو'],
  },
  {
    label: 'الاهتمامات الفكرية',
    labelKey: 'extendedProfile.interests.intellectual',
    options: ['كتب فلسفية', 'ندوات ثقافية', 'نقاشات فكرية'],
  },
  {
    label: 'الاهتمامات الفنية',
    labelKey: 'extendedProfile.interests.artistic',
    options: ['متاحف فنية', 'عروض مسرحية', 'موسيقى', 'سينما'],
  },
  {
    label: 'الاهتمامات الاجتماعية',
    labelKey: 'extendedProfile.interests.social',
    options: ['فعاليات مجتمعية', 'زيارة الأقارب', 'الخروج مع الأصدقاء'],
  },
  {
    label: 'خدمة المجتمع',
    labelKey: 'extendedProfile.interests.community',
    options: ['التطوع الخيري', 'مبادرات مجتمعية'],
  },
  {
    label: 'الاهتمامات الأدبية',
    labelKey: 'extendedProfile.interests.literary',
    options: ['شعر', 'روايات', 'مقالات'],
  },
  {
    label: 'السفر والاستكشاف',
    labelKey: 'extendedProfile.interests.travel',
    options: ['استكشاف أماكن جديدة', 'رحلات برية', 'سياحة دينية', 'رحلات بحرية'],
  },
  {
    label: 'الاهتمامات التاريخية',
    labelKey: 'extendedProfile.interests.historical',
    options: ['زيارة الآثار', 'كتب تاريخية'],
  },
  {
    label: 'الرياضة',
    labelKey: 'extendedProfile.interests.sports',
    options: ['كرة القدم', 'السباحة', 'التنس', 'ركوب الخيل', 'الفنون القتالية', 'ركوب الدراجات', 'الجري'],
  },
  {
    label: 'الاهتمامات الغذائية',
    labelKey: 'extendedProfile.interests.food',
    options: ['المأكولات الشرقية', 'المأكولات الغربية', 'المأكولات الآسيوية', 'الأكل الصحي', 'المشويات'],
  },
];

export const SKILL_GROUPS: TagGroup[] = [
  {
    label: 'اللغات والتقنية',
    labelKey: 'extendedProfile.skills.techLang',
    options: ['لغات أجنبية متعددة', 'برمجة', 'تصميم جرافيك'],
  },
  {
    label: 'المهارات اليدوية',
    labelKey: 'extendedProfile.skills.handcraft',
    options: ['نجارة', 'سباكة', 'كهرباء'],
  },
  {
    label: 'المهارات الفنية',
    labelKey: 'extendedProfile.skills.artistic',
    options: ['رسم', 'نحت', 'موسيقى', 'غناء', 'رقص'],
  },
  {
    label: 'المهارات الاجتماعية',
    labelKey: 'extendedProfile.skills.social',
    options: ['تنظيم الفعاليات', 'تقديم العروض'],
  },
  {
    label: 'المهارات الميكانيكية',
    labelKey: 'extendedProfile.skills.mechanical',
    options: ['إصلاح السيارات', 'صيانة الدراجات'],
  },
  {
    label: 'المهارات الحركية والمائية',
    labelKey: 'extendedProfile.skills.physical',
    options: ['السباحة', 'الجري', 'ركوب الدراجات', 'رياضات مائية'],
  },
  {
    label: 'المهارات الزراعية والصناعية',
    labelKey: 'extendedProfile.skills.agriIndustrial',
    options: ['الزراعة', 'تربية الحيوانات', 'العمل الصناعي'],
  },
  {
    label: 'المهارات الإدارية',
    labelKey: 'extendedProfile.skills.management',
    options: ['إدارة المشاريع', 'التخطيط الاستراتيجي', 'التفاوض'],
  },
];
