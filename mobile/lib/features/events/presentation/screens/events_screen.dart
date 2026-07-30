import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../domain/entities/event.dart';
import '../providers/events_providers.dart';
import '../state/events_list_state.dart';
import 'event_detail_screen.dart';
import '../../../../core/constants/theme.dart';
import '../../../../core/utils/media.dart';

// Mirrors web/src/app/(main)/events/page.tsx (hero + create form + list) and
// web/src/features/events/components/EventsList.tsx's card layout/RSVP
// buttons. "My events" (GET /events/my) is folded in as a second tab, same
// placement pattern GroupsScreen uses for my/discover. GET /events/upcoming
// is curl-confirmed to return byte-for-byte the same data as GET /events
// (both just call eventsService.findAll()), so it's deliberately not wired
// up as a separate call/tab -- it would just be a redundant fetch.
class EventsScreen extends ConsumerStatefulWidget {
  const EventsScreen({super.key});

  @override
  ConsumerState<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends ConsumerState<EventsScreen> {
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(eventsListProvider.notifier).loadInitial());
  }

  void _openEvent(String id) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => EventDetailScreen(eventId: id)));
  }

  Future<void> _showCreateDialog() async {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final locationController = TextEditingController();
    DateTime? startDate;
    DateTime? endDate;
    XFile? coverPhoto;

    final created = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          Future<void> pickDate({required bool isStart}) async {
            final now = DateTime.now();
            final date = await showDatePicker(
              context: context,
              initialDate: now.add(const Duration(days: 1)),
              firstDate: now,
              lastDate: now.add(const Duration(days: 365 * 3)),
            );
            if (date == null || !context.mounted) return;
            final time = await showTimePicker(context: context, initialTime: TimeOfDay.now());
            if (time == null) return;
            final combined = DateTime(date.year, date.month, date.day, time.hour, time.minute);
            setDialogState(() {
              if (isStart) {
                startDate = combined;
              } else {
                endDate = combined;
              }
            });
          }

          return AlertDialog(
            title: const Text('إنشاء حدث'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(controller: titleController, decoration: const InputDecoration(labelText: 'العنوان *')),
                  const SizedBox(height: 8),
                  TextField(controller: descController, decoration: const InputDecoration(labelText: 'الوصف'), maxLines: 2),
                  const SizedBox(height: 8),
                  TextField(controller: locationController, decoration: const InputDecoration(labelText: 'الموقع')),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () => pickDate(isStart: true),
                    icon: const Icon(Icons.calendar_today, size: 16),
                    label: Text(startDate == null ? 'تاريخ البداية *' : startDate.toString().substring(0, 16)),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () => pickDate(isStart: false),
                    icon: const Icon(Icons.calendar_today, size: 16),
                    label: Text(endDate == null ? 'تاريخ النهاية (اختياري)' : endDate.toString().substring(0, 16)),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
                      if (picked != null) setDialogState(() => coverPhoto = picked);
                    },
                    icon: const Icon(Icons.image_outlined, size: 16),
                    label: Text(coverPhoto == null ? 'صورة الغلاف (اختياري)' : 'تم اختيار صورة'),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('إلغاء')),
              FilledButton(
                onPressed: () async {
                  if (titleController.text.trim().isEmpty || startDate == null) return;
                  if (endDate != null && endDate!.isBefore(startDate!)) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('تاريخ النهاية يجب أن يكون بعد تاريخ البداية')),
                    );
                    return;
                  }
                  final ok = await ref.read(eventsListProvider.notifier).create(
                        title: titleController.text.trim(),
                        description: descController.text.trim(),
                        startDate: startDate!.toUtc().toIso8601String(),
                        endDate: endDate?.toUtc().toIso8601String(),
                        location: locationController.text.trim(),
                        coverPhoto: coverPhoto,
                      );
                  if (context.mounted) Navigator.pop(context, ok);
                },
                child: const Text('إنشاء'),
              ),
            ],
          );
        },
      ),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إنشاء الحدث')));
    } else if (created == false && mounted && ref.read(eventsListProvider).error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ref.read(eventsListProvider).error!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eventsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الأحداث'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _showCreateDialog),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('كل الأحداث')),
                ButtonSegment(value: 1, label: Text('أحداثي')),
              ],
              selected: {_tabIndex},
              onSelectionChanged: (s) => setState(() => _tabIndex = s.first),
            ),
          ),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(state.error!, style: const TextStyle(color: AppTheme.dangerColor)),
            ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () => ref.read(eventsListProvider.notifier).refresh(),
                    child: _tabIndex == 0 ? _buildAllEvents(state) : _buildMyEvents(state.myEvents),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyEvents(List<Event> events) {
    if (events.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          Icon(Icons.event_busy_outlined, size: 48, color: AppTheme.textSecondary),
          SizedBox(height: 12),
          Center(child: Text('لم ترد على أي حدث بعد', style: TextStyle(color: AppTheme.textSecondary))),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: events.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) => _EventCard(
        event: events[i],
        onTap: () => _openEvent(events[i].id),
        onRsvp: (status) => ref.read(eventsListProvider.notifier).rsvp(events[i].id, status),
        isRsvpPending: ref.watch(eventsListProvider).rsvpPendingIds.contains(events[i].id),
      ),
    );
  }

  Widget _buildAllEvents(EventsListState state) {
    if (state.events.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          Icon(Icons.event_outlined, size: 48, color: AppTheme.textSecondary),
          SizedBox(height: 12),
          Center(child: Text('لا توجد أحداث قادمة', style: TextStyle(color: AppTheme.textSecondary))),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: state.events.length + (state.hasMore ? 1 : 0),
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        if (i >= state.events.length) {
          if (!state.isLoadingMore) {
            Future.microtask(() => ref.read(eventsListProvider.notifier).loadMore());
          }
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        final event = state.events[i];
        return _EventCard(
          event: event,
          onTap: () => _openEvent(event.id),
          onRsvp: (status) => ref.read(eventsListProvider.notifier).rsvp(event.id, status),
          isRsvpPending: state.rsvpPendingIds.contains(event.id),
        );
      },
    );
  }
}

class _EventCard extends StatelessWidget {
  final Event event;
  final VoidCallback onTap;
  final void Function(String status) onRsvp;
  final bool isRsvpPending;

  const _EventCard({
    required this.event,
    required this.onTap,
    required this.onRsvp,
    required this.isRsvpPending,
  });

  static const _statuses = [
    ('going', 'سأحضر', Icons.check),
    ('interested', 'مهتم', Icons.star_border),
    ('not_going', 'لن أحضر', Icons.close),
  ];

  @override
  Widget build(BuildContext context) {
    final coverUrl = resolveMediaUrl(event.coverPhoto);
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                      image: coverUrl != null ? DecorationImage(image: NetworkImage(coverUrl), fit: BoxFit.cover) : null,
                    ),
                    child: coverUrl == null
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('${event.startDate.day}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryColor)),
                            ],
                          )
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(event.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 2),
                        Text(
                          '${event.startDate.toLocal()}'.substring(0, 16),
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                        if (event.location != null && event.location!.isNotEmpty)
                          Text(event.location!, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
              if (event.description != null && event.description!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(event.description!, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  Text('${event.goingCount} ذاهب', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                  const SizedBox(width: 10),
                  Text('${event.interestedCount} مهتم', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                children: _statuses.map((s) {
                  final (status, label, icon) = s;
                  final isActive = event.userRsvp == status;
                  return ChoiceChip(
                    label: Text(label, style: const TextStyle(fontSize: 11)),
                    avatar: Icon(icon, size: 14),
                    selected: isActive,
                    onSelected: isRsvpPending ? null : (_) => onRsvp(status),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
