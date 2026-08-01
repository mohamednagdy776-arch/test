import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:video_player/video_player.dart';
import '../../domain/entities/video.dart';
import '../../domain/entities/video_comment.dart';
import '../providers/videos_providers.dart';
import '../state/video_detail_state.dart';
import '../widgets/report_video_dialog.dart';
import '../widgets/video_card.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';
import '../../../../core/utils/extensions.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';
import '../../../../features/posts/presentation/widgets/reaction_picker.dart';

// Single-video player + comments, matching web/src/app/(main)/watch/[id]/
// page.tsx: reused for both a Watch video and a Reel (a reel id IS a video
// row -- same GET videos/:id endpoint), pushed directly with an already-
// known id (no GoRoute), same precedent as Phase 12's post_detail_screen.
//
// Phase 25 closes the remaining parity gaps here: Share (share_plus, same
// permalink pattern as reels), Save (reuses the Saved feature's own use
// cases, curl-confirmed entityType: 'video'), Report (new generic POST
// /reports plumbing shared with reels via report_video_dialog.dart), and a
// Recommended section (reuses GetRecommendedVideosUseCase, already powering
// the Watch screen's tab, filtered to exclude this video). Tags display was
// audited too but is a dead end: web's own `video.tags` UI branch
// (watch/[id]/page.tsx) never has anything to render -- curl-confirmed the
// live GET /videos/:id response has no `tags` field at all, and grepping
// backend/src/videos turns up no tags column/DTO field anywhere, so there's
// no data source to wire up on mobile either.
class VideoDetailScreen extends ConsumerStatefulWidget {
  final String videoId;
  const VideoDetailScreen({super.key, required this.videoId});

  @override
  ConsumerState<VideoDetailScreen> createState() => _VideoDetailScreenState();
}

class _VideoDetailScreenState extends ConsumerState<VideoDetailScreen> {
  VideoPlayerController? _controller;
  final _commentCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await ref.read(videoDetailProvider(widget.videoId).notifier).load();
      _initController();
    });
  }

  void _initController() {
    final url = resolveMediaUrl(ref.read(videoDetailProvider(widget.videoId)).video?.videoUrl);
    if (url == null) return;
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    _controller = controller;
    controller.initialize().then((_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    _commentCtrl.dispose();
    super.dispose();
  }

  // Share (Phase 25) -- web's own handleShare (watch/[id]/page.tsx) uses
  // navigator.share({ title, url }) with url = window.location.href (i.e.
  // `/watch/${video.id}`, the page it's already on) and a clipboard
  // fallback; share_plus is the native-app equivalent of that browser API.
  Future<void> _share(Video video) async {
    final origin = AppConstants.apiBaseUrl.replaceFirst(RegExp(r'/api/v1/?$'), '');
    final url = '$origin/watch/${video.id}';
    await Share.share('${video.title}\n\n$url');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(videoDetailProvider(widget.videoId));
    final myUserId = ref.watch(myProfileProvider).valueOrNull?.userId;

    return Scaffold(
      appBar: AppBar(title: Text(state.video?.title ?? 'فيديو')),
      body: state.isLoading && state.video == null
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.video == null
              ? Center(child: Text(state.error!))
              : _buildContent(state, myUserId),
    );
  }

  Widget _buildContent(VideoDetailState state, String? myUserId) {
    final video = state.video!;
    return Column(
      children: [
        AspectRatio(
          aspectRatio: 16 / 9,
          child: _controller != null && _controller!.value.isInitialized
              ? Stack(
                  alignment: Alignment.center,
                  children: [
                    VideoPlayer(_controller!),
                    IconButton(
                      icon: Icon(
                        _controller!.value.isPlaying ? Icons.pause_circle : Icons.play_circle,
                        color: Colors.white,
                        size: 56,
                      ),
                      onPressed: () {
                        setState(() {
                          _controller!.value.isPlaying ? _controller!.pause() : _controller!.play();
                        });
                      },
                    ),
                  ],
                )
              : Container(color: Colors.black87, child: const Center(child: CircularProgressIndicator(color: Colors.white))),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text(video.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('${video.viewCount} مشاهدة · ${video.createdAt.timeAgo}',
                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 8),
              ReactionButton(
                myReaction: state.reactions.userReaction,
                counts: state.reactions.counts,
                total: state.reactions.total,
                onSelect: (type) => ref.read(videoDetailProvider(widget.videoId).notifier).react(type),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _share(video),
                      icon: const Icon(Icons.share_outlined, size: 18),
                      label: const Text('مشاركة'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: state.isSaved || state.isSavePending
                          ? null
                          : () => ref.read(videoDetailProvider(widget.videoId).notifier).toggleSave(),
                      icon: state.isSavePending
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                          : Icon(state.isSaved ? Icons.bookmark : Icons.bookmark_border, size: 18),
                      label: Text(state.isSaved ? 'محفوظ' : 'حفظ'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => showReportVideoDialog(context, video.id),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.dangerColor,
                        side: const BorderSide(color: AppTheme.dangerColor),
                      ),
                      icon: const Icon(Icons.flag_outlined, size: 18),
                      label: const Text('إبلاغ'),
                    ),
                  ),
                ],
              ),
              if ((video.description ?? '').isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(video.description!),
              ],
              if (state.recommended.isNotEmpty) ...[
                const Divider(height: 32),
                const Text('فيديوهات مقترحة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 170,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: state.recommended.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, i) {
                      final rec = state.recommended[i];
                      return SizedBox(
                        width: 220,
                        child: VideoCard(
                          video: rec,
                          onTap: () => Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (_) => VideoDetailScreen(videoId: rec.id)),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
              const Divider(height: 32),
              Text('التعليقات (${state.comments.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              for (final comment in state.comments)
                _CommentTile(
                  comment: comment,
                  isOwn: comment.authorId != null && comment.authorId == myUserId,
                  onEdit: (content) => ref
                      .read(videoDetailProvider(widget.videoId).notifier)
                      .editComment(comment.id, content),
                  onDelete: () => ref
                      .read(videoDetailProvider(widget.videoId).notifier)
                      .deleteComment(comment.id),
                ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentCtrl,
                    decoration: const InputDecoration(hintText: 'أضف تعليقاً...'),
                  ),
                ),
                IconButton(
                  icon: state.isSubmittingComment
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.send),
                  onPressed: state.isSubmittingComment
                      ? null
                      : () {
                          final text = _commentCtrl.text;
                          _commentCtrl.clear();
                          ref.read(videoDetailProvider(widget.videoId).notifier).addComment(text);
                        },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _CommentTile extends StatelessWidget {
  final VideoComment comment;
  final bool isOwn;
  final ValueChanged<String> onEdit;
  final VoidCallback onDelete;

  const _CommentTile({
    required this.comment,
    required this.isOwn,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final avatarUrl = resolveMediaUrl(comment.authorAvatarUrl);
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        radius: 16,
        backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
        child: avatarUrl == null ? Text(comment.authorName.isNotEmpty ? comment.authorName[0] : '?') : null,
      ),
      title: Text(comment.authorName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
      subtitle: Text(comment.content),
      trailing: isOwn
          ? PopupMenuButton<String>(
              onSelected: (v) {
                if (v == 'delete') onDelete();
                if (v == 'edit') _showEditDialog(context);
              },
              itemBuilder: (context) => const [
                PopupMenuItem(value: 'edit', child: Text('تعديل')),
                PopupMenuItem(value: 'delete', child: Text('حذف')),
              ],
            )
          : null,
    );
  }

  void _showEditDialog(BuildContext context) {
    final ctrl = TextEditingController(text: comment.content);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تعديل التعليق'),
        content: TextField(controller: ctrl, maxLines: 3),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              onEdit(ctrl.text);
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }
}
