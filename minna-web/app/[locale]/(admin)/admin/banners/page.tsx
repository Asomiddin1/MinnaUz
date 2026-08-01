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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, RefreshCcw, Image as ImageIcon, Plus, Trash2, Link2, Upload } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"

// =====================
// TYPE
// =====================
type Banner = {
  id: number
  title: string | null
  description: string | null
  image: string
  is_active: boolean
  created_at: string
}

const BannersPage = () => {
  const { status } = useSession()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [uploadType, setUploadType] = useState<"url" | "file">("url")

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    image_url: string;
    image_file: File | null;
    is_active: boolean;
  }>({
    title: "",
    description: "",
    image_url: "",
    image_file: null,
    is_active: true,
  })

  // =====================
  // FETCH BANNERS
  // =====================
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getBanners()

      if (Array.isArray(response.data)) {
        setBanners(response.data)
      } else if (response.data && response.data.data) {
        setBanners(response.data.data)
      } else {
        setBanners([])
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
      fetchBanners()
    }
  }, [status, fetchBanners])

  // =====================
  // CREATE & UPDATE
  // =====================
  const openCreateModal = () => {
    setEditingId(null)
    setUploadType("url")
    setFormData({ title: "", description: "", image_url: "", image_file: null, is_active: true })
    setIsModalOpen(true)
  }

  const openEditModal = (banner: Banner) => {
    setEditingId(banner.id)
    setUploadType("url")
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      image_url: banner.image,
      image_file: null,
      is_active: banner.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (uploadType === "url" && !formData.image_url) {
        toast.error("Rasm havolasini kiriting")
        return
      }
      if (uploadType === "file" && !formData.image_file && !editingId) {
        toast.error("Rasmni yuklang")
        return
      }

      const payload = new FormData();
      payload.append('title', formData.title || "");
      payload.append('description', formData.description || "");
      payload.append('is_active', formData.is_active ? '1' : '0');

      if (uploadType === "file" && formData.image_file) {
        payload.append('image_file', formData.image_file);
      } else if (uploadType === "url" && formData.image_url) {
        payload.append('image_url', formData.image_url);
      }

      if (editingId) {
        await adminAPI.updateBanner(editingId, payload);
        toast.success("Banner muvaffaqiyatli yangilandi")
      } else {
        await adminAPI.createBanner(payload)
        toast.success("Yangi banner qo'shildi")
      }

      setIsModalOpen(false)
      fetchBanners()
    } catch (error: any) {
      console.error("Full Error Object:", error)
      console.error("Error Response:", error.response)

      const errorMsg = error.response?.data?.message || error.message || "Noma'lum xatolik yuz berdi"
      toast.error(`Error: ${errorMsg}`)

      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => {
          toast.error(err[0])
        })
      }
    }
  }

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham bu bannerni o'chirmoqchimisiz?")) return

    try {
      await adminAPI.deleteBanner(id)
      toast.success("Banner o'chirildi")
      fetchBanners()
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
          {[1, 2, 3].map((i) => (
            <TableRow key={i} className="border-b">
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-16 w-32 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
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
            <ImageIcon className="h-6 w-6 text-blue-500" />
            Bannerlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboard sahifasidagi bannerlarni boshqarish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">
            Jami: {banners.length}
          </Badge>
          <Button type="button" variant="outline" size="icon" onClick={fetchBanners}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button type="button" onClick={openCreateModal} className="gap-2">
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
                <TableHead>Rasm</TableHead>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Holati</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length > 0 ? (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="text-slate-500 font-medium">#{banner.id}</TableCell>
                    <TableCell>
                      <img src={banner.image} alt={banner.title || "Banner"} className="h-16 w-32 object-cover rounded-md" />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {banner.title || "-"}
                    </TableCell>
                    <TableCell>
                      {banner.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Faol</Badge>
                      ) : (
                        <Badge variant="secondary">Faol emas</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => openEditModal(banner)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => handleDelete(banner.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    Hozircha bannerlar qo'shilmagan.
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
            <DialogTitle>{editingId ? "Bannerni tahrirlash" : "Yangi banner yaratish"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">

            {/* URL / Fayl toggle — segmented control */}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <Button
                type="button"
                variant={uploadType === "url" ? "default" : "ghost"}
                onClick={() => setUploadType("url")}
                className="w-full gap-2 shadow-none"
              >
                <Link2 className="h-4 w-4" />
                URL Havola
              </Button>
              <Button
                type="button"
                variant={uploadType === "file" ? "default" : "ghost"}
                onClick={() => setUploadType("file")}
                className="w-full gap-2 shadow-none"
              >
                <Upload className="h-4 w-4" />
                Fayl Yuklash
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {uploadType === "url" ? "Rasm havolasi (URL)" : "Rasm yuklash"} <span className="text-red-500">*</span>
              </label>

              {uploadType === "url" ? (
                <Input
                  key="url-image-input"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              ) : (
                <Input
                  key="file-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, image_file: e.target.files[0] })
                    }
                  }}
                />
              )}

              {uploadType === "url" && formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2" />
              )}
              {uploadType === "file" && formData.image_file && (
                <img src={URL.createObjectURL(formData.image_file)} alt="Preview" className="w-full h-32 object-cover rounded-md mt-2" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sarlavha</label>
              <Input
                placeholder="Banner sarlavhasi"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Matn (Batafsil)</label>
              <Textarea
                placeholder="Banner batafsil ma'lumoti"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm font-medium">
                Faol qilish
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingId ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BannersPage