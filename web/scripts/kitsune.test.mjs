import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const loadCompiled = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const output = mkdtempSync(path.join(tmpdir(), 'kitsune-tests-'));
execFileSync(process.execPath, [
  path.join(root, 'node_modules/typescript/bin/tsc'),
  'lib/kitsune/assets.ts', 'lib/kitsune/state.ts', 'lib/kitsune/messages.ts',
  '--outDir', output, '--module', 'commonjs', '--target', 'es2022', '--skipLibCheck',
], { cwd: root });
after(() => rmSync(output, { recursive: true, force: true }));

const { poses, expressions, levels, getKitsuneAsset } = loadCompiled(path.join(output, 'assets.js'));
const { lessonKitsuneState, testKitsuneState } = loadCompiled(path.join(output, 'state.js'));
const { messages } = loadCompiled(path.join(output, 'messages.js'));

test('each supported asset exists and stays within the image budget', () => {
  for (const asset of new Set([...Object.values(poses), ...Object.values(expressions), ...Object.values(levels)])) {
    const file = path.join(root, 'public', asset);
    assert.ok(existsSync(file), asset);
    const bytes = readFileSync(file);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(bytes.length < 150 * 1024, asset);
  }
});

test('unknown levels fall back safely; N2/N1 and the duplicate welcome share assets', () => {
  for (const level of [null, undefined, 'OTHER', 'UNKNOWN', 'toString', '__proto__']) {
    assert.equal(getKitsuneAsset('welcome', 'level', level), poses.welcome);
  }
  assert.equal(levels.N2, levels.N1);
  assert.equal(expressions.welcome, poses.welcome);
  assert.equal(getKitsuneAsset('celebrating', 'level', 'N4'), levels.N4);
});

const lesson = { activeTab: 'renshuu', submitted: false, score: null, completed: false, saveState: 'idle' };

test('unsubmitted or retaken quizzes never reveal correctness, even with a previous score', () => {
  assert.equal(lessonKitsuneState(lesson), 'thinking');
  assert.equal(lessonKitsuneState({ ...lesson, score: 100, completed: true }), 'thinking');
});

test('saving and failed persistence take precedence over celebration', () => {
  const success = { ...lesson, submitted: true, score: 100, completed: true };
  assert.equal(lessonKitsuneState({ ...success, saveState: 'saving' }), 'thinking');
  assert.equal(lessonKitsuneState({ ...success, saveState: 'error' }), 'encouraging');
  assert.equal(lessonKitsuneState({ ...success, saveState: 'saved' }), 'celebrating');
});

test('lesson pass boundary and API test outcome are independent', () => {
  assert.equal(lessonKitsuneState({ ...lesson, submitted: true, score: 69, saveState: 'saved' }), 'encouraging');
  assert.equal(lessonKitsuneState({ ...lesson, submitted: true, score: 70, saveState: 'saved' }), 'celebrating');
  // A test can pass below 70%; only the API's isPassed should select its reaction.
  assert.equal(testKitsuneState(true), 'celebrating');
  assert.equal(testKitsuneState(false), 'encouraging');
});

test('every message has all four translations and beginner Japanese contains no kanji', () => {
  for (const language of ['uz', 'ru', 'en', 'ja']) {
    const dictionary = JSON.parse(readFileSync(path.join(root, `lib/i18n/locales/${language}.json`), 'utf8'));
    for (const key of Object.keys(messages)) assert.ok(dictionary.kitsune.messages[key]?.trim(), `${language}: ${key}`);
    assert.ok(dictionary.kitsune.preparationLevel.includes('{level}'));
  }
  for (const message of Object.values(messages)) {
    assert.ok(!/[\u3400-\u9fff]/u.test(message.kana));
  }
});
