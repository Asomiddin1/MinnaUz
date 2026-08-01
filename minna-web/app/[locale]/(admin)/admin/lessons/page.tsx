"use client"

import { useEffect, useState, useCallback } from "react"
import { adminAPI } from "@/lib/api/admin"
import { useSession } from "next-auth/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, RefreshCcw, PlayCircle, Plus, Trash2, Filter, Link as LinkIcon, Clock } from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================
type Level = {
  id: number
  title: string
}

type Module = {
  id: number
  title: string
  level?: Level
}

type Lesson = {
  id: number
  module_id: number
  title: string | any
  video_url: string
  content?: string | any
  duration?: string
  module?: Module
  translations?: {
    title: { [key: string]: string }
    content: { [key: string]: string }
  }
}

const LessonsPage = () => {
  const { status } = useSession()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [modules, setModules] = useState<Module[]>([])
  
  const [loading, setLoading] = useState(true)
  const [filterModuleId, setFilterModuleId] = useState<string>("all")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<{
    module_id: string
    title_uz: string
    title_ru: string
    title_en: string
    video_type: "youtube" | "server"
    video_url: string
    video_file: File | null
    duration: string
    content_uz: string
    content_ru: string
    content_en: string
  }>({
    module_id: "",
    title_uz: "",
    title_ru: "",
    title_en: "",
    video_type: "youtube",
    video_url: "",
    video_file: null,
    duration: "",
    content_uz: "",
    content_ru: "",
    content_en: "",
  })

  // =====================
  // FETCH MODULES (Dropdown uchun)
  // =====================
  const fetchModules = useCallback(async () => {
    try {
      const res = await adminAPI.getModules()
      const data = Array.isArray(res.data) ? res.data : res.data?.data || []
      setModules(data)
    } catch (error) {
      console.error("Modullarni yuklashda xatolik:", error)
    }
  }, [])

  // =====================
  // FETCH LESSONS
  // =====================
  const fetchLessons = useCallback(async (moduleId?: string) => {
    try {
      setLoading(true)
      const parsedModuleId = moduleId !== "all" && moduleId ? Number(moduleId) : undefined
      const response = await adminAPI.getLessons(parsedModuleId)

      if (Array.isArray(response.data)) {
        setLessons(response.data)
      } else if (response.data && response.data.data) {
        setLessons(response.data.data)
      } else {
        setLessons([])
      }
    } catch (error) {
      console.error("API xatosi:", error)
      toast.error("Darslarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      fetchModules()
      fetchLessons(filterModuleId)
    }
  }, [status, fetchModules, fetchLessons, filterModuleId])

  // =====================
  // MODAL ACTIONS
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ 
      module_id: filterModuleId !== "all" ? filterModuleId : "", 
      title_uz: "", 
      title_ru: "", 
      title_en: "", 
      video_type: "youtube",
      video_url: "",
      video_file: null,
      duration: "",
      content_uz: "",
      content_ru: "",
      content_en: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: Lesson) => {
    setEditingId(lesson.id)
    
    // Tarjimalarni olish (agar backenddan kelsa)
    const tTitle = lesson.translations?.title || {}
    const tContent = lesson.translations?.content || {}
    
    setFormData({
      module_id: String(lesson.module_id),
      title_uz: tTitle.uz || (typeof lesson.title === 'string' ? lesson.title : ""),
      title_ru: tTitle.ru || "",
      title_en: tTitle.en || "",
      video_type: lesson.video_url?.startsWith("/storage") ? "server" : "youtube",
      video_url: lesson.video_url?.startsWith("/storage") ? "" : lesson.video_url,
      video_file: null,
      duration: lesson.duration || "",
      content_uz: tContent.uz || (typeof lesson.content === 'string' ? lesson.content : ""),
      content_ru: tContent.ru || "",
      content_en: tContent.en || "",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title_uz || !formData.module_id) {
        toast.error("Modul va O'zbekcha sarlavha kiritilishi shart!")
        return
      }
      if (formData.video_type === 'youtube' && !formData.video_url) {
        toast.error("Youtube linki kiritilishi shart!")
        return
      }
      if (formData.video_type === 'server' && !formData.video_file && !editingId) {
        toast.error("Video fayl tanlanishi shart!")
        return
      }

      const payload = new FormData()
      payload.append("module_id", formData.module_id)
      payload.append("title[uz]", formData.title_uz)
      if (formData.title_ru) payload.append("title[ru]", formData.title_ru)
      if (formData.title_en) payload.append("title[en]", formData.title_en)
      
      payload.append("video_type", formData.video_type)
      if (formData.video_type === "youtube") {
        payload.append("video_url", formData.video_url)
      } else if (formData.video_type === "server" && formData.video_file) {
        payload.append("video_file", formData.video_file)
      }

      if (formData.duration) payload.append("duration", formData.duration)
      
      if (formData.content_uz) payload.append("content[uz]", formData.content_uz)
      if (formData.content_ru) payload.append("content[ru]", formData.content_ru)
      if (formData.content_en) payload.append("content[en]", formData.content_en)

      if (editingId) {
        await adminAPI.updateLesson(editingId, payload)
        toast.success("Video dars muvaffaqiyatli yangilandi")
      } else {
        await adminAPI.createLesson(payload)
        toast.success("Yangi video dars qo'shildi")
      }

      setIsModalOpen(false)
      fetchLessons(filterModuleId)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu darsni o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteLesson(id)
      toast.success("Dars o'chirildi")
      fetchLessons(filterModuleId)
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi")
    }
  }

  // =====================
  // SKELETON
  // =====================
  const renderSkeletons = () => (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-slate-900">
      <Table>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} className="border-b">
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-5 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-8 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-red-500" />
            Video Darslar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platformadagi barcha video darslar va materiallarni boshqarish.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">
            Jami: {lessons.length}
          </Badge>
          <Button variant="outline" size="icon" onClick={() => fetchLessons(filterModuleId)}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Filter className="h-4 w-4" /> Filtr:
        </div>
        <Select 
          value={filterModuleId} 
          onValueChange={(val) => setFilterModuleId(val)}
        >
          <SelectTrigger className="w-[300px] bg-white dark:bg-slate-900">
            <SelectValue placeholder="Barcha bo'limlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha bo'limlar</SelectItem>
            {modules.map((mod) => (
              <SelectItem key={mod.id} value={String(mod.id)}>
                {mod.level ? `${typeof mod.level.title === 'string' ? mod.level.title : (mod.level.title as any)?.uz || "Nomsiz"} - ` : ""}{typeof mod.title === 'string' ? mod.title : (mod.title as any)?.uz || "Nomsiz"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      {loading ? (
        renderSkeletons()
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Modul (Bo'lim)</TableHead>
                <TableHead>Video Link</TableHead>
                <TableHead className="text-center">Vaqt</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="text-slate-500 font-medium">#{lesson.id}</TableCell>
                    <TableCell className="font-semibold">
                      {typeof lesson.title === 'string' 
                        ? lesson.title 
                        : (lesson.title?.uz || Object.values(lesson.title || {})[0] || "Nomsiz")}
                    </TableCell>
                    <TableCell>
                      {lesson.module ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {typeof lesson.module.title === 'string' ? lesson.module.title : (lesson.module.title as any)?.uz || "Nomsiz"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {typeof lesson.module.level?.title === 'string' ? lesson.module.level.title : (lesson.module.level?.title as any)?.uz || "Nomsiz"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Topilmadi</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={lesson.video_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" /> Ko'rish
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      {lesson.duration ? (
                        <Badge variant="secondary" className="font-mono bg-slate-100 dark:bg-slate-800">
                          <Clock className="mr-1 h-3 w-3" /> {lesson.duration}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(lesson)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(lesson.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Hozircha darslar topilmadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Darsni tahrirlash" : "Yangi video dars qo'shish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Qaysi bo'limga? <span className="text-red-500">*</span></label>
              <Select 
                value={formData.module_id} 
                onValueChange={(val) => setFormData({ ...formData, module_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modulni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((mod) => (
                    <SelectItem key={mod.id} value={String(mod.id)}>
                      {mod.level ? `${typeof mod.level.title === 'string' ? mod.level.title : (mod.level.title as any)?.uz || "Nomsiz"} - ` : ""}{typeof mod.title === 'string' ? mod.title : (mod.title as any)?.uz || "Nomsiz"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha (O'zbekcha) <span className="text-red-500">*</span></label>
              <Input
                placeholder="Masalan: 1-dars: Fe'l negizlari"
                value={formData.title_uz}
                onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha (Ruscha) <span className="text-xs text-slate-400">(Ixtiyoriy)</span></label>
              <Input
                placeholder="Masalan: Урок 1: Основы глаголов"
                value={formData.title_ru}
                onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha (Inglizcha) <span className="text-xs text-slate-400">(Ixtiyoriy)</span></label>
              <Input
                placeholder="Masalan: Lesson 1: Verb Basics"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Video Yuklash Turi <span className="text-red-500">*</span></label>
              <Select 
                value={formData.video_type} 
                onValueChange={(val: "youtube" | "server") => setFormData({ ...formData, video_type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Turi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube (Link)</SelectItem>
                  <SelectItem value="server">Serverga Yuklash (Fayl)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.video_type === "youtube" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Video URL (Youtube, Vimeo) <span className="text-red-500">*</span></label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Video Fayl (MP4, Max: 500MB) {editingId && <span className="text-xs text-slate-400">(Faqat almashtirish uchun yuklang)</span>}</label>
                <Input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={(e) => setFormData({ ...formData, video_file: e.target.files?.[0] || null })}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Davomiyligi (Vaqti)</label>
              <Input
                placeholder="Masalan: 12:30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dars matni (O'zbekcha)</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Dars haqida qisqacha ma'lumot..."
                value={formData.content_uz}
                onChange={(e) => setFormData({ ...formData, content_uz: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dars matni (Ruscha)</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Краткая информация об уроке..."
                value={formData.content_ru}
                onChange={(e) => setFormData({ ...formData, content_ru: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dars matni (Inglizcha)</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Brief information about the lesson..."
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LessonsPage