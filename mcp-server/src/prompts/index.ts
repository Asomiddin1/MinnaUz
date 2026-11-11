import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerAllPrompts(server: McpServer) {
  // 1. japanese_sensei
  server.prompt(
    'japanese_sensei',
    'Interactive Japanese language tutor who explains concepts, vocabulary, and grammar in clear Uzbek with Japanese examples, furigana, and cultural context.',
    {
      level: z
        .enum(['N5', 'N4', 'N3', 'N2', 'N1'])
        .default('N5')
        .describe('Target JLPT level'),
      topic: z
        .string()
        .describe('The topic, question, or sentence the student wants to learn (e.g. "Verb te-form", "Particle wa vs ga")'),
    },
    ({ level, topic }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are MinnaUz AI Sensei, an expert, patient, and culturally fluent Japanese language teacher for Uzbek native speakers.
The student is currently at JLPT ${level} level.
Topic to explain: "${topic}".

Please teach this topic following these guidelines:
1. Explain clearly in Uzbek using simple, friendly, and natural language.
2. Provide Japanese examples using Kanji with Furigana (reading in parentheses) and Romaji.
3. Explain particles and word order by drawing direct parallels to Uzbek grammar (e.g. comparing postpositions and SOV order).
4. Highlight common mistakes made by beginners.
5. Offer 2 interactive mini practice questions for the student to test their understanding.
`,
          },
        },
      ],
    })
  );

  // 2. jlpt_exam_tutor
  server.prompt(
    'jlpt_exam_tutor',
    'Targeted JLPT test preparation tutor simulating official exam questions and scoring strategies.',
    {
      targetLevel: z
        .enum(['N5', 'N4', 'N3', 'N2', 'N1'])
        .describe('JLPT target exam level (N5 to N1)'),
      section: z
        .enum(['KOTOBA', 'BUNPOU', 'DOKKAI', 'CHOUKAI'])
        .default('BUNPOU')
        .describe('JLPT section: KOTOBA (Vocab), BUNPOU (Grammar), DOKKAI (Reading), CHOUKAI (Listening)'),
    },
    ({ targetLevel, section }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are a JLPT Exam Coach on MinnaUz.
Target Level: JLPT ${targetLevel}.
Section: ${section}.

Please conduct an exam training drill:
1. Present 1 realistic, official-style JLPT question matching the typical Mondai format for ${targetLevel} ${section}.
2. Provide 4 numbered answer choices (1, 2, 3, 4).
3. Do not reveal the answer immediately; invite the student to select their answer.
4. When the student replies, evaluate their choice, give the full explanation in Uzbek, explain why the distractors are wrong, and remind them of the sectional pass mark threshold for ${targetLevel}.
`,
          },
        },
      ],
    })
  );

  // 3. grammar_breakdown
  server.prompt(
    'grammar_breakdown',
    'Deep pedagogical breakdown of a specific Japanese grammatical pattern with formula, Uzbek translation, and usage nuances.',
    {
      grammarPoint: z
        .string()
        .describe('The Japanese grammar pattern to explain (e.g. "~てはいけません", "~ほうがいいです", "~ながら")'),
    },
    ({ grammarPoint }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please provide a thorough grammatical breakdown of the Japanese grammar pattern: "${grammarPoint}".

Include the following sections:
1. **Meaning in Uzbek**: Exact translations and emotional/situational nuances.
2. **Grammar Formula**: How verbs, adjectives, and nouns connect to this pattern (e.g. V-te form + wa ikemasen).
3. **Register & Politeness**: When to use polite (-masu) vs plain/casual forms.
4. **Natural Examples**: 3 practical example sentences with kanji, furigana, romaji, and natural Uzbek translations.
5. **Uzbek Parallel**: Equivalent grammatical structures or suffixes in Uzbek.
`,
          },
        },
      ],
    })
  );
}

