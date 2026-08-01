import 'package:flutter/material.dart';

// Full-screen zoomable image viewer (Phase 22, item 4 -- "no way to zoom a
// sent image at all", mirrors web/ChatWindow.tsx's lightbox). Built on
// Flutter's own InteractiveViewer rather than a new dependency -- pinch/drag
// to zoom is exactly what it's for, no picker/viewer package needed for
// something this simple.
class ImageLightboxScreen extends StatelessWidget {
  final String imageUrl;
  const ImageLightboxScreen({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: InteractiveViewer(
              minScale: 1,
              maxScale: 5,
              child: Center(
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => const Icon(
                    Icons.broken_image,
                    color: Colors.white38,
                    size: 48,
                  ),
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Align(
                alignment: AlignmentDirectional.topStart,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  tooltip: 'إغلاق',
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
