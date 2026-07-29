import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import '../../domain/entities/story.dart';
import '../providers/posts_providers.dart';
import '../../../../core/utils/media.dart';
import '../../../../features/profile/presentation/providers/profile_providers.dart';

// Full-screen story viewer: tap zones advance/rewind, a progress bar per
// story in the current author's group, and an auto-advance timer driven by
// each story's own `duration` (matches web/src/features/posts/components/
// StoryViewer.tsx). Reactions + owner-only menu (viewers/archive/delete) are
// included; the reply-as-chat-message flow from the web viewer is a
// deliberate simplification left out of v1 -- it isn't essential to viewing/
// reacting to a story and would otherwise require pulling in the whole chat
// feature's create-conversation flow here.
class StoryViewerScreen extends ConsumerStatefulWidget {
  final List<StoryGroup> groups;
  final int initialGroupIndex;

  const StoryViewerScreen({
    super.key,
    required this.groups,
    required this.initialGroupIndex,
  });

  @override
  ConsumerState<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends ConsumerState<StoryViewerScreen> {
  late int _groupIndex;
  int _storyIndex = 0;
  double _progress = 0;
  Timer? _timer;
  bool _paused = false;
  VideoPlayerController? _videoController;
  bool _muted = true;
  String? _myReaction;

  static const _quickReactions = ['❤️', '😍', '😂', '😮', '😢', '👏', '🔥'];

  StoryGroup get _currentGroup => widget.groups[_groupIndex];
  Story get _currentStory => _currentGroup.stories[_storyIndex];

  @override
  void initState() {
    super.initState();
    _groupIndex = widget.initialGroupIndex;
    _startStory();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _videoController?.dispose();
    super.dispose();
  }

  void _startStory() {
    _progress = 0;
    _myReaction = null;
    ref.read(viewStoryUseCaseProvider)(_currentStory.id);
    _disposeVideo();

    if (_currentStory.mediaType == 'video' && _currentStory.mediaUrl != null) {
      final url = resolveMediaUrl(_currentStory.mediaUrl);
      if (url != null) {
        final controller = VideoPlayerController.networkUrl(Uri.parse(url));
        _videoController = controller;
        controller.initialize().then((_) {
          if (!mounted) return;
          controller.setLooping(true);
          controller.setVolume(_muted ? 0 : 1);
          controller.play();
          setState(() {});
        });
      }
    }

    _runTimer();
  }

  void _disposeVideo() {
    _videoController?.dispose();
    _videoController = null;
  }

  void _runTimer() {
    _timer?.cancel();
    final durationSeconds = _currentStory.duration > 0 ? _currentStory.duration : 5;
    final increment = 100 / (durationSeconds * 10); // tick every 100ms
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (_paused) return;
      setState(() {
        _progress += increment;
        if (_progress >= 100) {
          _progress = 100;
          _goNext();
        }
      });
    });
  }

  void _goNext() {
    if (_storyIndex < _currentGroup.stories.length - 1) {
      setState(() => _storyIndex++);
      _startStory();
    } else if (_groupIndex < widget.groups.length - 1) {
      setState(() {
        _groupIndex++;
        _storyIndex = 0;
      });
      _startStory();
    } else {
      Navigator.of(context).pop();
    }
  }

  void _goPrev() {
    if (_storyIndex > 0) {
      setState(() => _storyIndex--);
      _startStory();
    } else if (_groupIndex > 0) {
      setState(() {
        _groupIndex--;
        _storyIndex = widget.groups[_groupIndex].stories.length - 1;
      });
      _startStory();
    }
  }

  void _handleReact(String emoji) {
    if (_isOwnStory) return;
    setState(() => _myReaction = emoji);
    ref.read(reactToStoryUseCaseProvider)(_currentStory.id, emoji);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم إرسال $emoji'), duration: const Duration(seconds: 1)),
    );
  }

  bool get _isOwnStory {
    final myUserId = ref.read(myProfileProvider).valueOrNull?.userId;
    return myUserId != null && myUserId == _currentGroup.userId;
  }

  Future<void> _showMenu() async {
    setState(() => _paused = true);
    await showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(children: [
          if (_isOwnStory)
            ListTile(
              leading: const Icon(Icons.visibility_outlined),
              title: const Text('المشاهدون'),
              onTap: () {
                Navigator.of(context).pop();
                _showViewers();
              },
            ),
          if (_isOwnStory)
            ListTile(
              leading: const Icon(Icons.archive_outlined),
              title: Text(_currentStory.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'),
              onTap: () async {
                Navigator.of(context).pop();
                await ref.read(archiveStoryUseCaseProvider)(_currentStory.id);
                if (mounted) setState(() => _paused = false);
              },
            ),
          if (_isOwnStory)
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('حذف', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.of(context).pop();
                _confirmDelete();
              },
            ),
          ListTile(
            leading: const Icon(Icons.close),
            title: const Text('إغلاق'),
            onTap: () => Navigator.of(context).pop(),
          ),
        ]),
      ),
    ).whenComplete(() {
      if (mounted) setState(() => _paused = false);
    });
  }

  Future<void> _showViewers() async {
    setState(() => _paused = true);
    final viewers = await ref.read(getStoryViewersUseCaseProvider)(_currentStory.id);
    if (!mounted) return;
    await showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: SizedBox(
          height: 300,
          child: viewers.isEmpty
              ? const Center(child: Text('لا يوجد مشاهدون بعد'))
              : ListView.builder(
                  itemCount: viewers.length,
                  itemBuilder: (context, i) => ListTile(
                    leading: CircleAvatar(child: Text(viewers[i].name.isNotEmpty ? viewers[i].name[0] : '?')),
                    title: Text(viewers[i].name),
                  ),
                ),
        ),
      ),
    );
    if (mounted) setState(() => _paused = false);
  }

  Future<void> _confirmDelete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف القصة'),
        content: const Text('هل أنت متأكد من حذف هذه القصة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('حذف')),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(deleteStoryUseCaseProvider)(_currentStory.id);
      if (mounted) Navigator.of(context).pop();
    } else if (mounted) {
      setState(() => _paused = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final story = _currentStory;
    final mediaUrl = resolveMediaUrl(story.mediaUrl);
    final isOwn = _isOwnStory;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Media / background
            Positioned.fill(
              child: story.bgColor != null
                  ? Container(
                      color: Color(int.parse(story.bgColor!.replaceFirst('#', '0xFF'))),
                      alignment: Alignment.center,
                      padding: const EdgeInsets.all(32),
                      child: Text(
                        story.text ?? '',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                    )
                  : story.mediaType == 'video' && _videoController != null && _videoController!.value.isInitialized
                      ? FittedBox(
                          fit: BoxFit.cover,
                          child: SizedBox(
                            width: _videoController!.value.size.width,
                            height: _videoController!.value.size.height,
                            child: VideoPlayer(_videoController!),
                          ),
                        )
                      : mediaUrl != null
                          ? Image.network(mediaUrl, fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const ColoredBox(color: Colors.black87))
                          : Container(
                              color: Colors.black87,
                              alignment: Alignment.center,
                              child: Text(story.text ?? '',
                                  style: const TextStyle(color: Colors.white, fontSize: 20)),
                            ),
            ),

            // Tap zones
            Positioned.fill(
              child: Row(
                children: [
                  Expanded(child: GestureDetector(onTap: _goPrev, behavior: HitTestBehavior.translucent)),
                  Expanded(child: GestureDetector(onTap: _goNext, behavior: HitTestBehavior.translucent)),
                ],
              ),
            ),

            // Progress bars
            Positioned(
              top: 8,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  for (var i = 0; i < _currentGroup.stories.length; i++)
                    Expanded(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        height: 3,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: i < _storyIndex
                              ? 1
                              : i == _storyIndex
                                  ? (_progress / 100).clamp(0, 1)
                                  : 0,
                          child: Container(
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(2))),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Header
            Positioned(
              top: 20,
              left: 8,
              right: 8,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundImage: resolveMediaUrl(_currentGroup.authorAvatarUrl) != null
                        ? NetworkImage(resolveMediaUrl(_currentGroup.authorAvatarUrl)!)
                        : null,
                    child: resolveMediaUrl(_currentGroup.authorAvatarUrl) == null
                        ? Text(_currentGroup.authorName.isNotEmpty ? _currentGroup.authorName[0] : '?')
                        : null,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(_currentGroup.authorName,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis),
                  ),
                  if (story.mediaType == 'video')
                    IconButton(
                      icon: Icon(_muted ? Icons.volume_off : Icons.volume_up, color: Colors.white),
                      onPressed: () {
                        setState(() => _muted = !_muted);
                        _videoController?.setVolume(_muted ? 0 : 1);
                      },
                    ),
                  IconButton(
                    icon: const Icon(Icons.more_vert, color: Colors.white),
                    onPressed: _showMenu,
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Reactions bar (hidden on own story)
            if (!isOwn)
              Positioned(
                bottom: 16,
                left: 8,
                right: 8,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    for (final emoji in _quickReactions)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: GestureDetector(
                          onTap: () => _handleReact(emoji),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _myReaction == emoji ? Colors.white.withValues(alpha: 0.25) : Colors.transparent,
                            ),
                            child: Text(emoji, style: const TextStyle(fontSize: 22)),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
