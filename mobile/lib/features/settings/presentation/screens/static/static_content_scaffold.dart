import 'package:flutter/material.dart';
import '../../../../../core/constants/theme.dart';

/// Shared layout for the 4 static content screens (FAQ, guide, privacy,
/// terms) -- mirrors the shared structure of web's faq/guide/privacy/terms
/// page.tsx: a page title, a muted subtitle, then a card of stacked
/// sections separated by dividers. Content itself is hardcoded verbatim
/// from the web source in each screen file (Phase 29 static-content
/// parity; no WebView, no CMS -- these are short static Arabic pages, no
/// dynamic data, no interactivity beyond a back button and (on the terms
/// screen) one in-app link to the privacy screen).
class StaticContentScaffold extends StatelessWidget {
  const StaticContentScaffold({
    super.key,
    required this.appBarTitle,
    required this.title,
    required this.subtitle,
    required this.sections,
  });

  final String appBarTitle;
  final String title;
  final String subtitle;
  final List<Widget> sections;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(appBarTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (var i = 0; i < sections.length; i++) ...[
                    if (i > 0) const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1)),
                    sections[i],
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A single (heading, body) block -- one FAQ item, one guide step, or one
/// privacy/terms clause.
class StaticSection extends StatelessWidget {
  const StaticSection(this.heading, this.body, {super.key});

  final String heading;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(heading, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        Text(body, style: const TextStyle(fontSize: 14, height: 1.5)),
      ],
    );
  }
}
