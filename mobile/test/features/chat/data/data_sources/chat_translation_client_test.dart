import 'package:flutter_test/flutter_test.dart';
import 'package:tayyibt/features/chat/data/data_sources/chat_translation_client.dart';

void main() {
  group('parseGtxResponse (Phase 22 translate toggle)', () {
    test('extracts and joins every segment\'s translated text from a decoded gtx response', () {
      // Shape curl-verified live against translate.googleapis.com/translate_a/single.
      final decoded = [
        [
          ['مرحبا صديق', 'hello friend', null, null, 3],
        ],
        null,
        'en',
      ];

      expect(parseGtxResponse(decoded), 'مرحبا صديق');
    });

    test('joins multiple segments (long text gets split into several)', () {
      final decoded = [
        [
          ['جزء أول ', 'part one ', null, null, 0],
          ['وجزء ثانٍ', 'and part two', null, null, 0],
        ],
      ];

      expect(parseGtxResponse(decoded), 'جزء أول وجزء ثانٍ');
    });

    test('parses a raw JSON string body (gtx serves text/html, so Dio may hand back a String)', () {
      const raw = '[[["مرحبا","hello",null,null,3]],null,"en"]';
      expect(parseGtxResponse(raw), 'مرحبا');
    });

    test('returns null for malformed/unexpected shapes instead of throwing', () {
      expect(parseGtxResponse(null), isNull);
      expect(parseGtxResponse(<dynamic>[]), isNull);
      expect(parseGtxResponse({'unexpected': 'shape'}), isNull);
      expect(parseGtxResponse('not valid json'), isNull);
      expect(parseGtxResponse([null]), isNull);
    });
  });
}
