import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/video.dart';
import '../providers/videos_providers.dart';
import '../state/watch_state.dart';
import '../widgets/video_card.dart';
import 'video_detail_screen.dart';
import 'video_upload_screen.dart';

// Long-form video feed, matching web/src/app/(main)/watch/page.tsx: a
// "continue watching" row, then a tabbed grid (Recommended / Trending /
// Following). All four lists are loaded once up front by WatchNotifier (see
// its doc comment) so switching tabs here is instant with no extra network
// round trip.
class WatchScreen extends ConsumerStatefulWidget {
  const WatchScreen({super.key});

  @override
  ConsumerState<WatchScreen> createState() => _WatchScreenState();
}

class _WatchScreenState extends ConsumerState<WatchScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(watchProvider.notifier).loadInitial());
  }

  void _openVideo(Video video) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => VideoDetailScreen(videoId: video.id)),
    );
  }

  Future<void> _openUpload() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const VideoUploadScreen(isReel: false)),
    );
    if (created == true) ref.read(watchProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(watchProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الفيديوهات'),
        actions: [
          IconButton(icon: const Icon(Icons.upload_outlined), onPressed: _openUpload),
        ],
      ),
      body: state.isLoading && state.activeItems.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : state.error != null && state.activeItems.isEmpty
              ? Center(child: Text(state.error!))
              : RefreshIndicator(
                  onRefresh: () => ref.read(watchProvider.notifier).refresh(),
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      if (state.continueWatching.isNotEmpty) ...[
                        const Padding(
                          padding: EdgeInsets.only(bottom: 8),
                          child: Text('تابع المشاهدة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        ),
                        SizedBox(
                          height: 170,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: state.continueWatching.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 10),
                            itemBuilder: (context, i) => SizedBox(
                              width: 220,
                              child: VideoCard(video: state.continueWatching[i], onTap: () => _openVideo(state.continueWatching[i])),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      SegmentedButton<WatchTab>(
                        segments: const [
                          ButtonSegment(value: WatchTab.recommended, label: Text('مقترحة')),
                          ButtonSegment(value: WatchTab.trending, label: Text('الرائجة')),
                          ButtonSegment(value: WatchTab.following, label: Text('تتابع')),
                        ],
                        selected: {state.activeTab},
                        onSelectionChanged: (s) => ref.read(watchProvider.notifier).switchTab(s.first),
                      ),
                      const SizedBox(height: 12),
                      if (state.activeItems.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 32),
                          child: Center(child: Text('لا توجد فيديوهات')),
                        )
                      else
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 12,
                            crossAxisSpacing: 12,
                            childAspectRatio: 0.78,
                          ),
                          itemCount: state.activeItems.length,
                          itemBuilder: (context, i) => VideoCard(
                            video: state.activeItems[i],
                            onTap: () => _openVideo(state.activeItems[i]),
                          ),
                        ),
                    ],
                  ),
                ),
    );
  }
}
