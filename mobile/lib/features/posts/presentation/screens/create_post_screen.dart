import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/poll_option.dart';
import '../../domain/entities/post.dart';
import '../providers/posts_providers.dart';
import '../widgets/tag_user_sheet.dart';
import '../../../../core/constants/theme.dart';
import '../../../search/domain/entities/search_user.dart';

// Backgrounds mirror web's BACKGROUNDS palette exactly
// (web/src/features/posts/components/PostComposer.tsx).
const List<String> _kBackgrounds = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

// `label` is persisted verbatim to the backend's free-text `feeling` column
// -- matches web's FEELINGS list (same two options, same Arabic labels) so a
// post created on mobile reads identically on web and vice versa.
const List<Map<String, String>> _kFeelings = [
  {'emoji': '😊', 'label': 'سعيد'},
  {'emoji': '🥰', 'label': 'محب'},
];

// Matches Audience enum (backend/src/posts/entities/post.entity.ts) and the
// subset web's own composer actually exposes (AUDIENCE_OPTIONS in
// PostComposer.tsx omits `custom`, which has no UI anywhere to configure a
// custom list, so it's dead from the composer's own perspective too).
const List<Map<String, String>> _kAudiences = [
  {'value': 'public', 'label': 'عام'},
  {'value': 'friends', 'label': 'الأصدقاء'},
  {'value': 'friends_of_friends', 'label': 'أصدقاء الأصدقاء'},
  {'value': 'only_me', 'label': 'أنا فقط'},
];

Color _hexToColor(String hex) => Color(int.parse('FF${hex.replaceFirst('#', '')}', radix: 16));

class CreatePostScreen extends ConsumerStatefulWidget {
  /// When non-null, the screen opens in edit mode for this post. Mirrors
  /// web's own EditPostModal (web/src/features/posts/components/
  /// PostCard.tsx), which only ever lets the author change plain text
  /// content -- so edit mode here intentionally hides the composer's richer
  /// create-only affordances (image/poll/feeling/bg/location/audience/tag)
  /// rather than pretending the backend supports editing them (PATCH
  /// /posts/:id accepts the full CreatePostDto shape, but only `content` is
  /// sent here, same restriction web imposes client-side).
  final Post? editingPost;

  const CreatePostScreen({super.key, this.editingPost});

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final _contentCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _pollQuestionCtrl = TextEditingController();
  final List<TextEditingController> _pollOptionCtrls = [
    TextEditingController(),
    TextEditingController(),
  ];

  XFile? _image;
  Uint8List? _imagePreview;
  bool _submitting = false;
  String? _error;

  String? _bgColor;
  String? _feeling;
  String _audience = 'friends';
  bool _showBgPicker = false;
  bool _showFeelingPicker = false;
  bool _showAudiencePicker = false;
  bool _showLocation = false;
  bool _showPollCreator = false;

  bool get _isEditing => widget.editingPost != null;

  @override
  void initState() {
    super.initState();
    if (widget.editingPost != null) {
      _contentCtrl.text = widget.editingPost!.content;
    }
  }

  @override
  void dispose() {
    _contentCtrl.dispose();
    _locationCtrl.dispose();
    _pollQuestionCtrl.dispose();
    for (final c in _pollOptionCtrls) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    setState(() {
      _image = picked;
      _imagePreview = bytes;
    });
  }

  Future<void> _openTagPicker() async {
    final user = await showModalBottomSheet<SearchUser>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const TagUserSheet(),
    );
    if (user == null || !mounted) return;
    if (user.username == null || user.username!.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('هذا المستخدم لا يملك اسم مستخدم لوسمه')));
      return;
    }
    final mention = '@${user.username} ';
    final text = _contentCtrl.text;
    final selection = _contentCtrl.selection;
    final insertAt = selection.start >= 0 ? selection.start : text.length;
    final newText = text.replaceRange(insertAt, insertAt, mention);
    _contentCtrl.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: insertAt + mention.length),
    );
  }

  void _addPollOption() {
    setState(() => _pollOptionCtrls.add(TextEditingController()));
  }

  void _removePollOption(int index) {
    if (_pollOptionCtrls.length <= 2) return;
    setState(() => _pollOptionCtrls.removeAt(index).dispose());
  }

  Future<void> _submit() async {
    if (_submitting) return;

    if (_isEditing) {
      final content = _contentCtrl.text.trim();
      if (content.isEmpty) return;
      setState(() {
        _submitting = true;
        _error = null;
      });
      try {
        final updated =
            await ref.read(updatePostUseCaseProvider)(widget.editingPost!.id, content: content);
        if (!mounted) return;
        Navigator.of(context).pop(updated);
      } catch (e) {
        if (!mounted) return;
        setState(() => _error = 'تعذّر حفظ التعديلات، حاول مرة أخرى');
      } finally {
        if (mounted) setState(() => _submitting = false);
      }
      return;
    }

    final content = _contentCtrl.text.trim();
    List<PollOption>? pollOptions;
    if (_showPollCreator) {
      final question = _pollQuestionCtrl.text.trim();
      final opts = _pollOptionCtrls.map((c) => c.text.trim()).where((t) => t.isNotEmpty).toList();
      if (question.isNotEmpty && opts.length >= 2) {
        pollOptions = opts.map((t) => PollOption(text: t)).toList();
      }
    }
    // A poll's question text becomes the post body when there's no separate
    // caption -- otherwise an empty `content` fails CreatePostDto's
    // @IsNotEmpty and the poll never posts at all, same fallback web's own
    // composer applies (PostComposer.tsx's finalContent).
    final finalContent =
        content.isNotEmpty ? content : (pollOptions != null ? _pollQuestionCtrl.text.trim() : '');
    if (finalContent.isEmpty && _image == null) return;

    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final post = await ref.read(createPostUseCaseProvider).call(
            content: finalContent,
            image: _image,
            bgColor: _bgColor,
            feeling: _feeling,
            location: _locationCtrl.text.trim().isEmpty ? null : _locationCtrl.text.trim(),
            audience: _audience,
            pollOptions: pollOptions,
          );
      if (!mounted) return;
      Navigator.of(context).pop(post);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = 'تعذّر نشر المنشور، حاول مرة أخرى');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'تعديل المنشور' : 'منشور جديد'),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _submit,
            child: _submitting
                ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : Text(_isEditing ? 'حفظ' : 'نشر'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null) ...[
              Text(_error!, style: TextStyle(color: Colors.red.shade700)),
              const SizedBox(height: 12),
            ],
            TextField(
              controller: _contentCtrl,
              maxLines: _bgColor != null ? 4 : 6,
              maxLength: 10000,
              textAlign: _bgColor != null ? TextAlign.center : TextAlign.start,
              style: _bgColor != null
                  ? TextStyle(color: _hexToColor(_bgColor!).computeLuminance() > 0.6 ? Colors.black87 : Colors.white)
                  : null,
              decoration: InputDecoration(
                hintText: 'بم تفكر؟',
                border: _bgColor != null ? InputBorder.none : null,
                filled: _bgColor != null,
                fillColor: _bgColor != null ? _hexToColor(_bgColor!) : null,
              ),
              autofocus: true,
            ),
            if (_imagePreview != null) ...[
              const SizedBox(height: 8),
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.memory(_imagePreview!, height: 200, width: double.infinity, fit: BoxFit.cover),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: IconButton(
                      icon: const CircleAvatar(radius: 14, child: Icon(Icons.close, size: 16)),
                      onPressed: () => setState(() {
                        _image = null;
                        _imagePreview = null;
                      }),
                    ),
                  ),
                ],
              ),
            ],
            // Everything below is create-only, matching web's own
            // EditPostModal (content-only edit).
            if (!_isEditing) ...[
              if (_showBgPicker) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final color in _kBackgrounds)
                      GestureDetector(
                        onTap: () => setState(() {
                          _bgColor = color;
                          _showBgPicker = false;
                        }),
                        child: CircleAvatar(
                          radius: 16,
                          backgroundColor: _hexToColor(color),
                          child: _bgColor == color ? const Icon(Icons.check, color: Colors.white, size: 16) : null,
                        ),
                      ),
                    GestureDetector(
                      onTap: () => setState(() {
                        _bgColor = null;
                        _showBgPicker = false;
                      }),
                      child: const CircleAvatar(radius: 16, child: Icon(Icons.close, size: 16)),
                    ),
                  ],
                ),
              ],
              if (_showFeelingPicker) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final f in _kFeelings)
                      ChoiceChip(
                        label: Text('${f['emoji']} ${f['label']}'),
                        selected: _feeling == f['label'],
                        onSelected: (_) => setState(() {
                          _feeling = _feeling == f['label'] ? null : f['label'];
                          _showFeelingPicker = false;
                        }),
                      ),
                  ],
                ),
              ],
              if (_showAudiencePicker) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final a in _kAudiences)
                      ChoiceChip(
                        label: Text(a['label']!),
                        selected: _audience == a['value'],
                        onSelected: (_) => setState(() {
                          _audience = a['value']!;
                          _showAudiencePicker = false;
                        }),
                      ),
                  ],
                ),
              ],
              if (_showLocation) ...[
                const SizedBox(height: 10),
                TextField(
                  controller: _locationCtrl,
                  decoration: const InputDecoration(
                    hintText: 'أضف موقعاً',
                    prefixIcon: Icon(Icons.location_on_outlined),
                  ),
                ),
              ],
              if (_showPollCreator) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.backgroundColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextField(
                        controller: _pollQuestionCtrl,
                        decoration: const InputDecoration(hintText: 'اطرح سؤالاً...'),
                      ),
                      const SizedBox(height: 8),
                      for (var i = 0; i < _pollOptionCtrls.length; i++)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _pollOptionCtrls[i],
                                  decoration: InputDecoration(hintText: 'خيار ${i + 1}'),
                                ),
                              ),
                              if (_pollOptionCtrls.length > 2)
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: AppTheme.dangerColor),
                                  onPressed: () => _removePollOption(i),
                                ),
                            ],
                          ),
                        ),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton.icon(
                          onPressed: _addPollOption,
                          icon: const Icon(Icons.add),
                          label: const Text('إضافة خيار'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Wrap(
                spacing: 4,
                children: [
                  IconButton(
                    icon: const Icon(Icons.palette_outlined),
                    tooltip: 'لون الخلفية',
                    onPressed: () => setState(() => _showBgPicker = !_showBgPicker),
                  ),
                  IconButton(
                    icon: const Icon(Icons.image_outlined),
                    tooltip: 'صورة',
                    onPressed: _pickImage,
                  ),
                  IconButton(
                    icon: const Icon(Icons.mood_outlined),
                    tooltip: 'شعور',
                    onPressed: () => setState(() => _showFeelingPicker = !_showFeelingPicker),
                  ),
                  IconButton(
                    icon: const Icon(Icons.location_on_outlined),
                    tooltip: 'الموقع',
                    onPressed: () => setState(() => _showLocation = !_showLocation),
                  ),
                  IconButton(
                    icon: const Icon(Icons.person_add_alt_outlined),
                    tooltip: 'وسم صديق',
                    onPressed: _openTagPicker,
                  ),
                  IconButton(
                    icon: const Icon(Icons.groups_outlined),
                    tooltip: 'الجمهور',
                    onPressed: () => setState(() => _showAudiencePicker = !_showAudiencePicker),
                  ),
                  IconButton(
                    icon: const Icon(Icons.bar_chart_outlined),
                    tooltip: 'استطلاع رأي',
                    onPressed: () => setState(() => _showPollCreator = !_showPollCreator),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
