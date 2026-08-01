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
import { Edit, RefreshCcw, BookOpen, Plus, Trash2, Filter } from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPES
// =====================
type Level = {
  id: number
  title: string
  slug: string
}

type Module = {
  id: number
  level_id: number
  title: string
  order: number
  level?: Level // Eager loading orqali keladigan level obyekti
  lessons_count?: number
}

const ModulesPage = () => {
  const { status } = useSession()
  const [modules, setModules] = useState<Module[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  
  const [loading, setLoading] = useState(true)
  const [filterLevelId, setFilterLevelId] = useState<string>("all")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    level_id: "",
    title: "",
    order: 0,
  })

  // =====================
  // FETCH LEVELS (Dropdown uchun)
  // =====================
  const fetchLevels = useCallback(async () => {
    try {
      const res = await adminAPI.getLevels()
      const data = Array.isArray(res.data) ? res.data : res.data?.data || []
      setLevels(data)
    } catch (error) {
      console.error("Darajalarni yuklashda xatolik:", error)
    }
  }, [])

  // =====================
  // FETCH MODULES
  // =====================
  const fetchModules = useCallback(async (levelId?: string) => {
    try {
      setLoading(true)
      const parsedLevelId = levelId !== "all" && levelId ? Number(levelId) : undefined
      const response = await adminAPI.getModules(parsedLevelId)

      if (Array.isArray(response.data)) {
        setModules(response.data)
      } else if (response.data && response.data.data) {
        setModules(response.data.data)
      } else {
        setModules([])
      }
    } catch (error) {
      console.error("API xatosi:", error)
      toast.error("Modullarni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      fetchLevels()
      fetchModules(filterLevelId)
    }
  }, [status, fetchLevels, fetchModules, filterLevelId])

  // =====================
  // MODAL ACTIONS
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ level_id: filterLevelId !== "all" ? filterLevelId : "", title: "", order: 0 })
    setIsModalOpen(true)
  }

  const openEditModal = (mod: Module) => {
    setEditingId(mod.id)
    setFormData({
      level_id: String(mod.level_id),
      title: typeof mod.title === 'string' ? mod.title : (mod.title as any)?.uz || "",
      order: mod.order || 0,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.level_id) {
        toast.error("Iltimos, darajani tanlang va sarlavha kiriting")
        return
      }

      const payload = {
        title: formData.title,
        level_id: Number(formData.level_id),
        order: Number(formData.order),
      }

      if (editingId) {
        await adminAPI.updateModule(editingId, payload)
        toast.success("Modul muvaffaqiyatli yangilandi")
      } else {
        await adminAPI.createModule(payload)
        toast.success("Yangi modul qo'shildi")
      }

      setIsModalOpen(false)
      fetchModules(filterLevelId)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu modulni o'chirmoqchimisiz?")) return
    try {
      await adminAPI.deleteModule(id)
      toast.success("Modul o'chirildi")
      fetchModules(filterLevelId)
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
              <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-8" /></TableCell>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            Bo'limlar (Modules)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Darajalar ichidagi o'quv bo'limlarini (masalan, Grammatika) boshqarish.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">
            Jami: {modules.length}
          </Badge>
          <Button variant="outline" size="icon" onClick={() => fetchModules(filterLevelId)}>
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
          value={filterLevelId} 
          onValueChange={(val) => setFilterLevelId(val)}
        >
          <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900">
            <SelectValue placeholder="Barcha darajalar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha darajalar</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={String(level.id)}>
                {typeof level.title === 'string' ? level.title : (level.title as any)?.uz || "Nomsiz"}
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
                <TableHead>Daraja (Level)</TableHead>
                <TableHead className="text-center">Tartib</TableHead>
                <TableHead className="text-center">Darslar</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.length > 0 ? (
                modules.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell className="text-slate-500 font-medium">#{mod.id}</TableCell>
                    <TableCell className="font-semibold">
                      {typeof mod.title === 'string' ? mod.title : (mod.title as any)?.uz || "Nomsiz"}
                    </TableCell>
                    <TableCell>
                      {mod.level ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                          {mod.level.title}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Topilmadi</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-slate-500">
                      {mod.order}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-500 font-medium">{mod.lessons_count || 0} ta</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(mod)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(mod.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Hozircha bo'limlar topilmadi.
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
            <DialogTitle>{editingId ? "Modulni tahrirlash" : "Yangi modul qo'shish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Qaysi daraja uchun? <span className="text-red-500">*</span></label>
              <Select 
                value={formData.level_id} 
                onValueChange={(val) => setFormData({ ...formData, level_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Darajani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={String(level.id)}>
                      {typeof level.title === 'string' ? level.title : (level.title as any)?.uz || "Nomsiz"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bo'lim sarlavhasi <span className="text-red-500">*</span></label>
              <Input
                placeholder="Masalan: N5 Grammatika asoslari"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ketma-ketlik tartibi (Order)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">Kichik raqamli modullar ro'yxatda birinchi chiqadi.</p>
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

export default ModulesPage