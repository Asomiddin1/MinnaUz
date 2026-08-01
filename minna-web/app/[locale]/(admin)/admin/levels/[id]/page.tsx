"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { adminAPI } from "@/lib/api/admin"
import { useSession } from "next-auth/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, RefreshCcw, Plus, Trash2, ArrowLeft, Video, Link as LinkIcon, FileVideo, Globe } from "lucide-react"
import { toast } from "sonner"
import { getAvatarUrl } from "@/lib/api/user"


// =====================
// TYPES
// =====================
type Lesson = {
  id: number
  module_id: number
  title: any
  description?: string
  content?: any
  video_url: string
  video_type?: string
  duration?: string
  is_free?: boolean
  order: number
}

type Module = {
  id: number
  level_id: number
  title: any
  order: number
  lessons: Lesson[]
}

type Level = {
  id: number
  title: any
  slug: string
  modules: Module[]
}

const getEmbedUrl = (url: string) => {
  if (!url) return ""
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0`
  }
  return url
}

const formatError = (error: any): string => {
  if (!error) return "Xatolik yuz berdi"
  const data = error.response?.data
  if (!data) return error.message || "Xatolik yuz berdi"
  
  if (typeof data.message === 'string') return data.message
  if (data.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)[0]
    if (Array.isArray(firstError)) return firstError[0]
  }
  if (typeof data === 'object') {
    return JSON.stringify(data)
  }
  return "Noma'lum xatolik yuz berdi"
}

const CourseBuilderPage = () => {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession()
  const courseId = Number(params.id)

  const [course, setCourse] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)

  // =====================
  // STATE: MODULE MODAL
  // =====================
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null)
  const [moduleForm, setModuleForm] = useState({
    title_uz: "",
    title_ru: "",
    title_en: "",
    order: 0,
  })

  // =====================
  // STATE: LESSON MODAL
  // =====================
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState<number | null>(null)
  const [videoType, setVideoType] = useState<"youtube" | "server">("youtube")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [lessonForm, setLessonForm] = useState({
    title_uz: "",
    title_ru: "",
    title_en: "",
    content_uz: "",
    content_ru: "",
    content_en: "",
    video_url: "", // For youtube
    duration: "",
    is_free: false,
    order: 0,
  })

  // =====================
  // FETCH DATA
  // =====================
  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getLevelById(courseId)
      setCourse(res.data)
    } catch (error) {
      toast.error("Kurs ma'lumotlarini yuklashda xatolik yuz berdi")
      router.push("/admin/levels")
    } finally {
      setLoading(false)
    }
  }, [courseId, router])

  useEffect(() => {
    if (status === "authenticated" && courseId) {
      fetchCourse()
    }
  }, [status, fetchCourse, courseId])

  const getTranslated = (field: any, lang: string) => {
    if (!field) return "Nomsiz";
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return parsed[lang] || parsed["uz"] || Object.values(parsed)[0] || field;
      } catch (e) {
        return field;
      }
    }
    return field[lang] || field["uz"] || Object.values(field)[0] || "Nomsiz";
  }

  // =====================
  // MODULE ACTIONS
  // =====================
  const openModuleCreateModal = () => {
    setEditingModuleId(null)
    setModuleForm({ title_uz: "", title_ru: "", title_en: "", order: 0 })
    setIsModuleModalOpen(true)
  }

  const openModuleEditModal = (mod: Module) => {
    setEditingModuleId(mod.id)
    setModuleForm({
      title_uz: getTranslated(mod.title, "uz"),
      title_ru: getTranslated(mod.title, "ru"),
      title_en: getTranslated(mod.title, "en"),
      order: mod.order || 0,
    })
    setIsModuleModalOpen(true)
  }

  const handleModuleSubmit = async () => {
    try {
      if (!moduleForm.title_uz) {
        toast.error("O'zbek tilida sarlavha kiriting")
        return
      }

      const payload = {
        title: {
          uz: moduleForm.title_uz,
          ru: moduleForm.title_ru,
          en: moduleForm.title_en,
        },
        level_id: courseId,
        order: Number(moduleForm.order),
      }

      if (editingModuleId) {
        await adminAPI.updateModule(editingModuleId, payload)
        toast.success("Bo'lim yangilandi")
      } else {
        await adminAPI.createModule(payload)
        toast.success("Yangi bo'lim qo'shildi")
      }
      setIsModuleModalOpen(false)
      fetchCourse()
    } catch (error: any) {
      toast.error(formatError(error))
    }
  }

  const handleModuleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu bo'limni va uning ichidagi darslarni o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteModule(id)
      toast.success("Bo'lim o'chirildi")
      fetchCourse()
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi")
    }
  }

  // =====================
  // LESSON ACTIONS
  // =====================
  const openLessonCreateModal = (moduleId: number) => {
    setEditingLessonId(null)
    setActiveModuleIdForLesson(moduleId)
    setVideoType("youtube")
    setVideoFile(null)
    setLessonForm({
      title_uz: "", title_ru: "", title_en: "",
      content_uz: "", content_ru: "", content_en: "",
      video_url: "", duration: "", order: 0, is_free: false,
    })
    setIsLessonModalOpen(true)
  }

  const openLessonEditModal = (lesson: Lesson, moduleId: number) => {
    setEditingLessonId(lesson.id)
    setActiveModuleIdForLesson(moduleId)
    setVideoType(lesson.video_type === "server" ? "server" : "youtube")
    setVideoFile(null)
    setLessonForm({
      title_uz: getTranslated(lesson.title, "uz"),
      title_ru: getTranslated(lesson.title, "ru"),
      title_en: getTranslated(lesson.title, "en"),
      content_uz: getTranslated(lesson.content, "uz"),
      content_ru: getTranslated(lesson.content, "ru"),
      content_en: getTranslated(lesson.content, "en"),
      video_url: lesson.video_type === "server" ? "" : (lesson.video_url || ""),
      duration: lesson.duration || "",
      is_free: !!lesson.is_free,
      order: lesson.order || 0,
    })
    setIsLessonModalOpen(true)
  }

  const handleLessonSubmit = async () => {
    try {
      if (!lessonForm.title_uz) {
        toast.error("O'zbek tilida sarlavha kiriting")
        return
      }

      if (videoType === "youtube" && !lessonForm.video_url) {
        toast.error("YouTube URL manzilini kiriting")
        return
      }

      const formData = new FormData()
      formData.append("title[uz]", lessonForm.title_uz)
      formData.append("title[ru]", lessonForm.title_ru)
      formData.append("title[en]", lessonForm.title_en)

      formData.append("content[uz]", lessonForm.content_uz)
      formData.append("content[ru]", lessonForm.content_ru)
      formData.append("content[en]", lessonForm.content_en)

      formData.append("module_id", String(activeModuleIdForLesson))
      formData.append("order", String(lessonForm.order))
      formData.append("video_type", videoType)
      
      if (lessonForm.duration) {
        formData.append("duration", lessonForm.duration)
      }
      formData.append("is_free", lessonForm.is_free ? "1" : "0")

      if (videoType === "youtube") {
        formData.append("video_url", lessonForm.video_url)
      } else if (videoType === "server" && videoFile) {
        formData.append("video_file", videoFile)
      }

      if (editingLessonId) {
        await adminAPI.updateLesson(editingLessonId, formData)
        toast.success("Dars yangilandi")
      } else {
        await adminAPI.createLesson(formData)
        toast.success("Yangi dars qo'shildi")
      }

      setIsLessonModalOpen(false)
      fetchCourse()
    } catch (error: any) {
      toast.error(formatError(error))
    }
  }

  const handleLessonDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu darsni o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteLesson(id)
      toast.success("Dars o'chirildi")
      fetchCourse()
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi")
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!course) return <div className="p-8">Kurs topilmadi</div>

  const courseTitle = getTranslated(course.title, "uz")

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/levels")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {courseTitle} <span className="text-muted-foreground font-normal text-lg">({course.slug})</span>
            </h1>
            <p className="text-sm text-slate-500">
              Kurs ichidagi bo'limlar va darslarni boshqarish
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchCourse}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={openModuleCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Yangi Bo'lim
          </Button>
        </div>
      </div>

      {/* MODULES ACCORDION */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-2">
        {course.modules && course.modules.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {course.modules.sort((a, b) => a.order - b.order).map((mod) => (
              <AccordionItem key={mod.id} value={`mod-${mod.id}`} className="border-b-0 mb-2">
                <AccordionTrigger className="hover:no-underline bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-100 dark:border-slate-700/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 transition-all">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-md text-xs">
                      #{mod.order}
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {getTranslated(mod.title, "uz")}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({mod.lessons?.length || 0} ta dars)
                    </span>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-0">
                  <div className="border border-t-0 border-slate-100 dark:border-slate-700/50 rounded-b-lg bg-white dark:bg-slate-900/50 p-4">
                    
                    {/* MODULE ACTIONS */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-sm text-slate-500">Bo'lim sozlamalari:</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openModuleEditModal(mod)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> Tahrirlash
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleModuleDelete(mod.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> O'chirish
                        </Button>
                      </div>
                    </div>

                    {/* LESSONS LIST */}
                    <div className="space-y-3">
                      {mod.lessons && mod.lessons.length > 0 ? (
                        mod.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                          <div key={lesson.id} className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {lesson.order}. {getTranslated(lesson.title, "uz")}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {lesson.video_type === 'server' ? (
                                    <span className="text-[9px] px-1.5 py-0.5 h-4 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full flex items-center"><FileVideo className="h-2.5 w-2.5 mr-1"/> Server</span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.5 h-4 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center"><Globe className="h-2.5 w-2.5 mr-1"/> YouTube</span>
                                  )}
                                  {lesson.duration && (
                                    <span className="text-[10px] text-slate-400">{lesson.duration}</span>
                                  )}
                                  {lesson.is_free && (
                                    <span className="text-[9px] px-1.5 py-0.5 h-4 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center">Tekin</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openLessonEditModal(lesson, mod.id)}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleLessonDelete(lesson.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                          Bu bo'limda darslar yo'q
                        </div>
                      )}
                      
                      <Button variant="ghost" className="w-full mt-2 text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" onClick={() => openLessonCreateModal(mod.id)}>
                        <Plus className="h-4 w-4 mr-2" /> Yangi Dars Qo'shish
                      </Button>
                    </div>

                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Hozircha bu kursda bo'limlar yo'q
          </div>
        )}
      </div>

      {/* =======================
          MODULE MODAL
      ======================= */}
      <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModuleId ? "Bo'limni tahrirlash" : "Yangi bo'lim"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Tabs defaultValue="uz">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
                <TabsTrigger value="ru">Ruscha</TabsTrigger>
                <TabsTrigger value="en">Inglizcha</TabsTrigger>
              </TabsList>
              <TabsContent value="uz">
                <Label>Sarlavha (UZ) *</Label>
                <Input value={moduleForm.title_uz} onChange={(e) => setModuleForm({ ...moduleForm, title_uz: e.target.value })} placeholder="Masalan: 1-Dars" />
              </TabsContent>
              <TabsContent value="ru">
                <Label>Sarlavha (RU)</Label>
                <Input value={moduleForm.title_ru} onChange={(e) => setModuleForm({ ...moduleForm, title_ru: e.target.value })} />
              </TabsContent>
              <TabsContent value="en">
                <Label>Sarlavha (EN)</Label>
                <Input value={moduleForm.title_en} onChange={(e) => setModuleForm({ ...moduleForm, title_en: e.target.value })} />
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Tartib raqami</Label>
              <Input type="number" value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleModalOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleModuleSubmit}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =======================
          LESSON MODAL
      ======================= */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLessonId ? "Darsni tahrirlash" : "Yangi dars"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            
            {/* TABS FOR MULTI-LANGUAGE FIELDS */}
            <Tabs defaultValue="uz">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="uz">O'zbekcha</TabsTrigger>
                <TabsTrigger value="ru">Ruscha</TabsTrigger>
                <TabsTrigger value="en">Inglizcha</TabsTrigger>
              </TabsList>
              
              <TabsContent value="uz" className="space-y-4">
                <div className="space-y-2">
                  <Label>Dars sarlavhasi (UZ) *</Label>
                  <Input value={lessonForm.title_uz} onChange={(e) => setLessonForm({ ...lessonForm, title_uz: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Dars matni (UZ)</Label>
                  <Textarea rows={4} value={lessonForm.content_uz} onChange={(e) => setLessonForm({ ...lessonForm, content_uz: e.target.value })} />
                </div>
              </TabsContent>
              
              <TabsContent value="ru" className="space-y-4">
                <div className="space-y-2">
                  <Label>Dars sarlavhasi (RU)</Label>
                  <Input value={lessonForm.title_ru} onChange={(e) => setLessonForm({ ...lessonForm, title_ru: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Dars matni (RU)</Label>
                  <Textarea rows={4} value={lessonForm.content_ru} onChange={(e) => setLessonForm({ ...lessonForm, content_ru: e.target.value })} />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label>Dars sarlavhasi (EN)</Label>
                  <Input value={lessonForm.title_en} onChange={(e) => setLessonForm({ ...lessonForm, title_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Dars matni (EN)</Label>
                  <Textarea rows={4} value={lessonForm.content_en} onChange={(e) => setLessonForm({ ...lessonForm, content_en: e.target.value })} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Tartib raqami (Order)</Label>
                <Input type="number" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Davomiyligi (minut)</Label>
                <Input placeholder="masalan: 12:30" value={lessonForm.duration} onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="is-free" 
                checked={lessonForm.is_free} 
                onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_free: checked as boolean })}
              />
              <Label htmlFor="is-free" className="text-sm font-medium leading-none cursor-pointer">
                Tekin dars (Free trial)
              </Label>
            </div>

            {/* VIDEO TYPE SELECTION */}
            <div className="border-t pt-4">
              <Label className="mb-3 block">Video manbasi</Label>
              <Tabs value={videoType} onValueChange={(val) => setVideoType(val as "youtube" | "server")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="youtube" className="gap-2">
                    <Globe className="h-4 w-4" /> YouTube Link
                  </TabsTrigger>
                  <TabsTrigger value="server" className="gap-2">
                    <FileVideo className="h-4 w-4" /> Serverga Yuklash
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="youtube" className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={lessonForm.video_url} 
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} 
                  />
                  {lessonForm.video_url && (
                    <div className="mt-2 rounded-xl overflow-hidden aspect-video border bg-black">
                      <iframe 
                        src={getEmbedUrl(lessonForm.video_url)} 
                        className="w-full h-full border-0"
                      ></iframe>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="server" className="space-y-2">
                  <Label>Video Fayl Tanlash</Label>
                  <div className="flex flex-col gap-3 p-4 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900">
                    <Input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    />
                    {editingLessonId && !videoFile && lessonForm.video_url && (
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Video className="h-4 w-4"/> Hozirgi yuklangan video serverda saqlanmoqda.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonModalOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleLessonSubmit}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CourseBuilderPage
