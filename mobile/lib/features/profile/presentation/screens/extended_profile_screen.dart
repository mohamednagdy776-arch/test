import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/extended_taxonomy.dart';
import '../../domain/entities/profile.dart';
import '../providers/profile_providers.dart';
import '../../../../core/constants/theme.dart';

const _maxTagLength = 60;
const _maxTags = 50;

class _EnumField {
  final String key;
  final String label;
  final List<MapEntry<String, String>> options; // value -> label
  const _EnumField(this.key, this.label, this.options);
}

const _enumFields = [
  _EnumField('healthStatus', 'الوضع الصحي', [
    MapEntry('healthy', 'سليم'),
    MapEntry('has_condition', 'يعاني من حالة صحية'),
  ]),
  _EnumField('employmentType', 'الوضع المهني', [
    MapEntry('employee', 'موظف'),
    MapEntry('business_owner', 'صاحب عمل'),
    MapEntry('retired', 'متقاعد'),
    MapEntry('other', 'أخرى'),
  ]),
  _EnumField('quranMemorization', 'حفظ القرآن', [
    MapEntry('none', 'لا يوجد حفظ'),
    MapEntry('juz_amma', 'جزء عمّ'),
    MapEntry('several_juz', 'عدة أجزاء'),
    MapEntry('half_or_more', 'نصف القرآن أو أكثر'),
    MapEntry('complete', 'القرآن كاملاً'),
  ]),
  _EnumField('mosqueAttendance', 'الذهاب إلى المسجد', [
    MapEntry('rarely', 'نادراً'),
    MapEntry('friday_only', 'الجمعة فقط'),
    MapEntry('weekly', 'أسبوعياً'),
    MapEntry('daily', 'يومياً'),
  ]),
  _EnumField('insuranceType', 'التأمين', [
    MapEntry('life', 'تأمين على الحياة'),
    MapEntry('health', 'تأمين صحي'),
    MapEntry('none', 'لا أملك أي تأمين'),
  ]),
];

class ExtendedProfileScreen extends ConsumerStatefulWidget {
  const ExtendedProfileScreen({super.key});

  @override
  ConsumerState<ExtendedProfileScreen> createState() => _ExtendedProfileScreenState();
}

class _ExtendedProfileScreenState extends ConsumerState<ExtendedProfileScreen> {
  final Map<String, String> _enumValues = {};
  final _settleCountryCtrl = TextEditingController();
  List<String> _interests = [];
  List<String> _skills = [];
  bool _saving = false;
  bool _initialized = false;

  void _initFrom(Profile profile) {
    if (_initialized) return;
    _initialized = true;
    _enumValues['healthStatus'] = profile.healthStatus ?? '';
    _enumValues['employmentType'] = profile.employmentType ?? '';
    _enumValues['quranMemorization'] = profile.quranMemorization ?? '';
    _enumValues['mosqueAttendance'] = profile.mosqueAttendance ?? '';
    _enumValues['insuranceType'] = profile.insuranceType ?? '';
    _settleCountryCtrl.text = profile.settleCountry ?? '';
    _interests = List.of(profile.interests);
    _skills = List.of(profile.skills);
  }

  @override
  void dispose() {
    _settleCountryCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      // Empty-string enum values must be dropped before sending -- the
      // backend DTO's @IsOptional() only skips null/undefined, not '', so an
      // unset dropdown sent as '' 400s @IsEnum (same gotcha the web version
      // hit and documented).
      final payload = <String, dynamic>{
        for (final e in _enumValues.entries)
          if (e.value.isNotEmpty) e.key: e.value,
        'settleCountry': _settleCountryCtrl.text.trim(),
        'interests': _interests,
        'skills': _skills,
      };
      await ref.read(updateProfileUseCaseProvider).call(payload);
      ref.invalidate(myProfileProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ بياناتك بنجاح')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذّر حفظ البيانات، حاول مرة أخرى')),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(myProfileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي الموسّع')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('تعذّر تحميل الملف الشخصي: $error')),
        data: (profile) {
          _initFrom(profile);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'كل ما تضيفه هنا اختياري، ويساعد في حساب توافق أدق مع الأشخاص المناسبين لك.',
                  style: TextStyle(color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 20),
                _card('بيانات شخصية إضافية', [
                  for (final field in _enumFields) _enumDropdown(field),
                  _settleCountryField(),
                ]),
                const SizedBox(height: 16),
                _card('الاهتمامات والهوايات', [
                  _customTagSection(_interests, (v) => setState(() => _interests = v)),
                  const SizedBox(height: 16),
                  _tagPicker(kInterestGroups, _interests, (v) => setState(() => _interests = v)),
                ]),
                const SizedBox(height: 16),
                _card('المهارات', [
                  _customTagSection(_skills, (v) => setState(() => _skills = v)),
                  const SizedBox(height: 16),
                  _tagPicker(kSkillGroups, _skills, (v) => setState(() => _skills = v)),
                ]),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('حفظ التغييرات'),
                ),
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _card(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _enumDropdown(_EnumField field) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: DropdownButtonFormField<String>(
        initialValue: _enumValues[field.key]!.isEmpty ? null : _enumValues[field.key],
        decoration: InputDecoration(labelText: field.label),
        items: field.options
            .map((o) => DropdownMenuItem(value: o.key, child: Text(o.value)))
            .toList(),
        onChanged: (v) => setState(() => _enumValues[field.key] = v ?? ''),
      ),
    );
  }

  Widget _settleCountryField() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: TextField(
        controller: _settleCountryCtrl,
        maxLength: 100,
        decoration: const InputDecoration(labelText: 'الرغبة في الاستقرار (بلد معين)', hintText: 'مثال: السعودية'),
      ),
    );
  }

  Widget _tagPicker(List<TagGroup> groups, List<String> selected, ValueChanged<List<String>> onChange) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final group in groups) ...[
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 6),
            child: Text(group.label, style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final tag in group.options)
                _chip(tag, selected.contains(tag), () {
                  final next = List<String>.from(selected);
                  selected.contains(tag) ? next.remove(tag) : next.add(tag);
                  onChange(next);
                }),
            ],
          ),
        ],
      ],
    );
  }

  Widget _customTagSection(List<String> selected, ValueChanged<List<String>> onChange) {
    final known = {
      for (final g in [...kInterestGroups, ...kSkillGroups]) ...g.options,
    };
    final custom = selected.where((t) => !known.contains(t)).toList();
    return _CustomTagSection(selected: selected, custom: custom, onChange: onChange);
  }

  Widget _chip(String label, bool active, VoidCallback onTap, {bool removable = false}) {
    return _tagChip(label, active, onTap, removable: removable);
  }
}

Widget _tagChip(String label, bool active, VoidCallback onTap, {bool removable = false}) {
  return FilterChip(
    label: Text(label),
    selected: active,
    onSelected: (_) => onTap(),
    avatar: removable ? const Icon(Icons.close, size: 16) : null,
  );
}

// Owns its own TextEditingController correctly (initState/dispose) instead of
// recreating one on every parent rebuild.
class _CustomTagSection extends StatefulWidget {
  final List<String> selected;
  final List<String> custom;
  final ValueChanged<List<String>> onChange;

  const _CustomTagSection({required this.selected, required this.custom, required this.onChange});

  @override
  State<_CustomTagSection> createState() => _CustomTagSectionState();
}

class _CustomTagSectionState extends State<_CustomTagSection> {
  final _draftCtrl = TextEditingController();

  @override
  void dispose() {
    _draftCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final value = _draftCtrl.text.trim();
    if (value.isEmpty) return;
    if (value.length > _maxTagLength) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('الحد الأقصى $_maxTagLength حرفاً')),
      );
      return;
    }
    if (widget.selected.length >= _maxTags || widget.selected.contains(value)) return;
    widget.onChange([...widget.selected, value]);
    _draftCtrl.clear();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('إضافاتك الخاصة', style: TextStyle(fontWeight: FontWeight.w600)),
        if (widget.custom.isNotEmpty) ...[
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final tag in widget.custom)
                _tagChip(
                  tag,
                  true,
                  () => widget.onChange(widget.selected.where((t) => t != tag).toList()),
                  removable: true,
                ),
            ],
          ),
        ],
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _draftCtrl,
                maxLength: _maxTagLength,
                decoration: const InputDecoration(
                  hintText: 'اكتب ما يميّزك ولم تجده في القائمة...',
                  counterText: '',
                ),
                onSubmitted: (_) => _submit(),
              ),
            ),
            const SizedBox(width: 8),
            FilledButton(onPressed: _submit, child: const Text('إضافة')),
          ],
        ),
      ],
    );
  }
}
