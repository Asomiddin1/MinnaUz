import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerJlptResources(server: McpServer) {
  server.resource(
    'jlpt-guide',
    'minnauz://jlpt/guide',
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: `# Official JLPT Exam Guide & Pedagogical Benchmark

## 1. Official Administration & Scoring Structure
- **Administering Bodies:** The Japanese-Language Proficiency Test (JLPT) is administered globally by **The Japan Foundation (国際交流基金)** and in Japan by **Japan Educational Exchanges and Services (JEES / 日本国際教育支援協会)**.
- **Scoring System:** JLPT does **not** use raw point summation. Test scores are **Scaled Scores (得点等化)** computed using **Item Response Theory (IRT)**. This statistical methodology ensures that scoring is equitable and independent of variations in test question difficulty across different test dates.

---

## 2. Official Pass Marks & Sectional Minimums

A candidate must meet **both** the Overall Pass Threshold **and** the Sectional Minimum for every section. Failing any single section results in overall failure.

| Level | Exam Sections & Scaled Scoring | Section Minimum | Overall Pass Threshold |
| :--- | :--- | :--- | :--- |
| **N1** | 1. Language Knowledge (Vocab/Grammar): 0–60 pts<br>2. Reading: 0–60 pts<br>3. Listening: 0–60 pts | **19 / 60 pts** per section | **100 / 180 pts** |
| **N2** | 1. Language Knowledge (Vocab/Grammar): 0–60 pts<br>2. Reading: 0–60 pts<br>3. Listening: 0–60 pts | **19 / 60 pts** per section | **90 / 180 pts** |
| **N3** | 1. Language Knowledge (Vocab/Grammar): 0–60 pts<br>2. Reading: 0–60 pts<br>3. Listening: 0–60 pts | **19 / 60 pts** per section | **95 / 180 pts** |
| **N4** | 1. Language Knowledge & Reading: 0–120 pts<br>2. Listening: 0–60 pts | **38 / 120 pts** (Vocab/Reading)<br>**19 / 60 pts** (Listening) | **90 / 180 pts** |
| **N5** | 1. Language Knowledge & Reading: 0–120 pts<br>2. Listening: 0–60 pts | **38 / 120 pts** (Vocab/Reading)<br>**19 / 60 pts** (Listening) | **80 / 180 pts** |

---

## 3. Official Policy on Vocabulary and Kanji Lists

> **Important Disclosure:** Since the 2010 test revision, the Japan Foundation and JEES **officially discontinued the publication of official vocabulary and kanji lists**. The exam assesses communicative competence rather than memorization of a closed list.

The figures below represent **Pedagogical Estimates** derived from major educational curricula (*Minna no Nihongo*, *Shin Kanzen Master*) and should be treated as guidelines rather than official requirements:

- **N5:** ~100 Kanji, ~800 Vocabulary words (Pedagogical estimate)
- **N4:** ~300 Kanji, ~1,500 Vocabulary words (Pedagogical estimate)
- **N3:** ~650 Kanji, ~3,750 Vocabulary words (Pedagogical estimate)
- **N2:** ~1,000 Kanji, ~6,000 Vocabulary words (Pedagogical estimate)
- **N1:** ~2,000 Kanji, ~10,000 Vocabulary words (Pedagogical estimate)
`,
        },
      ],
    })
  );
}

