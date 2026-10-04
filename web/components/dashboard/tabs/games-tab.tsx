'use client';

import { KitsuneMessage } from '@/components/kitsune/kitsune-message';

import * as React from 'react';
import {
  Gamepad2,
  Trophy,
  Zap,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Keyboard,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';

// === AUDIO SYNTHESIZER (No external files needed) ===
function playSound(type: 'correct' | 'wrong' | 'combo' | 'gameover', soundEnabled = true) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'combo') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130.81, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {}
}

// === COMPLETE KANA DATASETS ===
interface KanaItem {
  kana: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
}

const HIRAGANA_DATA: KanaItem[] = [
  // Vowels
  { kana: 'あ', romaji: 'a', type: 'hiragana' },
  { kana: 'い', romaji: 'i', type: 'hiragana' },
  { kana: 'う', romaji: 'u', type: 'hiragana' },
  { kana: 'え', romaji: 'e', type: 'hiragana' },
  { kana: 'お', romaji: 'o', type: 'hiragana' },
  // K-row
  { kana: 'か', romaji: 'ka', type: 'hiragana' },
  { kana: 'き', romaji: 'ki', type: 'hiragana' },
  { kana: 'く', romaji: 'ku', type: 'hiragana' },
  { kana: 'け', romaji: 'ke', type: 'hiragana' },
  { kana: 'こ', romaji: 'ko', type: 'hiragana' },
  // S-row
  { kana: 'さ', romaji: 'sa', type: 'hiragana' },
  { kana: 'し', romaji: 'shi', type: 'hiragana' },
  { kana: 'す', romaji: 'su', type: 'hiragana' },
  { kana: 'せ', romaji: 'se', type: 'hiragana' },
  { kana: 'そ', romaji: 'so', type: 'hiragana' },
  // T-row
  { kana: 'た', romaji: 'ta', type: 'hiragana' },
  { kana: 'ち', romaji: 'chi', type: 'hiragana' },
  { kana: 'つ', romaji: 'tsu', type: 'hiragana' },
  { kana: 'て', romaji: 'te', type: 'hiragana' },
  { kana: 'と', romaji: 'to', type: 'hiragana' },
  // N-row
  { kana: 'な', romaji: 'na', type: 'hiragana' },
  { kana: 'に', romaji: 'ni', type: 'hiragana' },
  { kana: 'ぬ', romaji: 'nu', type: 'hiragana' },
  { kana: 'ね', romaji: 'ne', type: 'hiragana' },
  { kana: 'の', romaji: 'no', type: 'hiragana' },
  // H-row
  { kana: 'は', romaji: 'ha', type: 'hiragana' },
  { kana: 'ひ', romaji: 'hi', type: 'hiragana' },
  { kana: 'ふ', romaji: 'fu', type: 'hiragana' },
  { kana: 'へ', romaji: 'he', type: 'hiragana' },
  { kana: 'ほ', romaji: 'ho', type: 'hiragana' },
  // M-row
  { kana: 'ま', romaji: 'ma', type: 'hiragana' },
  { kana: 'み', romaji: 'mi', type: 'hiragana' },
  { kana: 'む', romaji: 'mu', type: 'hiragana' },
  { kana: 'め', romaji: 'me', type: 'hiragana' },
  { kana: 'も', romaji: 'mo', type: 'hiragana' },
  // Y-row
  { kana: 'や', romaji: 'ya', type: 'hiragana' },
  { kana: 'ゆ', romaji: 'yu', type: 'hiragana' },
  { kana: 'よ', romaji: 'yo', type: 'hiragana' },
  // R-row
  { kana: 'ら', romaji: 'ra', type: 'hiragana' },
  { kana: 'り', romaji: 'ri', type: 'hiragana' },
  { kana: 'る', romaji: 'ru', type: 'hiragana' },
  { kana: 'れ', romaji: 're', type: 'hiragana' },
  { kana: 'ろ', romaji: 'ro', type: 'hiragana' },
  // W-row & N
  { kana: 'わ', romaji: 'wa', type: 'hiragana' },
  { kana: 'を', romaji: 'wo', type: 'hiragana' },
  { kana: 'ん', romaji: 'n', type: 'hiragana' },
  // Dakuten
  { kana: 'が', romaji: 'ga', type: 'hiragana' },
  { kana: 'ざ', romaji: 'za', type: 'hiragana' },
  { kana: 'だ', romaji: 'da', type: 'hiragana' },
  { kana: 'ば', romaji: 'ba', type: 'hiragana' },
  { kana: 'ぱ', romaji: 'pa', type: 'hiragana' },
];

const KATAKANA_DATA: KanaItem[] = [
  // Vowels
  { kana: 'ア', romaji: 'a', type: 'katakana' },
  { kana: 'イ', romaji: 'i', type: 'katakana' },
  { kana: 'ウ', romaji: 'u', type: 'katakana' },
  { kana: 'エ', romaji: 'e', type: 'katakana' },
  { kana: 'オ', romaji: 'o', type: 'katakana' },
  // K-row
  { kana: 'カ', romaji: 'ka', type: 'katakana' },
  { kana: 'キ', romaji: 'ki', type: 'katakana' },
  { kana: 'ク', romaji: 'ku', type: 'katakana' },
  { kana: 'ケ', romaji: 'ke', type: 'katakana' },
  { kana: 'コ', romaji: 'ko', type: 'katakana' },
  // S-row
  { kana: 'サ', romaji: 'sa', type: 'katakana' },
  { kana: 'シ', romaji: 'shi', type: 'katakana' },
  { kana: 'ス', romaji: 'su', type: 'katakana' },
  { kana: 'セ', romaji: 'se', type: 'katakana' },
  { kana: 'ソ', romaji: 'so', type: 'katakana' },
  // T-row
  { kana: 'タ', romaji: 'ta', type: 'katakana' },
  { kana: 'チ', romaji: 'chi', type: 'katakana' },
  { kana: 'ツ', romaji: 'tsu', type: 'katakana' },
  { kana: 'テ', romaji: 'te', type: 'katakana' },
  { kana: 'ト', romaji: 'to', type: 'katakana' },
  // N-row
  { kana: 'ナ', romaji: 'na', type: 'katakana' },
  { kana: 'ニ', romaji: 'ni', type: 'katakana' },
  { kana: 'ヌ', romaji: 'nu', type: 'katakana' },
  { kana: 'ネ', romaji: 'ne', type: 'katakana' },
  { kana: 'ノ', romaji: 'no', type: 'katakana' },
  // H-row
  { kana: 'ハ', romaji: 'ha', type: 'katakana' },
  { kana: 'ヒ', romaji: 'hi', type: 'katakana' },
  { kana: 'フ', romaji: 'fu', type: 'katakana' },
  { kana: 'ヘ', romaji: 'he', type: 'katakana' },
  { kana: 'ホ', romaji: 'ho', type: 'katakana' },
  // M-row
  { kana: 'マ', romaji: 'ma', type: 'katakana' },
  { kana: 'ミ', romaji: 'mi', type: 'katakana' },
  { kana: 'ム', romaji: 'mu', type: 'katakana' },
  { kana: 'メ', romaji: 'me', type: 'katakana' },
  { kana: 'モ', romaji: 'mo', type: 'katakana' },
  // Y-row
  { kana: 'ヤ', romaji: 'ya', type: 'katakana' },
  { kana: 'ユ', romaji: 'yu', type: 'katakana' },
  { kana: 'ヨ', romaji: 'yo', type: 'katakana' },
  // R-row
  { kana: 'ラ', romaji: 'ra', type: 'katakana' },
  { kana: 'リ', romaji: 'ri', type: 'katakana' },
  { kana: 'ル', romaji: 'ru', type: 'katakana' },
  { kana: 'レ', romaji: 're', type: 'katakana' },
  { kana: 'ロ', romaji: 'ro', type: 'katakana' },
  // W-row & N
  { kana: 'ワ', romaji: 'wa', type: 'katakana' },
  { kana: 'ヲ', romaji: 'wo', type: 'katakana' },
  { kana: 'ン', romaji: 'n', type: 'katakana' },
  // Dakuten
  { kana: 'ガ', romaji: 'ga', type: 'katakana' },
  { kana: 'ザ', romaji: 'za', type: 'katakana' },
  { kana: 'ダ', romaji: 'da', type: 'katakana' },
  { kana: 'バ', romaji: 'ba', type: 'katakana' },
  { kana: 'パ', romaji: 'pa', type: 'katakana' },
];

const KANJI_CARDS = [
  { id: '1', kanji: '日', matchId: 'm1', text: 'Kun / Quyosh' },
  { id: '2', kanji: '月', matchId: 'm2', text: 'Oy / Dushanba' },
  { id: '3', kanji: '木', matchId: 'm3', text: 'Daraxt' },
  { id: '4', kanji: '水', matchId: 'm4', text: 'Suv' },
  { id: '5', kanji: '火', matchId: 'm5', text: 'Olov' },
  { id: '6', kanji: '山', matchId: 'm6', text: 'Togʻ' },
];

const KOTOBA_RUSH_DATA = [
  { ja: '先生 (せんせい)', uz: 'Oʻqituvchi', wrong: ['Talaba', 'Shifokor', 'Muhandis'] },
  { ja: '学生 (がくせい)', uz: 'Talaba', wrong: ['Oʻqituvchi', 'Haydovchi', 'Direktor'] },
  { ja: '本 (ほん)', uz: 'Kitob', wrong: ['Daftar', 'Qalam', 'Sumka'] },
  { ja: '友達 (ともだち)', uz: 'Doʻst', wrong: ['Oila', 'Qoʻshni', 'Hamkasb'] },
  { ja: '車 (くるま)', uz: 'Mashina', wrong: ['Poyezd', 'Samolyot', 'Velosiped'] },
  { ja: '水 (みず)', uz: 'Suv', wrong: ['Choy', 'Sharbat', 'Sut'] },
  { ja: '家族 (かぞく)', uz: 'Oila', wrong: ['Maktab', 'Shahar', 'Doʻkon'] },
  { ja: '学校 (がっこう)', uz: 'Maktab', wrong: ['Kasalxona', 'Bank', 'Bino'] },
];

export function GamesTab() {
  const { lang, t } = useLang();
  const [selectedGame, setSelectedGame] = React.useState<'speed' | 'kanji-match' | 'word-rush'>('speed');

  // Sound effects state
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // === KANA SPEED SPRINT STATE ===
  const [kanaMode, setKanaMode] = React.useState<'hiragana' | 'katakana' | 'mixed'>('hiragana');
  const [gameDuration, setGameDuration] = React.useState<20 | 45 | 60>(20);
  const [timeLeft, setTimeLeft] = React.useState(20);
  const [gameState, setGameState] = React.useState<'idle' | 'playing' | 'ended'>('idle');

  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [maxStreak, setMaxStreak] = React.useState(0);
  const [totalQuestions, setTotalQuestions] = React.useState(0);
  const [correctAnswers, setCorrectAnswers] = React.useState(0);

  const [highScore, setHighScore] = React.useState<number>(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [feedback, setFeedback] = React.useState<'correct' | 'wrong' | null>(null);

  // Active pool of Kana items
  const activeKanaPool = React.useMemo(() => {
    if (kanaMode === 'hiragana') return HIRAGANA_DATA;
    if (kanaMode === 'katakana') return KATAKANA_DATA;
    return [...HIRAGANA_DATA, ...KATAKANA_DATA];
  }, [kanaMode]);

  // Shuffled items for game session
  const [shuffledList, setShuffledList] = React.useState<KanaItem[]>([]);

  // Current pair & 4 options
  const currentPair = shuffledList[currentIndex % (shuffledList.length || 1)] || activeKanaPool[0];

  const options = React.useMemo(() => {
    if (!currentPair) return [];
    const others = activeKanaPool
      .filter((p) => p.romaji !== currentPair.romaji)
      .map((p) => p.romaji);
    const uniqueOthers = Array.from(new Set(others));
    const randomThree = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, 3);
    return [currentPair.romaji, ...randomThree].sort(() => 0.5 - Math.random());
  }, [currentIndex, currentPair, activeKanaPool]);

  // Load high score from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('kana_sprint_highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Multiplier based on streak
  const multiplier = streak >= 10 ? 4 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1;

  // Timer countdown
  React.useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('ended');
      playSound('gameover', soundEnabled);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, soundEnabled]);

  // Update high score on game end
  React.useEffect(() => {
    if (gameState === 'ended') {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('kana_sprint_highscore', score.toString());
      }
    }
  }, [gameState, score, highScore]);

  // Start Speed Sprint
  const startSpeedGame = () => {
    const shuffled = [...activeKanaPool].sort(() => 0.5 - Math.random());
    setShuffledList(shuffled);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setTimeLeft(gameDuration);
    setCurrentIndex(0);
    setGameState('playing');
    setFeedback(null);
  };

  const playKanaAudio = (char: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(char);
      utterance.lang = 'ja-JP';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = React.useCallback(
    (romaji: string) => {
      if (gameState !== 'playing' || feedback !== null) return;

      setTotalQuestions((q) => q + 1);

      if (romaji === currentPair.romaji) {
        const added = 10 * multiplier;
        setScore((s) => s + added);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        setCorrectAnswers((c) => c + 1);
        setFeedback('correct');

        if (newStreak >= 3 && newStreak % 3 === 0) {
          playSound('combo', soundEnabled);
        } else {
          playSound('correct', soundEnabled);
        }
        playKanaAudio(currentPair.kana);
      } else {
        setStreak(0);
        setFeedback('wrong');
        playSound('wrong', soundEnabled);
        // Penalty: -2s
        setTimeLeft((t) => Math.max(0, t - 2));
      }

      setTimeout(() => {
        setFeedback(null);
        setCurrentIndex((idx) => idx + 1);
      }, 200);
    },
    [gameState, feedback, currentPair, multiplier, streak, maxStreak, soundEnabled]
  );

  // Keyboard controls: 1, 2, 3, 4
  React.useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (options[idx]) {
          handleAnswer(options[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, options, handleAnswer]);

  // Rank calculation
  const getRankBadge = (pts: number) => {
    if (pts >= 350) return { title: 'Kana Shoguni 👑', coins: 30, color: 'text-amber-500' };
    if (pts >= 200) return { title: 'Shiddatli Ninja 🥷', coins: 15, color: 'text-purple-500' };
    if (pts >= 100) return { title: 'Tezkor Samuray ⚔️', coins: 5, color: 'text-blue-500' };
    return { title: 'Yangi Boshlovchi 🌱', coins: 2, color: 'text-emerald-500' };
  };

  // === KANJI MATCH STATE ===
  const [matchCards, setMatchCards] = React.useState<{ id: string; type: 'kanji' | 'text'; text: string; matchKey: string }[]>([]);
  const [selectedCards, setSelectedCards] = React.useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = React.useState<string[]>([]);
  const [kanjiMatchWon, setKanjiMatchWon] = React.useState(false);

  const startKanjiMatch = () => {
    const list: { id: string; type: 'kanji' | 'text'; text: string; matchKey: string }[] = [];
    KANJI_CARDS.forEach((c) => {
      list.push({ id: `k-${c.id}`, type: 'kanji', text: c.kanji, matchKey: c.matchId });
      list.push({ id: `t-${c.id}`, type: 'text', text: c.text, matchKey: c.matchId });
    });
    setMatchCards(list.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchedKeys([]);
    setKanjiMatchWon(false);
  };

  React.useEffect(() => {
    if (selectedGame === 'kanji-match' && matchCards.length === 0) {
      startKanjiMatch();
    }
  }, [selectedGame, matchCards.length]);

  const handleCardClick = (idx: number) => {
    if (selectedCards.length === 2 || selectedCards.includes(idx)) return;
    const card = matchCards[idx];
    if (matchedKeys.includes(card.matchKey)) return;

    const newSelected = [...selectedCards, idx];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const card1 = matchCards[newSelected[0]];
      const card2 = matchCards[newSelected[1]];

      if (card1.matchKey === card2.matchKey && card1.type !== card2.type) {
        playSound('combo', soundEnabled);
        const nextMatched = [...matchedKeys, card1.matchKey];
        setMatchedKeys(nextMatched);
        setSelectedCards([]);
        if (nextMatched.length === KANJI_CARDS.length) {
          setKanjiMatchWon(true);
          playSound('gameover', soundEnabled);
        }
      } else {
        playSound('wrong', soundEnabled);
        setTimeout(() => setSelectedCards([]), 700);
      }
    }
  };

  // === KOTOBA RUSH STATE ===
  const [rushIdx, setRushIdx] = React.useState(0);
  const [rushScore, setRushScore] = React.useState(0);
  const [rushTime, setRushTime] = React.useState(30);
  const [rushPlaying, setRushPlaying] = React.useState(false);
  const [rushEnded, setRushEnded] = React.useState(false);

  const currentRushWord = KOTOBA_RUSH_DATA[rushIdx % KOTOBA_RUSH_DATA.length];
  const rushOptions = React.useMemo(() => {
    if (!currentRushWord) return [];
    return [currentRushWord.uz, ...currentRushWord.wrong].sort(() => 0.5 - Math.random());
  }, [currentRushWord]);

  React.useEffect(() => {
    if (!rushPlaying) return;
    if (rushTime <= 0) {
      setRushPlaying(false);
      setRushEnded(true);
      playSound('gameover', soundEnabled);
      return;
    }
    const timer = setInterval(() => setRushTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [rushPlaying, rushTime, soundEnabled]);

  const startKotobaRush = () => {
    setRushIdx(0);
    setRushScore(0);
    setRushTime(30);
    setRushPlaying(true);
    setRushEnded(false);
  };

  const handleRushAnswer = (choice: string) => {
    if (!rushPlaying) return;
    if (choice === currentRushWord.uz) {
      setRushScore((s) => s + 15);
      playSound('correct', soundEnabled);
    } else {
      playSound('wrong', soundEnabled);
      setRushTime((t) => Math.max(0, t - 3));
    }
    setRushIdx((idx) => idx + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-amber-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Gamepad2 className="h-3.5 w-3.5" />
                <span>{t?.games?.title || 'Yapon Tili Oʻyinlari'}</span>
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 hover:bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title={soundEnabled ? 'Ovozni oʻchirish' : 'Ovozni yoqish'}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-500" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{soundEnabled ? 'Ovoz yoniq' : 'Ovoz oʻchiq'}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t?.games?.title || 'Oʻynab oʻrganing: Interaktiv Mini-Oʻyinlar'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t?.games?.subtitle || 'Xotirani charxlash va reaksiyani oshirish uchun yaponcha mini-oʻyinlar. Har kuni bir necha daqiqa bellashib, tezlik va yangi soʻzlarni mustahkamlang!'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-border bg-card/80 p-4 text-center min-w-[120px]">
              <Trophy className="mx-auto h-5 w-5 text-amber-500 mb-1" />
              <div className="text-xs text-muted-foreground">{t?.games?.bestScore || 'Eng yuqori ball'}</div>
              <div className="text-xl font-extrabold text-foreground">{highScore} pts</div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 text-center min-w-[120px]">
              <Flame className="mx-auto h-5 w-5 text-rose-500 mb-1 animate-pulse" />
              <div className="text-xs text-muted-foreground">Sprint darajasi</div>
              <div className="text-sm font-bold text-rose-500">{getRankBadge(highScore).title}</div>
            </div>
          </div>
        </div>
      </div>

      {selectedGame === 'speed' && (
        <KitsuneMessage
          variant={gameState === 'idle' ? 'level' : 'pose'}
          level="KANA"
          state={feedback === 'correct' ? 'celebrating' : feedback === 'wrong' ? 'encouraging' : gameState === 'ended' ? (correctAnswers > 0 ? 'celebrating' : 'encouraging') : 'thinking'}
          messageKey={gameState === 'idle' ? 'welcome' : feedback === 'correct' ? 'correct' : feedback === 'wrong' ? 'encouraging' : gameState === 'ended' ? (correctAnswers > 0 ? 'completed' : 'encouraging') : 'thinking'}
          size="small"
        />
      )}

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            id: 'speed',
            title: 'Kana Speed Sprint',
            desc: 'Hiragana va Katakanani soniya ichida topish',
            icon: Zap,
            tag: 'Mashhur ⚡',
          },
          {
            id: 'kanji-match',
            title: 'Kanji Match',
            desc: 'Iyeroglif va maʼnolarini juftlash (Memory)',
            icon: Sparkles,
            tag: 'N5 Kartochkalar',
          },
          {
            id: 'word-rush',
            title: 'Kotoba Rush',
            desc: 'Vaqtga qarshi soʻz topish poygasi',
            icon: Clock,
            tag: 'Soʻz boyligi',
          },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGame(g.id as any)}
            className={`flex flex-col text-left p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedGame === g.id
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-border bg-card hover:bg-secondary/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                <g.icon className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-muted-foreground">
                {g.tag}
              </span>
            </div>
            <div className="font-bold text-foreground text-base">{g.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{g.desc}</div>
          </button>
        ))}
      </div>

      {/* Main Game Arena */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xs">
        {/* ========================================================================= */}
        {/* 1. KANA SPEED SPRINT */}
        {/* ========================================================================= */}
        {selectedGame === 'speed' && (
          <div className="max-w-xl mx-auto space-y-6">
            {gameState === 'idle' && (
              <div className="space-y-8 py-6 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/10 text-amber-500 shadow-inner">
                  <Zap className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground">Kana Speed Sprint</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Yapon alifbosini tezkor eslab qolish maratoni. Klaviaturadagi <strong>1, 2, 3, 4</strong> tugmalari yoki sichqoncha orqali imkon qadar koʻproq toʻgʻri oʻqilishini toping!
                  </p>
                </div>

                {/* Game Options Setup */}
                <div className="space-y-4 max-w-sm mx-auto text-left">
                  {/* Alifbo turi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> Alifbo turi:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hiragana', label: 'Hiragana' },
                        { id: 'katakana', label: 'Katakana' },
                        { id: 'mixed', label: 'Aralash' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setKanaMode(m.id as any)}
                          className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            kanaMode === m.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vaqt tanlash */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Sprint vaqti:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[20, 45, 60].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setGameDuration(sec as any)}
                          className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            gameDuration === sec
                              ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {sec}s {sec === 20 ? '⚡ Blitz' : sec === 45 ? '🎯 Standart' : '🔥 Pro'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={startSpeedGame}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Sprintni Boshlash ({gameDuration}s)</span>
                  </button>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>Klaviatura: 1, 2, 3, 4 tugmalaridan foydalanishingiz mumkin</span>
                </div>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="space-y-6">
                {/* Score & Streak Header */}
                <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-secondary/40 border border-border">
                  {/* Time */}
                  <div className="flex items-center gap-2">
                    <Clock className={`h-5 w-5 ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                    <span className={`text-base font-extrabold font-mono ${timeLeft <= 5 ? 'text-rose-500' : 'text-foreground'}`}>
                      {timeLeft}s
                    </span>
                  </div>

                  {/* Combo Streak Multiplier */}
                  <div className="flex items-center gap-2">
                    {multiplier > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-xs animate-bounce flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span>x{multiplier} COMBO</span>
                      </span>
                    )}
                    {streak > 0 && (
                      <span className="text-xs text-muted-foreground font-semibold">
                        Streak: {streak} 🔥
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-1.5 text-base font-extrabold text-primary font-mono">
                    <Award className="h-5 w-5" />
                    <span>{score} pts</span>
                  </div>
                </div>

                {/* Main Kana Card */}
                <div
                  className={`relative rounded-3xl border-2 p-12 transition-all flex flex-col items-center justify-center min-h-[220px] ${
                    feedback === 'correct'
                      ? 'border-emerald-500 bg-emerald-500/10 scale-102'
                      : feedback === 'wrong'
                        ? 'border-rose-500 bg-rose-500/10 shake'
                        : 'border-border bg-secondary/30'
                  }`}
                >
                  <span className="text-8xl sm:text-9xl font-extrabold text-foreground tracking-widest font-japanese select-none">
                    {currentPair.kana}
                  </span>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-2">
                    {currentPair.type === 'hiragana' ? 'Hiragana' : 'Katakana'}
                  </span>

                  {feedback === 'correct' && (
                    <CheckCircle2 className="absolute top-4 right-4 h-7 w-7 text-emerald-500 animate-in zoom-in-50" />
                  )}
                  {feedback === 'wrong' && (
                    <XCircle className="absolute top-4 right-4 h-7 w-7 text-rose-500 animate-in zoom-in-50" />
                  )}
                </div>

                {/* 4 Choices Grid with Keyboard Shortcuts */}
                <div className="grid grid-cols-2 gap-3">
                  {options.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswer(opt)}
                      className="h-16 rounded-2xl border border-border bg-card text-lg font-extrabold text-foreground hover:bg-secondary/90 hover:border-primary/50 transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-between px-6 group"
                    >
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground group-hover:text-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-xl font-bold tracking-wider">{opt}</span>
                      <span className="w-5" />
                    </button>
                  ))}
                </div>

                <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>Klaviatura 1, 2, 3, 4 tugmalarini bosing</span>
                </div>
              </div>
            )}

            {gameState === 'ended' && (
              <div className="space-y-6 py-6 text-center animate-in zoom-in-95 duration-200">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/10 text-amber-500 shadow-inner">
                  <Trophy className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Sprint yakunlandi!
                  </span>
                  <h3 className="text-3xl font-extrabold text-foreground">
                    {score} Ball Toʻpladingiz!
                  </h3>
                  <div className={`text-base font-bold ${getRankBadge(score).color} pt-1`}>
                    Unvon: {getRankBadge(score).title}
                  </div>
                </div>

                {/* Detailed Stats Card */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                    <div className="text-lg font-bold text-foreground">
                      {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                    </div>
                    <div className="text-[11px] text-muted-foreground">Aniqlik</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-secondary/40 border border-border">
                    <div className="text-lg font-bold text-orange-500">
                      {maxStreak} 🔥
                    </div>
                    <div className="text-[11px] text-muted-foreground">Max Combo</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      +{getRankBadge(score).coins} 🪙
                    </div>
                    <div className="text-[11px] text-muted-foreground">Tanga yutdingiz</div>
                  </div>
                </div>

                {score > highScore && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Yangi Shaxsiy Rekord!</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={startSpeedGame}
                    className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Qayta Oʻynash</span>
                  </button>
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-6 py-3.5 rounded-2xl border border-border bg-card hover:bg-secondary text-foreground font-semibold text-sm transition-all cursor-pointer"
                  >
                    Rejimni Oʻzgartirish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. KANJI MATCH (MEMORY MATCH) */}
        {/* ========================================================================= */}
        {selectedGame === 'kanji-match' && (
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Kanji Match (Memory)</h3>
                <p className="text-xs text-muted-foreground">
                  Iyeroglif va uning oʻzbekcha maʼnosini juftlab barcha kartochkalarni oching!
                </p>
              </div>
              <button
                onClick={startKanjiMatch}
                className="text-xs px-3 py-1.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Qayta boshlash
              </button>
            </div>

            {kanjiMatchWon ? (
              <div className="py-12 space-y-4 animate-in zoom-in-95">
                <Trophy className="h-16 w-16 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">Gʻalaba! Barcha Kanjilarni topdingiz! 🎉</h3>
                <p className="text-xs text-muted-foreground">+15 tanga hisobingizga qoʻshildi.</p>
                <button
                  onClick={startKanjiMatch}
                  className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-xs cursor-pointer shadow-md"
                >
                  Yana oʻynash
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {matchCards.map((card, idx) => {
                  const isSelected = selectedCards.includes(idx);
                  const isMatched = matchedKeys.includes(card.matchKey);

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      disabled={isMatched}
                      className={`h-24 sm:h-28 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center p-2 text-center select-none ${
                        isMatched
                          ? 'border-emerald-500/50 bg-emerald-500/10 opacity-70 cursor-default'
                          : isSelected
                            ? 'border-primary bg-primary/15 shadow-md scale-102'
                            : 'border-border bg-secondary/30 hover:bg-secondary/60 hover:scale-101'
                      }`}
                    >
                      {card.type === 'kanji' ? (
                        <span className="text-4xl sm:text-5xl font-bold font-japanese text-foreground">
                          {card.text}
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                          {card.text}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. KOTOBA RUSH (RAPID VOCABULARY) */}
        {/* ========================================================================= */}
        {selectedGame === 'word-rush' && (
          <div className="max-w-md mx-auto space-y-6 text-center">
            {!rushPlaying && !rushEnded && (
              <div className="py-8 space-y-5">
                <Clock className="h-16 w-16 text-amber-500 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">Kotoba Rush (30s)</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    30 soniya ichida yaponcha soʻzlarning oʻzbekcha toʻgʻri tarjimasini toping. Har bir xato -3 soniya jarima keltiradi!
                  </p>
                </div>
                <button
                  onClick={startKotobaRush}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md cursor-pointer hover:bg-primary/90 transition-all"
                >
                  Poygani boshlash (30s)
                </button>
              </div>
            )}

            {rushPlaying && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-secondary/40 border border-border">
                  <span className="text-sm font-mono font-bold text-rose-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {rushTime}s
                  </span>
                  <span className="text-sm font-mono font-bold text-primary flex items-center gap-1">
                    <Award className="h-4 w-4" /> {rushScore} pts
                  </span>
                </div>

                <div className="p-8 rounded-3xl border border-border bg-secondary/30">
                  <div className="text-3xl font-extrabold text-foreground font-japanese">
                    {currentRushWord.ja}
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    Toʻgʻri maʼnosini tanlang:
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {rushOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleRushAnswer(opt)}
                      className="py-3.5 rounded-xl border border-border bg-card hover:bg-secondary text-sm font-bold text-foreground transition-all cursor-pointer active:scale-98 shadow-xs"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rushEnded && (
              <div className="py-8 space-y-5 animate-in zoom-in-95">
                <Trophy className="h-14 w-14 text-amber-500 mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">Vaqt tugadi!</h3>
                <p className="text-sm text-muted-foreground">
                  Kotoba Rush boʻyicha <strong className="text-foreground">{rushScore} ball</strong> toʻpladingiz!
                </p>
                <button
                  onClick={startKotobaRush}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md cursor-pointer"
                >
                  Qayta oʻynash
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
