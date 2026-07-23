<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ChatMessage;

class AiController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $userMessage = $request->input('message');
            $user = $request->user(); 
            
            // Foydalanuvchi tizimga kirmagan bo'lsa, xatolik qaytarish
            if (!$user) {
                return response()->json(['reply' => "Foydalanuvchi avtorizatsiyadan o'tmagan."], 401);
            }

            $language = $request->input('lang', 'uz-UZ');
            
            // Frontenddan kelayotgan parametrlar
            $topic = $request->input('topic', 'Erkin');
            $level = $request->input('level', 'N5');
            $history = is_array($request->input('history')) ? $request->input('history') : [];

            // Darajaga qarab qoidalar
            $levelInstructions = "";
            switch($level) {
                case 'N5':
                    $levelInstructions = "Juda oddiy boshlang'ich so'zlar, qisqa gaplar va 'Desu / Masu' shaklidan foydalan. Qiyin Kanji ishlatma.";
                    break;
                case 'N4':
                    $levelInstructions = "Boshlang'ich-o'rta daraja. Kundalik hayotiy so'zlar, 'te-form', 'ta-form' kabi oddiy grammatikadan foydalan.";
                    break;
                case 'N3':
                    $levelInstructions = "O'rta daraja. Turli xil fe'l shakllari, kundalik o'rta daraja so'z va Kanjilar ishlating. Tabiiy yapon tiliga yaqin gapir.";
                    break;
                case 'N2':
                    $levelInstructions = "Yuqori daraja. Murakkab grammatika, boy va ilmiy/ish so'z boyligi, Keigo va murakkab Kanjilardan erkin foydalan.";
                    break;
                default:
                    $levelInstructions = "Talabaning darajasiga mos tushunarli tilda javob ber.";
            }

            // Xabarni bazaga saqlash
            ChatMessage::create([
                'user_id' => $user->id, 
                'role' => 'user', 
                'message' => $userMessage
            ]);

            // MAVZU QOIDASI
            $topicRule = "";
            switch($topic) {
                case 'Tanishtiruv':
                    $topicRule = "Mavzu: Tanishtiruv. Foydalanuvchi bilan yaqindan tanishishga harakat qil. Ismini oldin aytgan bo'lsa qayta so'rama, lekin uning yoshi, qayerdanligi, kasbi, hobbilari va qiziqishlari haqida so'rab, suhbatni chuqurlashtir.";
                    break;
                case 'Oila':
                    $topicRule = "Mavzu: Oila. Suhbatni faqat oila haqida olib bor. Oila a'zolari nechta, ota-onasi, aka-ukalari bormi, ularning kasbi nima kabi savollar ber.";
                    break;
                case 'Ish':
                    $topicRule = "Mavzu: Ish va O'qish. Foydalanuvchining ishi yoki o'qishi, kasbi, ish joyidagi holati yoki kelajakdagi maqsadlari haqida gaplash.";
                    break;
                case 'Ko\'cha':
                    $topicRule = "Mavzu: Ko'cha. Ko'chada manzil so'rash, transportlar (avtobus, metro) va yo'nalishlarni tushuntirish bilan bog'liq vaziyatli suhbat qur.";
                    break;
                default: // Erkin
                    $topicRule = "Foydalanuvchi 'Erkin mavzu' ni tanlagan. Hech qanday qoliplarsiz, u nimani xohlasa shu haqida tabiiy, qiziqarli suhbat qur.";
            }
                
            // ==========================================
            // SYSTEM PROMPT — YAPONCHA JAVOB + O'ZBEKCHA XAQORAT
            // ==========================================
            $systemPrompt = "You are Aiko, an AI Japanese conversation partner on MinnaUz, a speaking-practice platform built for Uzbek-speaking learners of Japanese.

## Your two language roles (never mix these)
1. JAPANESE — the target language. All conversational turns, questions, and roleplay dialogue happen in natural, level-appropriate Japanese.
2. UZBEK — the coaching language. All corrections, encouragement, grammar explanations, and meta-comments happen in natural, warm Uzbek.
Never explain Japanese grammar in Japanese. Never make small talk in Uzbek.

## Learner level
The learner's current level is {$level}. {$levelInstructions}

## Conversation behavior
- Keep Japanese turns short (1-3 sentences) — this is spoken practice, not a lecture.
- Ask natural follow-up questions, like a curious conversation partner.
- Match vocabulary/grammar complexity to the learner's level.
- If the learner is clearly lost, simplify your Japanese.
- Correct at most 1-2 errors per turn — the ones that most affect meaning or fit the learner's level. Don't overwhelm.
- Tone: patient, warm, encouraging — never clinical or exam-like here.
- Topic Rule: {$topicRule}
- Remember previous context of the conversation. Do not repeat introductions if the user already introduced themselves.

## Output format
Respond with valid JSON only, nothing outside the object:
{
  \"japanese_reply\": \"your next line of dialogue in Japanese\",
  \"japanese_reply_romaji\": \"romaji transliteration, for lower levels\",
  \"feedback_uz\": \"1-3 warm sentences in Uzbek: what went well, what to notice\",
  \"corrections\": [
    {\"learner_said\": \"...\", \"better_form\": \"...\", \"why_uz\": \"short explanation in Uzbek\"}
  ]
}
If there is nothing to correct, return an empty corrections array — don't invent issues just to fill the field.";


            // Xabarlar ro'yxatini yig'ish
            $messagesArray = [
                ["role" => "system", "content" => $systemPrompt]
            ];

            // Frontenddan kelgan tarixni qo'shish
            $hasCurrentMessage = false;
            if (is_array($history) && count($history) > 0) {
                foreach ($history as $msg) {
                    $msgText = $msg['content'] ?? $msg['text'] ?? null;
                    if (isset($msg['role']) && $msgText) {
                        $role = ($msg['role'] === 'ai' || $msg['role'] === 'assistant') ? 'assistant' : 'user';
                        $messagesArray[] = ["role" => $role, "content" => $msgText];
                        if ($msgText === $userMessage) {
                            $hasCurrentMessage = true;
                        }
                    }
                }
            }

            // Agar history'da xabar bo'lmasa, qo'lda qo'shamiz
            if (!$hasCurrentMessage && !empty($userMessage)) {
                $messagesArray[] = ["role" => "user", "content" => $userMessage];
            }

            $groqApiKey = env('GROQ_API_KEY'); 
            
            if (!$groqApiKey) {
                 Log::error("Groq API kaliti topilmadi.");
                 return response()->json(['reply' => "Server sozlamalarida xatolik."], 500);
            }
            
            // Groq API ga yuborish
            $response = Http::withoutVerifying()
                ->withToken($groqApiKey)
                ->post("https://api.groq.com/openai/v1/chat/completions", [
                    "model" => "llama-3.3-70b-versatile",
                    "messages" => $messagesArray,
                    "temperature" => 0.6,
                    "response_format" => [ "type" => "json_object" ]
                ]);

            if ($response->successful()) {
                $rawReply = $response->json()['choices'][0]['message']['content'];
                
                $reply = "";
                $feedbackUz = "";
                $correctionsArray = [];
                $correctionTextForAudio = "";

                // JSON parse qilishga urinish
                $jsonData = json_decode($rawReply, true);
                if ($jsonData) {
                    $reply = $jsonData['japanese_reply'] ?? ($jsonData['reply'] ?? '');
                    $feedbackUz = $jsonData['feedback_uz'] ?? '';
                    $correctionsArray = $jsonData['corrections'] ?? [];
                    
                    if (!empty($feedbackUz) || !empty($correctionsArray)) {
                        $correctionTextForAudio = $feedbackUz;
                        if (!empty($correctionsArray) && is_array($correctionsArray)) {
                            foreach ($correctionsArray as $corr) {
                                $learnerSaid = $corr['learner_said'] ?? '';
                                $betterForm = $corr['better_form'] ?? '';
                                $whyUz = $corr['why_uz'] ?? '';
                                if ($learnerSaid || $betterForm) {
                                    $correctionTextForAudio .= ". Siz " . $learnerSaid . " dedingiz, lekin " . $betterForm . " bo'lishi kerak. Sababi: " . $whyUz;
                                }
                            }
                        }
                    }
                }

                // Bazaga saqlash
                ChatMessage::create([
                    'user_id' => $user->id, 
                    'role' => 'assistant',
                    'message' => $reply
                ]);

                // Matndagi ortiqcha belgilarni tozalash (audio uchun)
                $cleanReply = preg_replace('/[*#_()（）「」『』【】]/u', '', $reply);
                $audioBase64 = null;
                $correctionAudioBase64 = null;

                // 1. YAPONCHA JAVOB UCHUN AUDIO (faqat reply bo'sh bo'lmaganda)
                if (!empty(trim($cleanReply))) {
                    $textToSpeech = urlencode(mb_substr($cleanReply, 0, 180));
                    $tts = Http::withoutVerifying()->get("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q={$textToSpeech}&tl=ja");
                    
                    if ($tts->successful()) {
                        $audioBase64 = base64_encode($tts->body());
                    }
                }

                // 2. O'ZBEKCHA CORRECTION UCHUN AUDIO (Microsoft Edge TTS — sifatli!)
                if ($correctionTextForAudio) {
                    $cleanCorrection = preg_replace('/[❌✅🔴🟢]/u', '', $correctionTextForAudio);
                    $cleanCorrection = trim($cleanCorrection);
                    
                    if (!empty($cleanCorrection)) {
                        // Vaqtinchalik fayl yaratish
                        $tempFile = storage_path('app/tts_' . uniqid() . '.mp3');
                        
                        // Edge TTS orqali audio generatsiya (uz-UZ-SardorNeural — erkak ovoz, yoki qiz bola ovozi uchun MadinaNeural ishlatish mumkin. Aiko nomi qiz bola, keling MadinaNeural qilamiz)
                        $escapedText = str_replace('"', '\\"', $cleanCorrection);
                        $command = 'edge-tts --voice uz-UZ-MadinaNeural --text "' . $escapedText . '" --write-media "' . $tempFile . '" 2>&1';
                        
                        exec($command, $output, $returnCode);
                        
                        if ($returnCode === 0 && file_exists($tempFile)) {
                            $correctionAudioBase64 = base64_encode(file_get_contents($tempFile));
                            unlink($tempFile); // Vaqtinchalik faylni o'chirish
                        } else {
                            Log::warning("Edge TTS xatosi: " . implode("\n", $output));
                        }
                    }
                }

                return response()->json([
                    'reply' => $reply, 
                    'audio' => $audioBase64,
                    'feedback' => $feedbackUz,
                    'corrections' => $correctionsArray,
                    'correction' => $correctionTextForAudio, // For legacy frontend compatibility if needed
                    'correction_audio' => $correctionAudioBase64,
                ]);
            }
            
            Log::error("Groq API xatosi: " . $response->body());
            return response()->json(['reply' => "AI xizmati xatolik qaytardi. Iltimos qayta urinib ko'ring."], 500);
            
        } catch (\Exception $e) {
            Log::error("AiController Xatosi: " . $e->getMessage() . " Line: " . $e->getLine());
            return response()->json(['reply' => "Server xatosi yuz berdi."], 500);
        }
    }
}