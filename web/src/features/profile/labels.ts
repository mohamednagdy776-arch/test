// Arabic display labels for the stored English profile enums. The edit form
// uses Arabic option labels, but the display surfaces (header + About tab) were
// rendering the raw stored keys (single / bachelor's / sunni / always / …) —
// see #834 (broadening of #739). Centralised here so every surface maps the
// same way.

const norm = (v: string) => v.toLowerCase().replace(/['’]/g, '').replace(/[\s-]+/g, '_').trim();

function makeLabeler(map: Record<string, string>) {
  return (value?: string | null): string => {
    if (value == null || value === '') return '—';
    return map[norm(String(value))] ?? String(value);
  };
}

export const socialStatusLabel = makeLabeler({
  single: 'أعزب', married: 'متزوج', divorced: 'مطلق', widowed: 'أرمل',
});

export const relationshipStatusLabel = makeLabeler({
  single: 'أعزب', married: 'متزوج', divorced: 'مطلق', widowed: 'أرمل',
  engaged: 'مخطوب', in_relationship: 'في علاقة', in_a_relationship: 'في علاقة', complicated: 'معقّدة',
});

export const educationLabel = makeLabeler({
  high_school: 'ثانوي', diploma: 'دبلوم', associate: 'دبلوم',
  bachelors: 'بكالوريوس', bachelor: 'بكالوريوس',
  masters: 'ماجستير', master: 'ماجستير',
  phd: 'دكتوراه', doctorate: 'دكتوراه', other: 'أخرى',
});

export const lifestyleLabel = makeLabeler({
  conservative: 'محافظ', moderate: 'معتدل', liberal: 'منفتح', religious: 'متديّن',
});

export const sectLabel = makeLabeler({
  sunni: 'سُنّي', shia: 'شيعي', shiite: 'شيعي', other: 'أخرى',
});

export const prayerLevelLabel = makeLabeler({
  always: 'دائماً', usually: 'غالباً', often: 'غالباً',
  sometimes: 'أحياناً', rarely: 'نادراً', never: 'لا يصلّي',
});

export const religiousCommitmentLabel = makeLabeler({
  committed: 'ملتزم', practicing: 'ملتزم', very_committed: 'ملتزم جداً',
  moderate: 'معتدل', non_practicing: 'غير ملتزم', not_practicing: 'غير ملتزم',
  learning: 'في طريق الالتزام',
});

export const financialLevelLabel = makeLabeler({
  low: 'منخفض', medium: 'متوسط', high: 'مرتفع', very_high: 'مرتفع جداً',
});

export const culturalLevelLabel = makeLabeler({
  low: 'منخفض', medium: 'متوسط', high: 'مرتفع',
});
