"use client"

import { useEffect, useState, useCallback } from "react"
import { adminAPI } from "@/lib/api/admin" // O'zingizning API yo'lingizni tekshiring
import { useSession } from "next-auth/react"
import { Link } from "@/src/i18n/navigation"

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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, RefreshCcw, Layers, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPE
// =====================
type Level = {
  id: number
  title: any
  slug: string
  tags: string[]
  lesson_count: number
  video_count: string | null
  modules_count?: number
}

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

const LevelsPage = () => {
  const { status } = useSession() // Login holatini tekshirish
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title_uz: "",
    title_ru: "",
    title_en: "",
    slug: "",
    tags: "", // Vergul bilan yoziladi
  })

  // =====================
  // FETCH LEVELS
  // =====================
  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getLevels()

      // Ma'lumot to'g'ridan-to'g'ri massiv keladi deb hisoblaymiz
      if (Array.isArray(response.data)) {
        setLevels(response.data)
      } else if (response.data && response.data.data) {
        setLevels(response.data.data) // Agar paginate bo'lsa
      } else {
        setLevels([])
      }
    } catch (error) {
      console.error("API xatosi:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchLevels()
    }
  }, [status, fetchLevels])

  // =====================
  // CREATE & UPDATE
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ title_uz: "", title_ru: "", title_en: "", slug: "", tags: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (level: Level) => {
    setEditingId(level.id)
    setFormData({
      title_uz: getTranslated(level.title, "uz") !== "Nomsiz" ? getTranslated(level.title, "uz") : "",
      title_ru: getTranslated(level.title, "ru") !== "Nomsiz" ? getTranslated(level.title, "ru") : "",
      title_en: getTranslated(level.title, "en") !== "Nomsiz" ? getTranslated(level.title, "en") : "",
      slug: level.slug,
      tags: level.tags ? level.tags.join(", ") : "",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title_uz || !formData.slug) {
        toast.error("Barcha majburiy maydonlarni to'ldiring")
        return
      }

      // "N5, Grammatika" -> ["N5", "Grammatika"]
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const payload = { 
        title: {
          uz: formData.title_uz,
          ru: formData.title_ru,
          en: formData.title_en,
        },
        slug: formData.slug,
        tags: tagsArray 
      }

      if (editingId) {
        await adminAPI.updateLevel(editingId, payload)
        toast.success("Daraja muvaffaqiyatli yangilandi")
      } else {
        await adminAPI.createLevel(payload)
        toast.success("Yangi daraja qo'shildi")
      }

      setIsModalOpen(false)
      fetchLevels()
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu darajani o'chirmoqchimisiz? Ichidagi barcha darslar ham o'chadi!")) return
    
    try {
      await adminAPI.deleteLevel(id)
      toast.success("Daraja o'chirildi")
      fetchLevels()
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
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
              <TableCell className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </TableCell>
              <TableCell><Skeleton className="h-5 w-12" /></TableCell>
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-500" />
            Kurslar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tizimdagi barcha kurslarni boshqarish.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">
            Jami: {levels.length}
          </Badge>
          <Button variant="outline" size="icon" onClick={fetchLevels}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
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
                <TableHead>Slug (URL)</TableHead>
                <TableHead>Teglar</TableHead>
                <TableHead className="text-center">Modullar</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.length > 0 ? (
                levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="text-slate-500 font-medium">#{level.id}</TableCell>
                    <TableCell className="font-semibold">
                      {getTranslated(level.title, "uz")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs text-slate-500 bg-slate-50 dark:bg-slate-800">
                        /{level.slug}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {level.tags?.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-500 font-medium">{level.modules_count || 0} ta</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/levels/${level.id}`}>
                          <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                            Boshqarish
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(level)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(level.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Hozircha darajalar qo'shilmagan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Darajani tahrirlash" : "Yangi daraja yaratish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha (UZ) <span className="text-red-500">*</span></label>
              <Input
                placeholder="Masalan: JLPT N5"
                value={formData.title_uz}
                onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha (RU)</label>
              <Input
                placeholder="Например: JLPT N5"
                value={formData.title_ru}
                onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha (EN)</label>
              <Input
                placeholder="Example: JLPT N5"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (URL) <span className="text-red-500">*</span></label>
              <Input
                placeholder="n5, n4, hira-kata"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
              <p className="text-[10px] text-muted-foreground">Bo'sh joylar o'rniga chiziqcha qo'yiladi</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teglar (Vergul bilan)</label>
              <Input
                placeholder="N5, Grammatika, Bepul"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LevelsPage