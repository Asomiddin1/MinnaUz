"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Languages, Copy, Check, Sparkles, ArrowRightLeft, Volume2, Trash2 } from "lucide-react"

const TranslatorPage = () => {
  const [inputText, setInputText] = React.useState("")
  const [outputText, setOutputText] = React.useState("")
  const [transliteration, setTransliteration] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [isTranslating, setIsTranslating] = React.useState(false)

  const [sourceLang, setSourceLang] = React.useState("uz")
  const [targetLang, setTargetLang] = React.useState("ja")

  const handleSwapLangs = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setInputText(outputText)
    setOutputText(inputText)
    setTransliteration("")
  }

  // Real va kuchli API orqali tarjima va o'qilishini (romaji) olish
  const handleTranslate = async (text: string, sLang = sourceLang, tLang = targetLang) => {
    setInputText(text)
    if (!text.trim()) {
      setOutputText("")
      setTransliteration("")
      return
    }

    setIsTranslating(true)

    try {
      // 1. Asosiy tarjimani olish (MyMemory API)
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sLang}|${tLang}`
      const response = await fetch(url)
      const data = await response.json()

      if (data && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText
        setOutputText(translated)

        // 2. Agar yapon tiliga tarjima qilinsa, uning lotincha o'qilishini (Romaji) avtomatik olish
        if (tLang === "ja") {
          const romajiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(translated)}&langpair=ja|en`
          const romajiRes = await fetch(romajiUrl)
          const romajiData = await romajiRes.json()
          
          if (romajiData && romajiData.responseData && romajiData.responseData.translatedText) {
            setTransliteration(romajiData.responseData.translatedText)
          } else {
            setTransliteration("O'qilishi topilmadi")
          }
        } else {
          setTransliteration("")
        }
      } else {
        setOutputText("Tarjima topilmadi.")
        setTransliteration("")
      }
    } catch (error) {
      console.error("Tarjima xatoligi:", error)
      setOutputText("Tarmoqda xatolik yuz berdi.")
      setTransliteration("")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = () => {
    if (!outputText) return
    const fullText = transliteration ? `${outputText} (${transliteration})` : outputText
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Sarlavha qismi */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Languages className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Yaponcha - O'zbekcha Translit va Tarjimon
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Matnlarni onlayn API orqali tezkor va to'g'ri tarjima qiling
            </p>
          </div>
        </div>
      </div>

      {/* Til tanlash paneli */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 w-full max-w-md">
        <select
          value={sourceLang}
          onChange={(e) => {
            setSourceLang(e.target.value)
            handleTranslate(inputText, e.target.value, targetLang)
          }}
          className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl outline-none cursor-pointer flex-1"
        >
          <option value="uz">🇺🇿 O'zbekcha</option>
          <option value="ja">🇯🇵 Yaponcha (日本語)</option>
          <option value="en">🇬🇧 Inglizcha</option>
        </select>

        <button
          onClick={handleSwapLangs}
          className="mx-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Tillarni almashtirish"
        >
          <ArrowRightLeft className="h-4 w-4" />
        </button>

        <select
          value={targetLang}
          onChange={(e) => {
            setTargetLang(e.target.value)
            handleTranslate(inputText, sourceLang, e.target.value)
          }}
          className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl outline-none cursor-pointer flex-1"
        >
          <option value="ja">🇯🇵 Yaponcha (日本語)</option>
          <option value="uz">🇺🇿 O'zbekcha</option>
          <option value="en">🇬🇧 Inglizcha</option>
        </select>
      </div>

      {/* Asosiy tarjimon oynasi (Bir qatorda mukammal moslashtirilgan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Kiritish oynasi */}
        <Card className="rounded-[24px] border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
              Kiritish ({sourceLang.toUpperCase()})
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {inputText.length} belgi
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => handleTranslate(e.target.value)}
            placeholder="Matn kiriting ..."
            className="w-full flex-1 resize-none bg-transparent pt-3 text-base sm:text-lg font-medium text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
            rows={6}
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setInputText("")
                setOutputText("")
                setTransliteration("")
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Tozalash
            </button>
            
          </div>
        </Card>

        {/* Natija oynasi */}
        <Card className="rounded-[24px] border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400">
              Natija ({targetLang.toUpperCase()})
            </span>
            {isTranslating && (
              <span className="text-xs font-semibold text-indigo-500 animate-pulse">
                Tarjima qilinmoqda...
              </span>
            )}
          </div>

          <div className="flex-1 py-3 flex flex-col justify-center">
            {outputText ? (
              <div className="space-y-2">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {outputText}
                </div>
              </div>
            ) : (
              <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500 italic font-medium">
                Natija va uning o'qilishi shu yerda ko'rsatiladi...
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition-all disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Nusxalandi!" : "Nusxalash"}
            </button>
          </div>
        </Card>

      </div>
    </div>
  )
}

export default TranslatorPage