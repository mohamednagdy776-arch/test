# NVIDIA NIM API Integration

## Overview
The Kilo AI service (Tayyibt Matching Platform) has been updated to use NVIDIA NIM (NVIDIA Inference Microservices) API for enhanced compatibility matching. The system now leverages the `moonshotai/kimi-k2.6` model for intelligent matchmaking analysis while maintaining backward compatibility with rule-based scoring.

## Key Changes

### 1. Updated `app/services/scoring.py`
- Added NVIDIA API integration with `call_nvidia_api()` function
- Supports streaming and non-streaming responses
- Includes `read_b64()` for base64 image encoding
- Generates comprehensive AI prompts for compatibility analysis
- **Intelligent Fallback**: Automatically falls back to rule-based scoring if API is unavailable
- Robust JSON parsing with regex extraction for flexible response handling

### 2. Updated `app/services/features.py`
- Enhanced `extract_other_score()` with education level compatibility
- Added `extract_image_compatibility()` function for future image-based analysis
- Improved scoring precision with additional match factors

### 3. Updated `app/core/config.py`
- Added NVIDIA API configuration options:
  - `NVIDIA_API_URL`: API endpoint (default: integrate.api.nvidia.com)
  - `NVIDIA_API_KEY`: API authentication key
  - `NVIDIA_MODEL`: Model selection (moonshotai/kimi-k2.6)
  - `NVIDIA_STREAM`: Streaming toggle
  - `NVIDIA_MAX_TOKENS`: Token limit (16384)
  - `NVIDIA_TEMPERATURE`: 1.0 for creative analysis
  - `NVIDIA_TOP_P`: 1.0 for full sampling

### 4. New Files
- `test_nvidia_api.py`: Comprehensive test suite for API integration
- `.env.example`: Environment configuration template
- `NVIDIA_API_INTEGRATION.md`: This documentation file

## Configuration

### Environment Variables (.env)
```bash
# NVIDIA NIM API Configuration
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
NVIDIA_API_KEY=your_api_key_here
NVIDIA_MODEL=moonshotai/kimi-k2.6
NVIDIA_STREAM=false
NVIDIA_MAX_TOKENS=16384
NVIDIA_TEMPERATURE=1.0
NVIDIA_TOP_P=1.0

# Scoring Weights (configurable, never hardcoded)
WEIGHT_RELIGIOUS=0.30
WEIGHT_LIFESTYLE=0.25
WEIGHT_INTERESTS=0.20
WEIGHT_LOCATION=0.15
WEIGHT_OTHER=0.10
```

## API Integration Details

### Request Format
```python
headers = {
    "Authorization": f"Bearer {NVIDIA_API_KEY}",
    "Accept": "text/event-stream" if stream else "application/json",
    "Content-Type": "application/json"
}

payload = {
    "model": "moonshotai/kimi-k2.6",
    "messages": [...],
    "max_tokens": 16384,
    "temperature": 1.0,
    "top_p": 1.0,
    "stream": stream,
}
```

### Response Handling
1. **Direct JSON parsing** for non-streaming responses
2. **Event stream parsing** for streaming responses
3. **Regex extraction** as fallback for malformed JSON
4. **Rule-based fallback** if API is completely unavailable

### Compatibility Analysis
The AI analyzes across 6 dimensions:
1. Religious compatibility (sect, prayer level, religious commitment)
2. Lifestyle and cultural alignment
3. Life goals and family planning
4. Geographic and relocation considerations
5. Personal interests and values
6. Age and maturity alignment

## Testing

### Run Test Suite
```bash
cd /Users/Combu saif/Tayyibt - kilocode/ai-service
python test_nvidia_api.py
```

### Test Coverage
1. **Configuration Test**: Validates API setup
2. **Direct API Call**: Tests connectivity to NVIDIA NIM
3. **Compatibility Calculation**: Verifies scoring with sample profiles

## Architecture

### Backend Integration
- **Location**: `ai-service/app/services/scoring.py`
- **Endpoint**: `POST /api/v1/match` (FastAPI)
- **Consumer**: Backend matching service (NestJS)
- **Protocol**: HTTP/JSON

### Data Flow
```
User Profiles → AI Prompt → NVIDIA API → Compatibility Score → Match Reasons
     ↓              ↓            ↓              ↓                    ↓
  FastAPI     Template    Kimi K2.6 Model   JSON Response      Frontend Display
```

## Fallback Strategy

**Priority 1**: NVIDIA API (if configured and available)
- Full AI-powered analysis
- Natural language explanations
- Multi-dimensional scoring

**Priority 2**: Rule-based scoring (if API unavailable)
- Weighted scoring algorithm
- Configurable weights via environment
- Deterministic results

## Dependencies Added
- `requests==2.32.3`: HTTP client for API calls
- Existing dependencies remain unchanged

## Security Considerations
- API key stored in environment variables (`.env`)
- No hardcoded credentials
- HTTPS for all API communications
- 30-second timeout on API calls
- Graceful error handling with logging

## Performance
- Non-blocking API calls with timeout
- Streaming support for large responses
- 16,384 token limit balances detail vs. latency
- Temperature 1.0 for creative but focused analysis

## Future Enhancements
- Image-based profile analysis (NVIDIA Vision)
- Batch processing for multiple matches
- Caching of AI responses in Redis
- A/B testing different models
- Fine-tuning with domain-specific data

## Troubleshooting

### API Connection Issues
- Verify `NVIDIA_API_KEY` is valid
- Check network connectivity to `integrate.api.nvidia.com`
- Review logs for error messages

### Unexpected Scores
- Check if API is reachable (falls back to rule-based)
- Verify environment variables are loaded
- Review AI response format in logs

### Timeout Errors
- Default timeout is 30 seconds (adjustable)
- Check network latency
- Consider reducing `max_tokens` if needed

## References
- [NVIDIA NIM Documentation](https://docs.nvidia.com/nim/)
- [Kimi K2.6 Model](https://platform.nvidia.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
