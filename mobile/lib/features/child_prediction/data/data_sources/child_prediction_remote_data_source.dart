import 'package:dio/dio.dart';
import '../../domain/entities/child_prediction_result.dart';

// The pipeline itself runs 3-4 minutes server-side (confirmed live: ~3m46s
// for a single call). DioClient's shared instance defaults to a 10s
// connect/receive timeout for every other endpoint in the app, so this call
// overrides both per-request via Options rather than raising the global
// default for every request the app ever makes.
const _kPredictionTimeout = Duration(minutes: 5);

class ChildPredictionRemoteDataSource {
  final Dio _dio;
  const ChildPredictionRemoteDataSource(this._dio);

  // Response is NOT the app's usual {success,message,data} envelope --
  // confirmed live: {success, image (base64 jpeg, no data-uri prefix),
  // format, mediaUrl}. Parsed directly, no ApiResponse.unwrap().
  Future<ChildPredictionResult> predict({
    required List<int> parent1Bytes,
    required String parent1Filename,
    required List<int> parent2Bytes,
    required String parent2Filename,
  }) async {
    final formData = FormData.fromMap({
      'images': [
        MultipartFile.fromBytes(parent1Bytes, filename: parent1Filename),
        MultipartFile.fromBytes(parent2Bytes, filename: parent2Filename),
      ],
    });
    final response = await _dio.post(
      '/features/child-prediction',
      data: formData,
      options: Options(
        sendTimeout: _kPredictionTimeout,
        receiveTimeout: _kPredictionTimeout,
      ),
    );
    return ChildPredictionResult.fromJson(response.data as Map<String, dynamic>);
  }
}
