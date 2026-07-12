// A shared, canonical country list -- previously both the profile-edit
// country field and the search-filter country field were free text with no
// fixed vocabulary, so the SAME country could be stored/searched as "مصر" in
// one place and "Egypt" in another, and an ILIKE substring match between the
// two never found anything (#345). Using the same option list (and value)
// everywhere keeps new data consistent and searchable going forward.
export const COUNTRIES: [string, string][] = [
  ['مصر', 'مصر'],
  ['السعودية', 'السعودية'],
  ['الإمارات', 'الإمارات'],
  ['الكويت', 'الكويت'],
  ['قطر', 'قطر'],
  ['البحرين', 'البحرين'],
  ['عمان', 'عمان'],
  ['الأردن', 'الأردن'],
  ['لبنان', 'لبنان'],
  ['سوريا', 'سوريا'],
  ['العراق', 'العراق'],
  ['فلسطين', 'فلسطين'],
  ['ليبيا', 'ليبيا'],
  ['تونس', 'تونس'],
  ['الجزائر', 'الجزائر'],
  ['المغرب', 'المغرب'],
  ['السودان', 'السودان'],
  ['اليمن', 'اليمن'],
  ['تركيا', 'تركيا'],
  ['ماليزيا', 'ماليزيا'],
  ['إندونيسيا', 'إندونيسيا'],
  ['باكستان', 'باكستان'],
  ['المملكة المتحدة', 'المملكة المتحدة'],
  ['الولايات المتحدة', 'الولايات المتحدة'],
  ['كندا', 'كندا'],
  ['فرنسا', 'فرنسا'],
  ['ألمانيا', 'ألمانيا'],
  ['أخرى', 'أخرى'],
];
