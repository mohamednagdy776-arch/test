import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import '../../domain/entities/video.dart';
import '../../domain/entities/video_comment.dart';
import '../providers/videos_providers.dart';
import 'video_upload_screen.dart';
import '../../../../core/utils/media.dart';

// TikTok-style vertical swipeable feed, matching web/src/app/(main)/reels/
// page.tsx: GET /reels, one video per full-screen page, autoplay the active
// page and pause the rest, like/comment/share/mute overlay buttons. Unlike
// the web version (which only fakes the like with local state -- it never
// calls the like API at all), this wires the real POST/DELETE
// videos/:id/like endpoints since they're already built out for Watch.
class ReelsScreen extends ConsumerStatefulWidget {
  const ReelsScreen({super.key});

  @override
  ConsumerState<ReelsScreen> createState() => _ReelsScreenState();
}

class _ReelsScreenState extends ConsumerState<ReelsScreen> {
  final _pageController = PageController();
  int _activeIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(reelsProvider.notifier).loadInitial());
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() => _activeIndex = index);
    final state = ref.read(reelsProvider);
    if (index >= state.items.length - 2) {
      ref.read(reelsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(reelsProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          if (state.isLoading && state.items.isEmpty)
            const Center(child: CircularProgressIndicator(color: Colors.white))
          else if (state.items.isEmpty)
            _EmptyReels(onCreate: _openUpload)
          else
            PageView.builder(
              controller: _pageController,
              scrollDirection: Axis.vertical,
              itemCount: state.items.length,
              onPageChanged: _onPageChanged,
              itemBuilder: (context, index) {
                return _ReelCard(
                  video: state.items[index],
                  isActive: index == _activeIndex,
                );
              },
            ),
          Positioned(
            top: 12,
            left: 12,
            child: SafeArea(
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Navigator.of(context).maybePop(),
              ),
            ),
          ),
          Positioned(
            top: 12,
            right: 12,
            child: SafeArea(
              child: IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 28),
                onPressed: _openUpload,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openUpload() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const VideoUploadScreen(isReel: true)),
    );
    if (created == true) ref.read(reelsProvider.notifier).refresh();
  }
}

class _EmptyReels extends StatelessWidget {
  final VoidCallback onCreate;
  const _EmptyReels({required this.onCreate});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🎬', style: TextStyle(fontSize: 56)),
          const SizedBox(height: 12),
          const Text('لا توجد ريلز حالياً', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          const Text('كن أول من ينشر مقطعاً قصيراً!', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: onCreate,
            icon: const Icon(Icons.add),
            label: const Text('نشئ ريلز'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
          ),
        ],
      ),
    );
  }
}

class _ReelCard extends ConsumerStatefulWidget {
  final Video video;
  final bool isActive;
  const _ReelCard({required this.video, required this.isActive});

  @override
  ConsumerState<_ReelCard> createState() => _ReelCardState();
}

class _ReelCardState extends ConsumerState<_ReelCard> {
  VideoPlayerController? _controller;
  bool _muted = true;

  @override
  void initState() {
    super.initState();
    _initController();
  }

  @override
  void didUpdateWidget(covariant _ReelCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _controller?.play();
      } else {
        _controller?.pause();
      }
    }
  }

  void _initController() {
    final url = resolveMediaUrl(widget.video.videoUrl);
    if (url == null) return;
    final controller = VideoPlayerController.networkUrl(Uri.parse(url));
    _controller = controller;
    controller.initialize().then((_) {
      if (!mounted) return;
      controller.setLooping(true);
      controller.setVolume(_muted ? 0 : 1);
      if (widget.isActive) controller.play();
      setState(() {});
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final video = widget.video;
    final thumbnailUrl = resolveMediaUrl(video.thumbnailUrl);

    return Stack(
      fit: StackFit.expand,
      children: [
        _controller != null && _controller!.value.isInitialized
            ? FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _controller!.value.size.width,
                  height: _controller!.value.size.height,
                  child: VideoPlayer(_controller!),
                ),
              )
            : thumbnailUrl != null
                ? Image.network(thumbnailUrl, fit: BoxFit.cover)
                : Container(color: Colors.black87, child: const Center(child: Text('🎬', style: TextStyle(fontSize: 56)))),

        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: [Colors.black54, Colors.transparent],
              stops: [0, 0.4],
            ),
          ),
        ),

        // Caption
        Positioned(
          left: 16,
          right: 90,
          bottom: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('@${video.authorUsername ?? video.authorName}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              if ((video.description ?? '').isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(video.description!,
                    maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white)),
              ],
            ],
          ),
        ),

        // Side actions
        Positioned(
          right: 12,
          bottom: 24,
          child: Column(
            children: [
              _ActionButton(
                icon: video.isLiked ? Icons.favorite : Icons.favorite_border,
                color: video.isLiked ? Colors.red : Colors.white,
                label: '${video.likeCount}',
                onTap: () => ref.read(reelsProvider.notifier).toggleLike(video.id),
              ),
              const SizedBox(height: 18),
              _ActionButton(
                icon: Icons.chat_bubble_outline,
                label: 'تعليق',
                onTap: () => _showComments(context, video.id),
              ),
              const SizedBox(height: 18),
              _ActionButton(
                icon: _muted ? Icons.volume_off : Icons.volume_up,
                label: '',
                onTap: () {
                  setState(() => _muted = !_muted);
                  _controller?.setVolume(_muted ? 0 : 1);
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showComments(BuildContext context, String videoId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _ReelCommentsSheet(videoId: videoId),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionButton({required this.icon, required this.label, this.color = Colors.white, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(color: Colors.black38, shape: BoxShape.circle),
            child: Icon(icon, color: color),
          ),
          if (label.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ],
      ),
    );
  }
}

class _ReelCommentsSheet extends ConsumerStatefulWidget {
  final String videoId;
  const _ReelCommentsSheet({required this.videoId});

  @override
  ConsumerState<_ReelCommentsSheet> createState() => _ReelCommentsSheetState();
}

class _ReelCommentsSheetState extends ConsumerState<_ReelCommentsSheet> {
  final _controller = TextEditingController();
  bool _loading = true;
  bool _submitting = false;
  List<VideoComment> _comments = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final comments = await ref.read(getVideoCommentsUseCaseProvider)(widget.videoId);
      if (mounted) {
        setState(() {
          _comments = comments;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _submitting) return;
    setState(() => _submitting = true);
    _controller.clear();
    try {
      await ref.read(addVideoCommentUseCaseProvider)(widget.videoId, text);
      await _load();
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(12),
                child: Text('التعليقات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
              Expanded(
                child: _loading
                    ? const Center(child: CircularProgressIndicator())
                    : _comments.isEmpty
                        ? const Center(child: Text('لا توجد تعليقات بعد'))
                        : ListView.builder(
                            controller: scrollController,
                            itemCount: _comments.length,
                            itemBuilder: (context, i) {
                              final c = _comments[i];
                              return ListTile(
                                leading: const CircleAvatar(child: Icon(Icons.person, size: 18)),
                                title: Text(c.authorName),
                                subtitle: Text(c.content),
                              );
                            },
                          ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: const InputDecoration(hintText: 'أضف تعليقاً...'),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: _submitting ? null : _submit,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
