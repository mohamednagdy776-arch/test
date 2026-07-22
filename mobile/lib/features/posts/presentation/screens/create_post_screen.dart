import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../providers/posts_providers.dart';

class CreatePostScreen extends ConsumerStatefulWidget {
  const CreatePostScreen({super.key});

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final _contentCtrl = TextEditingController();
  XFile? _image;
  Uint8List? _imagePreview;
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _contentCtrl.dispose();
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

  Future<void> _submit() async {
    if (_contentCtrl.text.trim().isEmpty || _submitting) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final post = await ref.read(createPostUseCaseProvider).call(
            content: _contentCtrl.text.trim(),
            image: _image,
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
        title: const Text('منشور جديد'),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _submit,
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
            TextField(
              controller: _contentCtrl,
              maxLines: 6,
              maxLength: 10000,
              decoration: const InputDecoration(hintText: 'بم تفكر؟', border: InputBorder.none),
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
            const SizedBox(height: 8),
            IconButton(
              icon: const Icon(Icons.image_outlined),
              onPressed: _pickImage,
            ),
          ],
        ),
      ),
    );
  }
}
