"use client"

import { useEffect, useState, useCallback } from "react"
import { adminAPI } from "@/lib/api/admin"
import { userAPI, getAvatarUrl } from "@/lib/api/user"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Search, Crown, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

// =====================
// TYPE
// =====================
type User = {
  id: number
  name: string
  email: string
  role: string
  coins: number
  streak: number
  avatar?: string
  is_premium: boolean
}

const UsersPage = () => {
  const { status } = useSession() // Login holatini tekshirish
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    coins: 0,
    is_premium: false,
  })

  // =====================
  // FETCH USERS (Laravel Paginate moslashgan)
  // =====================
  const fetchUsers = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllUsers(page, search)

      // Agar ma'lumot response.data.data ichida bo'lsa (Laravel pagination)
      if (response.data && response.data.data) {
        setUsers(response.data.data)
        setTotalUsers(response.data.total ?? response.data.data.length ?? 0)
        setTotalPages(response.data.last_page ?? 1)
        setCurrentPage(response.data.current_page ?? 1)
      }
      // Agar ma'lumot to'g'ridan-to'g'ri massiv bo'lib kelsa
      else if (Array.isArray(response.data)) {
        setUsers(response.data)
        setTotalUsers(response.data.length)
        setTotalPages(1)
        setCurrentPage(1)
      } else {
        setUsers([])
        setTotalUsers(0)
      }
    } catch (error) {
      console.error("API xatosi:", error)
    } finally {
      setLoading(false)
    }
  }, [])
  // Faqat sessiya tayyor bo'lganda va qidiruv o'zgarganda ishlaydi
  useEffect(() => {
    if (status === "authenticated") {
      const delay = setTimeout(() => {
        fetchUsers(currentPage, searchQuery)
      }, 500)
      return () => clearTimeout(delay)
    }
  }, [searchQuery, currentPage, status, fetchUsers])

  // =====================
  // TOGGLE PREMIUM (API orqali)
  // =====================
  const handleTogglePremium = async (userId: number) => {
    try {
      const res = await adminAPI.togglePremium(userId)
      toast.success(res.data.message)

      // Local state-ni yangilash (modal ichida bo'lsa)
      setFormData((prev) => ({ ...prev, is_premium: !prev.is_premium }))

      // Ro'yxatni yangilash
      fetchUsers(currentPage, searchQuery)
    } catch (error) {
      toast.error("Statusni o'zgartirib bo'lmadi")
    }
  }

  // =====================
  // EDIT & UPDATE
  // =====================
  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins,
      is_premium: user.is_premium,
    })
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      await adminAPI.updateUser(editingUser.id, formData)
      toast.success("Foydalanuvchi yangilandi")
      setEditingUser(null)
      fetchUsers(currentPage, searchQuery)
    } catch {
      toast.error("Yangilashda xatolik yuz berdi")
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
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-muted-foreground">
            Platformadagi barcha foydalanuvchilarni boshqarish.
          </p>
        </div>
      <div className="flex items-center gap-2">
          <Badge
          variant="secondary"
          className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
        >
          Jami: {totalUsers}
        </Badge>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchUsers(currentPage, searchQuery)}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute top-2 left-3 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Ism yoki email orqali qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Koinlar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-slate-500">#{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={getAvatarUrl(user.avatar)} />
                          <AvatarFallback>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 font-medium">
                            {user.name}
                            {user.is_premium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </span>
                          <span className="text-xs text-slate-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>🪙 {user.coins}</TableCell>
                    <TableCell>
                      {user.is_premium ? (
                        <Badge className="border-none bg-yellow-500 hover:bg-yellow-600">
                          PREMIUM
                        </Badge>
                      ) : (
                        <Badge variant="outline">FREE</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-slate-500"
                  >
                    Foydalanuvchilar topilmadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Oldingi
          </Button>
          <span className="text-sm text-slate-500">
            Sahifa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Keyingi
          </Button>
        </div>
      )}

      {/* EDIT MODAL */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Tahrirlash</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">F.I.SH</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">Foydalanuvchi</option>
                <option value="admin">Admin</option>
                <option value="teacher">O'qituvchi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Koinlar yig'indisi</label>
              <Input
                type="number"
                value={formData.coins}
                onChange={(e) =>
                  setFormData({ ...formData, coins: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/50">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Premium Status</span>
                <span className="text-xs text-muted-foreground">
                  Foydalanuvchi obunasi
                </span>
              </div>
              <Button
                size="sm"
                variant={formData.is_premium ? "default" : "outline"}
                onClick={() =>
                  editingUser && handleTogglePremium(editingUser.id)
                }
                className={
                  formData.is_premium
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : ""
                }
              >
                <Crown className="mr-2 h-4 w-4" />
                {formData.is_premium ? "Faol" : "Yoqish"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Bekor qilish
            </Button>
            <Button onClick={handleUpdate}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersPage
