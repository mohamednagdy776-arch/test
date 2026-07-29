import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/videos_providers.dart';

// Mirrors web/src/app/(main)/videos/upload/page.tsx: pick a video file
// (image_picker already supports video mode -- no new dependency needed for
// picking, only for playback), title + optional description, then the same
// two-step upload-then-create flow the web client uses (POST /upload/media,
// then POST /videos). `isReel` decides whether this becomes a Watch video or
// a Reel, same as the web page's `?reel=1` query param.
//
// Deliberate simplification: web probes the file client-side for a
// thumbnail frame + real duration via an offscreen <video> element before
// upload; there's no equivalent zero-dependency way to do that from a raw
// file on Flutter, so this leaves thumbnail/duration unset and lets the
// video list fall back to its placeholder thumbnail -- the same fallback
// path web already has for videos with no thumbnail at all.
class VideoUploadScreen extends ConsumerStatefulWidget {
  final bool isReel;
  const VideoUploadScreen({super.key, required this.isReel});

  @override
  ConsumerState<VideoUploadScreen> createState() => _VideoUploadScreenState();
}

class _VideoUploadScreenState extends ConsumerState<VideoUploadScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  XFile? _file;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickVideo() async {
    final picked = await ImagePicker().pickVideo(source: ImageSource.gallery);
    if (picked == null) return;
    setState(() {
      _file = picked;
      if (_titleCtrl.text.isEmpty) {
        final name = picked.name.replaceAll(RegExp(r'\.[^.]+$'), '');
        _titleCtrl.text = name;
      }
    });
  }

  bool get _canSubmit => _file != null && _titleCtrl.text.trim().isNotEmpty && !_submitting;

  Future<void> _submit() async {
    if (!_canSubmit) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final url = await ref.read(uploadVideoMediaUseCaseProvider)(_file!);
      await ref.read(createVideoUseCaseProvider)(
        title: _titleCtrl.text.trim(),
        description: _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        url: url,
        isReel: widget.isReel,
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = 'تعذر رفع الفيديو، حاول مرة أخرى');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.isReel ? 'رفع ريل' : 'رفع فيديو')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null) ...[
              Text(_error!, style: TextStyle(color: Colors.red.shade700)),
              const SizedBox(height: 12),
            ],
            InkWell(
              onTap: _pickVideo,
              child: Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: _file == null
                    ? const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.upload_outlined, size: 36),
                            SizedBox(height: 8),
                            Text('اضغط لاختيار ملف فيديو'),
                          ],
                        ),
                      )
                    : Stack(
                        alignment: Alignment.center,
                        children: [
                          const Icon(Icons.videocam, size: 48),
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Text(File(_file!.path).uri.pathSegments.last,
                                style: const TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _titleCtrl,
              maxLength: 120,
              decoration: const InputDecoration(labelText: 'العنوان'),
              onChanged: (_) => setState(() {}),
            ),
            TextField(
              controller: _descCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'الوصف (اختياري)'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _canSubmit ? _submit : null,
              child: _submitting
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(widget.isReel ? 'نشر الريل' : 'نشر الفيديو'),
            ),
          ],
        ),
      ),
    );
  }
}
