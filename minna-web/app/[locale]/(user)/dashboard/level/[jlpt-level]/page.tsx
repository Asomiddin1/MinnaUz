import BackButton from "@/components/back-button"
import { 
  PlayCircle, 
  Code2, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Languages,
  BookMarked,
  Layers,
  FileText,
  Type,
  Play
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import { userAPI } from "@/lib/api/user"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    "jlpt-level": string;
    locale: string;
  }>
}

interface Lesson {
  id: number;
  title: any;
  duration?: string;
  order: number;
}

interface Module {
  id: number;
  title: any;
  order: number;
  lessons: Lesson[];
}

interface LevelData {
  title: any;
  slug: string;
  tags: string[];
  modules?: Module[];
}

const getTranslated = (field: any, lang: string) => {
  if (typeof field === "string") return field;
  return field?.[lang] || field?.["uz"] || "";
}

const JlptLevelsPage = async ({ params }: PageProps) => {
  const resolvedParams = await params
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase()
  const locale = resolvedParams.locale || "uz"
  const isHiraKata = levelSlug === "hira-kata"
  
  let levelData: LevelData | null = null;
  try {
    const res = await userAPI.getLevelBySlug(levelSlug);
    levelData = res.data;
  } catch (error) {
    console.error("Darajani yuklashda xatolik:", error);
    notFound(); 
  }

  if (!levelData) return null;

  // Barcha darajalar uchun materiallar
  const allMaterials = [
    {
      id: 1,
      title: "Barcha Grammatikalar",
      description: "Daraja uchun to'liq grammatika qoidalari",
      route: "grammar",
      icon: <Languages className="h-5 w-5" />
    },
    {
      id: 2,
      title: "Lug'at bazasi",
      description: "Barcha yangi so'zlar va ularning tarjimalari",
      route: "vocabulary",
      icon: <BookMarked className="h-5 w-5" />
    },
    {
      id: 3,
      title: "Kanji",
      description: "Iyerogliflar, chizilish tartibi va o'qilishlari",
      route: "kanji",
      icon: <Layers className="h-5 w-5" />
    },
    {
      id: 4,
      title: "PDF Materiallar",
      description: "Yuklab olish uchun qo'llanma va kitoblar",
      route: "materials",
      icon: <FileText className="h-5 w-5" />
    }
  ];

  // hira-kata uchun maxsus materiallar
  const hiraKataMaterials = [
    {
      id: 1,
      title: "Alifbo",
      description: "Hiragana va Katakana alifbolarini o'rganish",
      route: "alphabet",
      icon: <Type className="h-5 w-5" />
    }
  ];

  // Qaysi materiallarni ko'rsatish
  const materials = isHiraKata ? hiraKataMaterials : allMaterials;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <BackButton />

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          
          {/* CHAP TOMON */}
          <div className="flex-1">
            <div className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-[#0F172A] shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl font-bold text-sky-500/20 uppercase tracking-widest text-center">
                  {levelData.slug === "hira-kata" ? "HIRA-KATA" : getTranslated(levelData.title, locale)}
                </div>
              </div>
            </div>

            {/* DARAJA UCHUN MATERIALLAR */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isHiraKata ? "Alifbo" : "Daraja uchun materiallar"}
                </h2>
                <span className="rounded-full bg-slate-200/50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {materials.length} ta bo'lim
                </span>
              </div>
              
              <div className={`grid gap-4 ${isHiraKata ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                {materials.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/dashboard/level/${levelSlug}/${item.route}`} 
                    className="group"
                  >
                    <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-50 dark:bg-slate-900 dark:border-slate-800 transition-all hover:border-blue-500 hover:shadow-xl active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                           {item.icon}
                         </div>
                         <div>
                           <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors block">
                             {item.title}
                           </span>
                           <span className="text-[11px] text-slate-400">
                             {item.description}
                           </span>
                         </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* O'QUV DASTURI (CURRICULUM) */}
            <div className="mt-12 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Kurs o'quv dasturi
                </h2>
                <span className="rounded-full bg-slate-200/50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {levelData.modules?.length || 0} ta bo'lim
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-2">
                {levelData.modules && levelData.modules.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {levelData.modules.sort((a, b) => a.order - b.order).map((mod) => (
                      <AccordionItem key={mod.id} value={`mod-${mod.id}`} className="border-b-0 mb-2">
                        <AccordionTrigger className="hover:no-underline bg-slate-50 dark:bg-slate-800/50 rounded-3xl px-6 py-5 border border-slate-100 dark:border-slate-700/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 transition-all">
                          <div className="flex items-center gap-4 text-left">
                            <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold px-3 py-1.5 rounded-xl text-sm">
                              Bo'lim {mod.order}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                              {getTranslated(mod.title, locale)}
                            </span>
                            <span className="text-sm text-slate-400 font-normal ml-auto hidden sm:block">
                              {mod.lessons?.length || 0} ta dars
                            </span>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="pt-0">
                          <div className="border border-t-0 border-slate-100 dark:border-slate-700/50 rounded-b-3xl bg-white dark:bg-slate-900/50 p-2">
                            <div className="space-y-1">
                              {mod.lessons && mod.lessons.length > 0 ? (
                                mod.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                                  <Link key={lesson.id} href={`/dashboard/level/${levelSlug}/watch`}>
                                    <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                          <Play className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 fill-current" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                                            {lesson.order}. {getTranslated(lesson.title, locale)}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {lesson.duration && (
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                          {lesson.duration}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                ))
                              ) : (
                                <div className="text-center py-6 text-sm text-slate-500">
                                  Hozircha darslar kiritilmagan
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    O'quv dasturi tez orada qo'shiladi
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-[380px]">
            <div className="sticky top-6 rounded-[32px] bg-white p-8 shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isHiraKata ? "Alifbo video darslari" : "Daraja uchun video darslar"}
                </h1>
              </div>
              <Link href={`/dashboard/level/${levelSlug}/watch`} className="block">
                <button className="mt-6 md:mt-8 w-full rounded-2xl bg-[#0047FF] py-3 md:py-4 font-bold text-white shadow-lg shadow-blue-200 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Video darslarni ko'rish→
                </button>
              </Link>

              <div className="mt-10 space-y-5 border-t pt-8">
                <p className="flex items-center gap-3 text-[15px] font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {isHiraKata ? "Alifbo kursi nimalarni o'z ichiga oladi:" : "Kurs nimalarni o'z ichiga oladi:"}
                </p>
                
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-3 text-sm">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    <span>Video darslar va tushuntirishlar</span>
                  </div>
                  {isHiraKata ? (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <Type className="h-5 w-5 text-blue-600" />
                        <span>Hiragana va Katakana alifbosi</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <BookMarked className="h-5 w-5 text-blue-600" />
                        <span>Yozish mashqlari</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <BookMarked className="h-5 w-5 text-blue-600" />
                        <span>Dinamik lug'at bazasi</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Layers className="h-5 w-5 text-blue-600" />
                        <span>Kanji chizish mashqlari</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Code2 className="h-5 w-5 text-blue-600" />
                        <span>Barcha PDF materiallar</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Cheksiz umrbod ruxsat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default JlptLevelsPage