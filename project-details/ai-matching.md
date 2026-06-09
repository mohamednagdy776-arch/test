# AI Matching Engine

The heart of Tayyibt is its specialized AI service, which calculates the compatibility between users based on a variety of qualitative and quantitative factors.

## Scoring Categories

The compatibility score (0-100%) is derived from a weighted average across five primary categories:

| Category | Weight | Factors Included |
|----------|--------|------------------|
| **Religious Values** | 30% | Sect, prayer level, religious commitment, hijab (for women), etc. |
| **Lifestyle** | 25% | Education, occupation, children, smoking/drinking habits, diet. |
| **Interests** | 20% | Shared hobbies, passions, and activities. |
| **Location** | 15% | Country and city proximity. |
| **Demographics** | 10% | Age gap, language, etc. |

## How it Works

1. **Request:** The Backend API sends a request to the AI Service containing data for two users (`User A` and `User B`).
2. **Feature Extraction:** The AI Service parses the unstructured or semi-structured data into normalized features.
3. **Algorithm:** A rule-based weighted algorithm (with plans for future Machine Learning model integration) calculates the sub-scores for each category.
4. **Reasoning:** The service identifies the strongest "match drivers" (e.g., "Both are highly committed to daily prayer").
5. **Response:** Returns a JSON object with the final score and a list of match reasons.

## Technical Implementation
- **Language:** Python 3.x
- **Framework:** FastAPI for high-performance async API handling.
- **Logic:** Currently utilizes weighted scoring logic, designed to be swapped with more advanced ML models (like XGBoost or Neural Networks) as data grows.

## Future Roadmap
- **Phase 1 (Current):** Rule-based weighted scoring.
- **Phase 2:** Integration of machine learning models trained on successful marriage outcomes.
- **Phase 3:** Natural Language Processing (NLP) to analyze bio descriptions for better interest matching.
