"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { BookOpen, Package, Languages, ArrowRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import JlptLevelsSkeleton from "./jlpt-skleton"

const levelsData = [
  {
    id: "hira-kata",
    title: "Hiragana/Katakana",
    image: "N.png",
    grammar: 0,
    vocab: 0,
    kanji: 0,
  },
  {
    id: "n5",
    title: "N5",
    image: "N5.png",
    grammar: 90,
    vocab: 610,
    kanji: 102,
  },
  { id: "n4", title: "N4", image: "N4.png", grammar: 0, vocab: 0, kanji: 0 },
  { id: "n3", title: "N3", image: "N3.png", grammar: 0, vocab: 0, kanji: 0 },
  { id: "n2", title: "N2", image: "N2.png", grammar: 0, vocab: 0, kanji: 0 },
  { id: "n1", title: "N1", image: "N1.png", grammar: 0, vocab: 0, kanji: 0 },
]

export default function JlptLevels() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const t = useTranslations("JlptLevels")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <JlptLevelsSkeleton />
  }

  return (
    <div className="mb-10 w-full p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {levelsData.map((level) => (
          <Card
            key={level.id}
            onClick={() => router.push(`/dashboard/level/${level.id}`)}
            // DIQQAT: Card foni Dark rejimda `dark:bg-slate-900/80` ga o'zgartirildi
            // va dark:border rangi ham shu tizimga mos ravishda to'q kulrang qilindi
            className="mx-auto w-full cursor-pointer overflow-hidden rounded-[24px] border border-slate-100 bg-white pt-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
          >
            <Image
              src={require(`./images/${level.image}`)}
              alt={`${level.title} cover`}
              width={600}
              height={300}
              className="aspect-video w-full object-cover object-top"
            />

            <CardContent className="flex flex-grow flex-col p-5">
              <h3 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">
                {level.title}
              </h3>

              <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>{level.grammar} {t("grammar")}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-purple-400" />
                  <span>{level.vocab} {t("vocab")}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-green-400" />
                  <span>{level.kanji} {t("kanji")}</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Batafsil ko&apos;rish
                </span>

                <Button
                  size="icon"
                  className="rounded-full bg-blue-500 text-white shadow-sm shadow-blue-200 hover:bg-blue-600 dark:shadow-none"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
