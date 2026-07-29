import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/posts_providers.dart';
import '../../../../core/constants/theme.dart';

enum _StoryTab { text, image, video }

// Mirrors web/src/features/posts/components/StoryCreator.tsx: three tabs
// (text/image/video), a fixed color palette for text stories, upload-then-
// create for media stories. Video duration is left server-defaulted (5s)
// rather than probed client-side (web reads it via an offscreen <video>
// element -- there's no equivalent lightweight, dependency-free way to read
// a video's duration from a file on Flutter without adding a second video
// package purely for metadata probing, so this is a deliberate v1 gap).
class CreateStoryScreen extends ConsumerStatefulWidget {
  const CreateStoryScreen({super.key});

  @override
  ConsumerState<CreateStoryScreen> createState() => _CreateStoryScreenState();
}

class _CreateStoryScreenState extends ConsumerState<CreateStoryScreen> {
  _StoryTab _tab = _StoryTab.text;
  final _textCtrl = TextEditingController();
  String _bgColor = '#0A3D2B';
  XFile? _mediaFile;
  bool _submitting = false;
  String? _error;

  static const _colors = [
    '#0A3D2B', '#1A6B4A', '#B8892A', '#D4A853',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  ];

  @override
  void dispose() {
    _textCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickMedia() async {
    final picker = ImagePicker();
    final picked = _tab == _StoryTab.video
        ? await picker.pickVideo(source: ImageSource.gallery)
        : await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null) setState(() => _mediaFile = picked);
  }

  bool get _canSubmit {
    if (_submitting) return false;
    if (_tab == _StoryTab.text) return _textCtrl.text.trim().isNotEmpty;
    return _mediaFile != null;
  }

  Future<void> _submit() async {
    if (!_canSubmit) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      if (_tab == _StoryTab.text) {
        await ref.read(storiesProvider.notifier).createStory(
              text: _textCtrl.text.trim(),
              bgColor: _bgColor,
            );
      } else {
        final url = await ref.read(uploadStoryMediaUseCaseProvider)(_mediaFile!);
        await ref.read(storiesProvider.notifier).createStory(
              mediaUrl: url,
              mediaType: _tab == _StoryTab.video ? 'video' : 'image',
            );
      }
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'تعذّر نشر القصة، حاول مرة أخرى');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إنشاء قصة'),
        actions: [
          TextButton(
            onPressed: _canSubmit ? _submit : null,
            child: _submitting
                ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('نشر'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null) ...[
              Text(_error!, style: TextStyle(color: Colors.red.shade700)),
              const SizedBox(height: 12),
            ],
            SegmentedButton<_StoryTab>(
              segments: const [
                ButtonSegment(value: _StoryTab.text, label: Text('نص'), icon: Icon(Icons.edit_outlined)),
                ButtonSegment(value: _StoryTab.image, label: Text('صورة'), icon: Icon(Icons.image_outlined)),
                ButtonSegment(value: _StoryTab.video, label: Text('فيديو'), icon: Icon(Icons.videocam_outlined)),
              ],
              selected: {_tab},
              onSelectionChanged: (s) => setState(() {
                _tab = s.first;
                _mediaFile = null;
              }),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: _tab == _StoryTab.text ? _buildTextTab() : _buildMediaTab(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _textCtrl,
            maxLines: 2,
            maxLength: 2000,
            decoration: const InputDecoration(hintText: 'اكتب شيئاً...'),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 8),
          const Text('لون الخلفية', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final c in _colors)
                GestureDetector(
                  onTap: () => setState(() => _bgColor = c),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Color(int.parse(c.replaceFirst('#', '0xFF'))),
                      shape: BoxShape.circle,
                      border: _bgColor == c ? Border.all(color: AppTheme.primaryColor, width: 3) : null,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          AspectRatio(
            aspectRatio: 3 / 4,
            child: Container(
              decoration: BoxDecoration(
                color: Color(int.parse(_bgColor.replaceFirst('#', '0xFF'))),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              padding: const EdgeInsets.all(24),
              child: Text(
                _textCtrl.text.isEmpty ? 'مثال على النص' : _textCtrl.text,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMediaTab() {
    return Column(
      children: [
        Expanded(
          child: _mediaFile == null
              ? InkWell(
                  onTap: _pickMedia,
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppTheme.backgroundColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFD9CFB8), style: BorderStyle.solid),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_tab == _StoryTab.video ? Icons.videocam_outlined : Icons.image_outlined, size: 40),
                        const SizedBox(height: 8),
                        Text(_tab == _StoryTab.video ? 'اضغط لإضافة فيديو' : 'اضغط لإضافة صورة'),
                      ],
                    ),
                  ),
                )
              : Stack(
                  children: [
                    Positioned.fill(
                      child: _tab == _StoryTab.video
                          ? Container(
                              color: Colors.black87,
                              alignment: Alignment.center,
                              child: const Icon(Icons.play_circle_outline, color: Colors.white, size: 48),
                            )
                          : ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.file(File(_mediaFile!.path), fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black12)),
                            ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: CircleAvatar(
                        backgroundColor: Colors.black54,
                        child: IconButton(
                          icon: const Icon(Icons.close, color: Colors.white, size: 18),
                          onPressed: () => setState(() => _mediaFile = null),
                        ),
                      ),
                    ),
                  ],
                ),
        ),
      ],
    );
  }
}
