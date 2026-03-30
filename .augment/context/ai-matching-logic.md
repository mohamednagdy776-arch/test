# AI Matching Logic

## Overview

This document defines the compatibility matching logic used by the AI service.

The system is designed to match users based on a weighted scoring model that reflects religious, social, psychological, and lifestyle compatibility.

Phase 1 uses a **rule-based scoring system**.
Phase 2 introduces **AI/ML enhancements and behavioral learning**.

---

## Matching Algorithm

### Algorithm Type
- Phase 1: Rule-Based Weighted Scoring
- Phase 2: Hybrid (Rule-Based + Machine Learning)

---

## Scoring Model

Each user pair receives a **Compatibility Score (0–100)**.

### Weight Distribution

| Category        | Weight |
|----------------|--------|
| Religious      | 30%    |
| Lifestyle      | 25%    |
| Interests      | 20%    |
| Location       | 15%    |
| Other Factors  | 10%    |

---

## Feature Extraction

The system extracts structured features from user profiles:

### 1. Religious Features
- Sect compatibility
- Prayer level
- Quran memorization
- Religious commitment level

### 2. Lifestyle Features
- Cultural level
- Lifestyle type (conservative / moderate / open)
- Future goals alignment

### 3. Interests & Hobbies
- Sports overlap
- Social activities
- Travel preferences
- Cultural interests

### 4. Demographics
- Age difference
- Marital status
- Number of children
- Education level

### 5. Location
- Country
- City
- Distance between users

### 6. Preferences
- Desire for children
- Willingness to relocate
- Preferred country

### 7. Health (Optional & Consent-Based)
- General health compatibility
- Genetic considerations (Phase 2)

---

## Scoring Logic

Each category produces a normalized score between 0 and 1.

Example:

```text
Final Score =
(religious_score * 0.30) +
(lifestyle_score * 0.25) +
(interests_score * 0.20) +
(location_score * 0.15) +
(other_score * 0.10)