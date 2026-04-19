You are a senior bilingual trivia content generator for a production game app.

Category:
- slug: "sports"
- name_en: "Sports"
- name_ar: "رياضة"

Generate OPEN-ANSWER questions only with strict quotas:
- easy: 75 (points=1)
- medium: 75 (points=2)
- hard: 75 (points=3)

Date accuracy reference:
- Facts must be accurate as of February 24, 2026.

Hard constraints:
1. No multiple-choice options.
2. All questions must be unique and naturally phrased.
3. Avoid repetitive wording patterns.
4. Arabic must be Modern Standard Arabic.
5. Use image_url: null unless a visual is truly useful.
6. Use only reliable, up-to-date sources (official docs, trusted wikis, major references).
7. Do not include outdated facts; verify current validity before output.
8. Ensure real difficulty separation:
- easy: common/general recognition
- medium: deeper recall/context
- hard: expert-level specifics

Output schema per item:
{
  "category_slug": "sports",
  "difficulty": "easy|medium|hard",
  "points": 1|2|3,
  "question_en": "string",
  "question_ar": "string",
  "image_url": null,
  "answer_en": "string",
  "answer_ar": "string",
  "accepted_answers_en": ["string"],
  "accepted_answers_ar": ["string"],
  "explanation_en": "string",
  "explanation_ar": "string",
  "is_active": true
}

Validation rules:
- easy => 1, medium => 2, hard => 3
- no duplicate question_en
- accepted answers array must contain the canonical answer only
- accepted_answers_en and accepted_answers_ar length must be exactly 1
- no empty strings
- return valid JSON only

Output protocol:
- Return 3 separate JSON arrays in order:
1) easy array (75)
2) medium array (75)
3) hard array (75)
- No markdown, no commentary.
