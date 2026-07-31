import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../domain/entities/child_prediction_result.dart';
import '../providers/child_prediction_providers.dart';
import '../state/child_prediction_state.dart';

// Mirrors web/src/app/(main)/child-prediction/page.tsx's "fusion chamber"
// redesign: two parent upload slots either side of a central heart/orb, a
// staged processing ritual (analyzing -> generating -> rendering) with an
// elapsed-time counter instead of a generic spinner (this is a genuinely
// slow, 3-4 minute pipeline -- confirmed live at ~3m46s for one call -- so a
// plain spinner would read as broken/hung), then a gold-framed result reveal.
//
// Two deliberate simplifications from web, both flagged here and in the
// phase report:
// 1. No WhatsApp/Telegram deep-link share buttons and no "download to
//    device" button. Web opens wa.me/t.me URLs and an <a download> browser
//    action; neither has a mobile equivalent without a new package
//    (url_launcher for the deep links, path_provider/gallery-saver for a
//    real file save) -- this app has deliberately avoided adding
//    url_launcher for even simpler single-link cases before (see
//    settings/help_settings_screen.dart's own note). "Copy link" (the
//    server-persisted, shareable mediaUrl, same one web's share buttons
//    point at) covers the same underlying need -- share it manually to
//    WhatsApp/Telegram/anywhere -- without a new dependency.
// 2. No drag-and-drop (mobile has no drag target); tapping a slot opens the
//    gallery picker directly, same convention as every other image_picker
//    use in this app (create_post_screen, avatar upload, ...).
class ChildPredictionScreen extends ConsumerStatefulWidget {
  const ChildPredictionScreen({super.key});

  @override
  ConsumerState<ChildPredictionScreen> createState() => _ChildPredictionScreenState();
}

class _ChildPredictionScreenState extends ConsumerState<ChildPredictionScreen> {
  XFile? _parent1;
  XFile? _parent2;

  static const _labels = <ChildPredictionStage, String>{
    ChildPredictionStage.analyzing: 'الذكاء الاصطناعي يحلل ملامح الوجوه...',
    ChildPredictionStage.generating: 'يبني توقّع ملامح الطفل...',
    ChildPredictionStage.rendering: 'يرسم صورة الطفل...',
    ChildPredictionStage.done: 'اكتمل! ✨',
    ChildPredictionStage.error: 'حدث خطأ، يرجى المحاولة مجدداً',
  };

  static const _steps = <ChildPredictionStage, String>{
    ChildPredictionStage.analyzing: 'تحليل الملامح',
    ChildPredictionStage.generating: 'مزج الوراثة',
    ChildPredictionStage.rendering: 'رسم الصورة',
  };

  bool get _bothReady => _parent1 != null && _parent2 != null;

  Future<void> _pickImage(int which) async {
    final file = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 90);
    if (file == null) return;
    setState(() {
      if (which == 1) {
        _parent1 = file;
      } else {
        _parent2 = file;
      }
    });
  }

  void _clearImage(int which) {
    setState(() {
      if (which == 1) {
        _parent1 = null;
      } else {
        _parent2 = null;
      }
    });
  }

  Future<void> _submit() async {
    if (!_bothReady) return;
    final p1 = _parent1!;
    final p2 = _parent2!;
    final bytes1 = await p1.readAsBytes();
    final bytes2 = await p2.readAsBytes();
    if (!mounted) return;
    await ref.read(childPredictionProvider.notifier).predict(
          parent1Bytes: bytes1,
          parent1Filename: p1.name,
          parent2Bytes: bytes2,
          parent2Filename: p2.name,
        );
  }

  void _reset() {
    setState(() {
      _parent1 = null;
      _parent2 = null;
    });
    ref.read(childPredictionProvider.notifier).reset();
  }

  Future<void> _copyLink(String mediaUrl) async {
    final full = resolveMediaUrl(mediaUrl) ?? mediaUrl;
    await Clipboard.setData(ClipboardData(text: full));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ رابط الصورة')));
  }

  String _fmt(int seconds) => '${seconds ~/ 60}:${(seconds % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(childPredictionProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('توقّع شكل طفلكما')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Center(
              child: Text(
                'امزج ملامحكما واكتشف وجه المستقبل 💕',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 12),
            const Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              children: [
                _TrustChip(icon: Icons.verified_user_outlined, text: 'خصوصية تامة — لا تُحفظ الصور'),
                _TrustChip(icon: Icons.timer_outlined, text: '⏱ ٢-٤ دقائق', accent: true),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(child: _uploadZone(1, 'صورتك', _parent1, state.isLoading)),
                _fusionOrb(state.isLoading),
                Expanded(child: _uploadZone(2, 'صورة شريكك', _parent2, state.isLoading)),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: (_bothReady && !state.isLoading) ? _submit : null,
                    icon: const Icon(Icons.auto_awesome),
                    label: state.isLoading
                        ? Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              ),
                              const SizedBox(width: 8),
                              Flexible(child: Text(_labels[state.stage] ?? '...', overflow: TextOverflow.ellipsis)),
                              const SizedBox(width: 8),
                              Text(_fmt(state.elapsedSeconds), style: const TextStyle(fontFamily: 'monospace')),
                            ],
                          )
                        : const Text('اكتشف شكل طفلكما'),
                  ),
                ),
                if (state.isLoading) ...[
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: () => ref.read(childPredictionProvider.notifier).cancel(),
                    style: OutlinedButton.styleFrom(foregroundColor: AppTheme.dangerColor),
                    child: const Text('إلغاء'),
                  ),
                ],
              ],
            ),
            if (state.isLoading) ...[
              const SizedBox(height: 20),
              _processingRitual(state.stage),
            ],
            if (state.stage == ChildPredictionStage.error) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.dangerColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '⚠️ ${state.error ?? _labels[ChildPredictionStage.error]}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.dangerColor),
                ),
              ),
            ],
            if (state.stage == ChildPredictionStage.done && state.result != null) ...[
              const SizedBox(height: 24),
              _resultReveal(state.result!),
            ],
            const SizedBox(height: 24),
            _privacyCard(),
          ],
        ),
      ),
    );
  }

  Widget _uploadZone(int which, String label, XFile? data, bool disabled) {
    return GestureDetector(
      onTap: disabled ? null : () => _pickImage(which),
      child: AspectRatio(
        aspectRatio: 1,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: data != null ? AppTheme.primaryColor : AppTheme.accentColor.withValues(alpha: 0.45),
              width: 2,
              style: data != null ? BorderStyle.solid : BorderStyle.solid,
            ),
            color: data != null ? AppTheme.surfaceColor : AppTheme.accentColor.withValues(alpha: 0.06),
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (data != null)
                FutureBuilder<Uint8List>(
                  future: data.readAsBytes(),
                  builder: (context, snapshot) {
                    if (!snapshot.hasData) return const SizedBox.shrink();
                    return Image.memory(snapshot.data!, fit: BoxFit.cover);
                  },
                )
              else
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.photo_camera_outlined, color: AppTheme.accentColor, size: 26),
                    const SizedBox(height: 6),
                    Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(height: 2),
                    const Text('اضغط للرفع', style: TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                  ],
                ),
              if (data != null)
                Positioned(
                  top: 4,
                  left: 4,
                  child: InkWell(
                    onTap: disabled ? null : () => _clearImage(which),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.close, size: 14, color: AppTheme.dangerColor),
                    ),
                  ),
                ),
              if (data != null)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    color: Colors.black.withValues(alpha: 0.45),
                    child: Text(
                      label,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _fusionOrb(bool isLoading) {
    return Container(
      width: 52,
      height: 52,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: _bothReady
              ? [AppTheme.secondaryColor, AppTheme.accentColor]
              : [AppTheme.primaryColor, AppTheme.secondaryColor],
        ),
        boxShadow: [
          BoxShadow(
            color: (_bothReady ? AppTheme.accentColor : AppTheme.primaryColor).withValues(alpha: 0.35),
            blurRadius: 16,
          ),
        ],
      ),
      child: Icon(Icons.favorite, color: Colors.white, size: _bothReady ? 24 : 20),
    );
  }

  Widget _processingRitual(ChildPredictionStage stage) {
    final order = [ChildPredictionStage.analyzing, ChildPredictionStage.generating, ChildPredictionStage.rendering];
    final activeIdx = order.indexOf(stage);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: order.asMap().entries.map((entry) {
              final i = entry.key;
              final s = entry.value;
              final isActive = s == stage;
              final isDone = i < activeIdx;
              return Expanded(
                child: Column(
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive
                            ? AppTheme.accentColor
                            : isDone
                                ? AppTheme.secondaryColor
                                : AppTheme.textSecondary.withValues(alpha: 0.3),
                      ),
                      child: isDone
                          ? const Icon(Icons.check, size: 13, color: Colors.white)
                          : (isActive ? const Icon(Icons.circle, size: 8, color: Colors.white) : null),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _steps[s] ?? '',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                        color: isActive
                            ? AppTheme.primaryColor
                            : isDone
                                ? AppTheme.secondaryColor
                                : AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          Text(
            '${_labels[stage] ?? ''}\nالمعالجة تتم بالكامل داخل الخادم ⏳',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _resultReveal(ChildPredictionResult result) {
    final bytes = base64Decode(result.imageBase64);
    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: 4),
          child: Column(
            children: [
              Text('النتيجة جاهزة', style: TextStyle(color: AppTheme.accentColor, fontWeight: FontWeight.bold, fontSize: 11)),
              SizedBox(height: 4),
              Text('طفلكما المنتظر 🌟', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              SizedBox(height: 2),
              Text('ما شاء الله تبارك الله — صورة توقعية للتسلية', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            gradient: const LinearGradient(colors: [AppTheme.accentColor, AppTheme.secondaryColor]),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Image.memory(bytes, fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            if (result.mediaUrl != null)
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _copyLink(result.mediaUrl!),
                  icon: const Icon(Icons.link),
                  label: const Text('نسخ الرابط'),
                ),
              ),
            if (result.mediaUrl != null) const SizedBox(width: 12),
            Expanded(
              child: FilledButton.icon(
                onPressed: _reset,
                icon: const Icon(Icons.refresh),
                label: const Text('جرّب مجدداً'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _privacyCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE7DFC9)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.verified_user_outlined, size: 16, color: AppTheme.accentColor),
              SizedBox(width: 6),
              Text('سياسة الخصوصية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          SizedBox(height: 8),
          Text('• المعالجة تتم كلياً في الذاكرة المؤقتة داخل الخادم', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          SizedBox(height: 4),
          Text('• لا تُحفظ صورك على أي قرص صلب', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          SizedBox(height: 4),
          Text('• هذه الميزة للتسلية والترفيه فقط — ليست توقعاً علمياً', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}

class _TrustChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool accent;
  const _TrustChip({required this.icon, required this.text, this.accent = false});

  @override
  Widget build(BuildContext context) {
    final color = accent ? AppTheme.accentColor : AppTheme.primaryColor;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}
