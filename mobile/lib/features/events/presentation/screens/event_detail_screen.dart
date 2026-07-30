import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/event.dart';
import '../providers/events_providers.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

// Mirrors web/src/app/(main)/events/[id]/page.tsx: hero (cover photo or
// gradient placeholder + date badge), info card (date/location), description,
// attendee counts, RSVP buttons (going/interested/not_going, hidden for the
// owner same as web), and an owner-only cover-photo-change action. Full
// edit-details isn't exposed anywhere on web's detail page either (only the
// create form has all the fields) so it's out of scope here too.
class EventDetailScreen extends ConsumerStatefulWidget {
  final String eventId;
  const EventDetailScreen({super.key, required this.eventId});

  @override
  ConsumerState<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends ConsumerState<EventDetailScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(eventDetailProvider(widget.eventId).notifier).load());
  }

  Future<void> _changeCover() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    await ref.read(eventDetailProvider(widget.eventId).notifier).updateCoverPhoto(picked);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eventDetailProvider(widget.eventId));
    final notifier = ref.read(eventDetailProvider(widget.eventId).notifier);
    final event = state.event;

    return Scaffold(
      appBar: AppBar(title: Text(event?.title ?? 'الحدث')),
      body: state.isLoading && event == null
          ? const Center(child: CircularProgressIndicator())
          : event == null
              ? Center(child: Text(state.error ?? 'تعذّر تحميل الحدث'))
              : RefreshIndicator(
                  onRefresh: notifier.refresh,
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      _EventHero(event: event, isUpdatingCover: state.isUpdatingCover, onChangeCover: _changeCover),
                      if (state.error != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
                        ),
                      const SizedBox(height: 12),
                      _EventInfoCard(event: event),
                      if (event.description != null && event.description!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('التفاصيل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                const SizedBox(height: 8),
                                Text(event.description!),
                              ],
                            ),
                          ),
                        ),
                      ],
                      if (event.isOwner != true) ...[
                        const SizedBox(height: 12),
                        _RsvpCard(event: event, isRsvping: state.isRsvping, onRsvp: notifier.rsvp),
                      ],
                      const SizedBox(height: 16),
                      _AttendeesSection(
                        status: state.attendeesStatus,
                        attendees: state.attendees,
                        isLoading: state.isLoadingAttendees,
                        onStatusChanged: notifier.loadAttendees,
                      ),
                    ],
                  ),
                ),
    );
  }
}

class _EventHero extends StatelessWidget {
  final Event event;
  final bool isUpdatingCover;
  final VoidCallback onChangeCover;
  const _EventHero({required this.event, required this.isUpdatingCover, required this.onChangeCover});

  @override
  Widget build(BuildContext context) {
    final coverUrl = resolveMediaUrl(event.coverPhoto);
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Stack(
        children: [
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.1),
              image: coverUrl != null ? DecorationImage(image: NetworkImage(coverUrl), fit: BoxFit.cover) : null,
              gradient: coverUrl == null
                  ? LinearGradient(colors: [AppTheme.primaryColor, AppTheme.primaryColor.withValues(alpha: 0.6)])
                  : null,
            ),
            child: coverUrl == null
                ? Center(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(14)),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('${event.startDate.day}', style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900)),
                          Text('${event.startDate.month}/${event.startDate.year}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                        ],
                      ),
                    ),
                  )
                : null,
          ),
          Positioned(
            top: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.4), borderRadius: BorderRadius.circular(8)),
              child: Text(
                event.privacy == 'public' ? 'عام' : (event.privacy == 'friends' ? 'أصدقاء' : 'خاص'),
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          if (event.isOwner == true)
            Positioned(
              bottom: 8,
              left: 8,
              child: FilledButton.icon(
                onPressed: isUpdatingCover ? null : onChangeCover,
                icon: isUpdatingCover
                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.camera_alt_outlined, size: 16),
                label: Text(isUpdatingCover ? 'جاري الرفع...' : 'صورة الغلاف', style: const TextStyle(fontSize: 12)),
                style: FilledButton.styleFrom(backgroundColor: Colors.black.withValues(alpha: 0.5), padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
              ),
            ),
        ],
      ),
    );
  }
}

class _EventInfoCard extends StatelessWidget {
  final Event event;
  const _EventInfoCard({required this.event});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(event.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 15, color: AppTheme.primaryColor),
                const SizedBox(width: 8),
                Text('${event.startDate.toLocal()}'.substring(0, 16)),
              ],
            ),
            if (event.endDate != null) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.access_time, size: 15, color: AppTheme.textSecondary),
                  const SizedBox(width: 8),
                  Text('ينتهي: ${event.endDate.toString().substring(0, 16)}', style: const TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            ],
            if (event.location != null && event.location!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.place_outlined, size: 15, color: AppTheme.textSecondary),
                  const SizedBox(width: 8),
                  Expanded(child: Text(event.location!)),
                ],
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Text('${event.goingCount} ذاهب', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                const SizedBox(width: 12),
                Text('${event.interestedCount} مهتم', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RsvpCard extends StatelessWidget {
  final Event event;
  final bool isRsvping;
  final void Function(String status) onRsvp;
  const _RsvpCard({required this.event, required this.isRsvping, required this.onRsvp});

  static const _statuses = [
    ('going', 'سأحضر', Icons.check),
    ('interested', 'مهتم', Icons.star_border),
    ('not_going', 'لن أحضر', Icons.close),
  ];

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('هل ستحضر؟', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              children: _statuses.map((s) {
                final (status, label, icon) = s;
                final isActive = event.userRsvp == status;
                return ChoiceChip(
                  label: Text(label),
                  avatar: Icon(icon, size: 16),
                  selected: isActive,
                  onSelected: isRsvping ? null : (_) => onRsvp(status),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _AttendeesSection extends StatelessWidget {
  final String status;
  final List<dynamic> attendees;
  final bool isLoading;
  final void Function(String status) onStatusChanged;
  const _AttendeesSection({required this.status, required this.attendees, required this.isLoading, required this.onStatusChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('الحضور', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 8),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'going', label: Text('ذاهب')),
            ButtonSegment(value: 'interested', label: Text('مهتم')),
            ButtonSegment(value: 'not_going', label: Text('غير ذاهب')),
          ],
          selected: {status},
          onSelectionChanged: (s) => onStatusChanged(s.first),
        ),
        const SizedBox(height: 8),
        if (isLoading)
          const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 16), child: CircularProgressIndicator()))
        else if (attendees.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(child: Text('لا يوجد أحد بهذه الحالة', style: TextStyle(color: AppTheme.textSecondary))),
          )
        else
          ...attendees.map((a) => ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                  child: Text(a.fullName.isNotEmpty ? a.fullName[0] : '؟'),
                ),
                title: Text(a.fullName),
                subtitle: Text('@${a.username}'),
              )),
      ],
    );
  }
}
