"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { BookOpen, Package, Languages, ArrowRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import JlptLevelsSkeleton from "./jlpt-skleton"
import { userAPI } from "@/lib/api/user"
import { toast } from "sonner"

export default function JlptLevels() {
  const [levelsData, setLevelsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const t = useTranslations("JlptLevels")

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await userAPI.getLevels()
        setLevelsData(res.data)
      } catch (error) {
        console.error("Darajalarni yuklashda xatolik:", error)
        toast.error("Darajalarni yuklab bo'lmadi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLevels()
  }, [])

  // Ba'zi darajalarning rasm nomini to'g'rilash (masalan, API dan kelmagan bo'lsa)
  const getImageName = (slug: string) => {
    if (slug === 'hira-kata') return 'N.png'
    return `${slug.toUpperCase()}.png`
  }

  if (isLoading) {
    return <JlptLevelsSkeleton />
  }

  return (
    <div className="mb-10 w-full p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {levelsData.map((level) => {
          // Bitta statik fallback, API dan rasmlar ulanmaganligi sababli
          const imageSrc = getImageName(level.slug)
          let imageModule = null
          try {
            imageModule = require(`./images/${imageSrc}`)
          } catch (e) {
            imageModule = require(`./images/N.png`) // fallback
          }

          return (
            <Card
              key={level.id}
              onClick={() => router.push(`/dashboard/level/${level.slug}`)}
              className="mx-auto w-full cursor-pointer overflow-hidden rounded-[24px] border border-slate-100 bg-white pt-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
            >
              <Image
                src={imageModule}
                alt={`${typeof level.title === 'string' ? level.title : (level.title as any)?.uz || "Nomsiz"} cover`}
                width={600}
                height={300}
                className="aspect-video w-full object-cover object-top"
              />

              <CardContent className="flex flex-grow flex-col p-5">
                <h3 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">
                  {typeof level.title === 'string' ? level.title : (level.title as any)?.uz || "Nomsiz"}
                </h3>

                <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                    <span>0 {t("grammar")}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-purple-400" />
                    <span>0 {t("vocab")}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-green-400" />
                    <span>0 {t("kanji")}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    Batafsil ko'rish
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
          )
        })}
      </div>
    </div>
  )
}
