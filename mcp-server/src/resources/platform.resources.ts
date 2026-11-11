import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MinnaUzApiClient } from '../services/api-client.js';

export function registerPlatformResources(server: McpServer, apiClient: MinnaUzApiClient) {
  // 1. Platform Info
  server.resource(
    'platform-info',
    'minnauz://platform/info',
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              platform: 'MinnaUz 2.0',
              description: 'The modern Japanese language learning platform designed specifically for Uzbek native speakers.',
              levelsSupported: ['N5', 'N4', 'N3', 'N2', 'N1'],
              lessonPedagogy: [
                'Kotoba (Vocabulary with audio & Uzbek definitions)',
                'Bunpou (Grammar structures with Uzbek explanations)',
                'Kanji (Radicals, readings & stroke animations)',
                'Renshuu (Exercises & multiple choice drills)',
                'Kaiwa (Interactive conversation scenarios with AI Sensei)',
              ],
              subscriptionTiers: {
                FREE: 'Access to introductory modules and free lessons in each course.',
                PRO: 'Full access to all course modules, complete vocabulary, kanji flashcards, and JLPT mock exams.',
              },
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // 2. Linguistic Methodology for Uzbek Native Speakers
  server.resource(
    'uzbek-japanese-methodology',
    'minnauz://methodology/uzbek-japanese',
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: `# Japanese Learning Methodology for Uzbek Native Speakers

## 1. Natural Syntactic Alignment (SOV)
Both Japanese and Uzbek naturally follow **Subject-Object-Verb (SOV)** word order:
- Uzbek: *Men yapon tilini o'rganaman.* (Subject - Object - Verb)
- Japanese: *Watashi wa nihongo o benkyou shimasu.* (Subject - Object - Verb)
- English: *I study Japanese.* (Subject - Verb - Object)

Because Uzbek speakers already think in SOV structures, sentence construction in Japanese does not require inversions.

---

## 2. Agglutinative Particle Correspondences
Both languages attach grammatical particles and suffixes to word stems to denote case and relational function:

| Japanese Particle | Uzbek Equivalent | Function / Role | Example |
| :--- | :--- | :--- | :--- |
| **は (wa)** | *-chi, esa* | Topic marker | *Watashi wa...* (Men esa...) |
| **が (ga)** | Subject marker | Subject identifier / focus | *Ame ga futte iru* (Yomg'ir yog'yapti) |
| **を (o)** | **-ni** | Accusative / direct object | *Kitobni o'qiyman* (Hon o yomimasu) |
| **に (ni) / へ (e)** | **-ga** | Direction / indirect object | *Maktabga boraman* (Gakkou ni ikimasu) |
| **で (de)** | **-da** | Location of action / tool | *Qalam bilan yozaman* (Pen de kakimasu) |
| **から (kara)** | **-dan** | Source / start point | *Soat 9 dan...* (Ku-ji kara...) |
| **まで (made)** | **-gacha** | Limit / destination | *Soat 5 gacha...* (Go-ji made...) |
| **と (to)** | **va, bilan** | Conjunction / accompaniment | *Do'stim bilan* (Tomodachi to) |

---

## 3. Pure 5-Vowel Phonetics
Both languages utilize clean, unreduced 5-vowel phonemes:
- **A** (あ), **I** (い), **U** (う), **E** (え), **O** (お)
Unlike English, Japanese vowels do not undergo unpredictable diphthong reductions in unstressed syllables.
`,
        },
      ],
    })
  );

  // 3. Courses Catalog Resource
  server.resource(
    'courses-catalog',
    'minnauz://courses/catalog',
    async (uri) => {
      const courses = await apiClient.getCourses();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(courses, null, 2),
          },
        ],
      };
    }
  );
}

