"use client"

import { useEffect, useState, use } from "react"
import BackButton from "@/components/back-button"
import { Play, Lock, CheckCircle2, FileText, ChevronRight, Video, Bookmark, BookmarkCheck, MessageSquare, Send, Sparkles } from "lucide-react"
import { userAPI, getAvatarUrl } from "@/lib/api/user"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface WatchPageProps {
  params: Promise<{
    "jlpt-level": string;
    locale: string;
  }>
}

// Izohlar uchun type
interface Comment {
  id: number
  comment: string
  created_at: string
  user: {
    id: number
    name: string
  }
}

interface Lesson {
  id: number
  title: any
  video_url: string
  duration?: string
  content?: string
  is_free?: boolean
  is_favorite?: boolean
  is_completed?: boolean
  comments?: Comment[] // Darsga tegishli izohlar
}

// Module va ichidagi darslar
interface Module {
  id: number
  title: any
  lessons: Lesson[]
}

interface LevelData {
  title: any
  slug: string
  modules: Module[]
}

const WatchLevelPage = ({ params }: WatchPageProps) => {
  const resolvedParams = use(params)
  const levelSlug = resolvedParams["jlpt-level"].toLowerCase()
  const locale = resolvedParams.locale || "uz"

  const getTranslated = (field: any, lang: string) => {
    if (typeof field === "string") return field;
    return field?.[lang] || field?.["uz"] || "";
  }

  const [loading, setLoading] = useState(true)
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const router = useRouter()
  
  const [likeLoading, setLikeLoading] = useState(false)
  
  // Izoh yozish uchun state'lar
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  
  const [completeLoading, setCompleteLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await userAPI.getLevelBySlug(levelSlug)
        const data = res.data
        setLevelData(data)

        try {
          const userRes = await userAPI.getProfile()
          setIsPremium(userRes.data?.user?.is_premium || false)
          setCurrentUserId(userRes.data?.user?.id || null)
        } catch (err) {
          console.warn("Profil yuklanmadi")
        }

        let extractedLessons: Lesson[] = []
        if (data.modules && Array.isArray(data.modules)) {
          data.modules.forEach((mod: Module) => {
            if (mod.lessons && Array.isArray(mod.lessons)) {
              extractedLessons = [...extractedLessons, ...mod.lessons]
            }
          })
        }

        setAllLessons(extractedLessons)
        
        if (extractedLessons.length > 0) {
          setCurrentLesson(extractedLessons[0])
        }
      } catch (error) {
        console.error("Darslarni yuklashda xatolik:", error)
        toast.error("Ma'lumotlarni yuklab bo'lmadi")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [levelSlug])

  // Darsni saqlash (Like)
  const handleToggleLike = async () => {
    if (!currentLesson) return
    try {
      setLikeLoading(true)
      const res = await userAPI.toggleLessonLike(currentLesson.id)
      
      setCurrentLesson(prev => prev ? { ...prev, is_favorite: res.data.is_saved } : null)
      setAllLessons(prev => prev.map(l => l.id === currentLesson.id ? { ...l, is_favorite: res.data.is_saved } : l))
      toast.success(res.data.message)
    } catch (error) {
      toast.error("Darsni saqlashda xatolik yuz berdi")
    } finally {
      setLikeLoading(false)
    }
  }

  // Darsni tugatganlikni belgilash
  const handleMarkCompleted = async () => {
    if (!currentLesson || !levelData) return
    try {
      setCompleteLoading(true)
      // Level API'sini chaqiramiz (minna-api dagi /activity/mark-lesson-completed)
      // Lekin LevelData interfeysida level'ning ID'si yo'q, shuning uchun slugs ishlatilyapti.
      // Modullarning level_id sini olamiz yoki /levels/{slug} orqali kelgan levelData ID'sini.
      const levelId = (levelData as any).id
      
      await userAPI.markLessonCompleted(currentLesson.id, levelId)
      
      setCurrentLesson(prev => prev ? { ...prev, is_completed: true } : null)
      setAllLessons(prev => prev.map(l => l.id === currentLesson.id ? { ...l, is_completed: true } : l))
      
      toast.success("Dars tugatilgan deb belgilandi")
      
      // Sidebar va boshqa componentlarga yangi progressni bildirish uchun (kerak bo'lsa event chiqarish yoki hook ishlashi mumkin)
    } catch (error) {
      toast.error("Darsni tugatilgan deb belgilashda xatolik")
    } finally {
      setCompleteLoading(false)
    }
  }

  // Izoh yuborish
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !currentLesson) return

    try {
      setCommentLoading(true)
      const res = await userAPI.addLessonComment(currentLesson.id, commentText)
      
      // Yangi kelgan izohni massiv boshiga qo'shamiz
      const newComment = res.data.data
      
      setCurrentLesson(prev => {
        if (!prev) return prev
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])]
        }
      })
      
      setAllLessons(prev => prev.map(l => {
        if (l.id === currentLesson.id) {
          return {
             ...l,
             comments: [newComment, ...(l.comments || [])]
          }
        }
        return l
      }))
      
      setCommentText("")
      toast.success("Izoh muvaffaqiyatli qo'shildi!")
    } catch (error) {
      toast.error("Izoh yozishda xatolik yuz berdi")
    } finally {
      setCommentLoading(false)
    }
  }

  // Izohni o'chirish
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Haqiqatan ham bu izohni o'chirmoqchimisiz?")) return
    try {
      await userAPI.deleteLessonComment(commentId)
      
      setCurrentLesson(prev => {
        if (!prev) return prev
        return {
          ...prev,
          comments: prev.comments?.filter(c => c.id !== commentId) || []
        }
      })
      
      setAllLessons(prev => prev.map(l => {
        if (l.id === currentLesson?.id) {
          return {
             ...l,
             comments: l.comments?.filter(c => c.id !== commentId) || []
          }
        }
        return l
      }))
      
      toast.success("Izoh o'chirildi")
    } catch (error) {
      toast.error("Izohni o'chirishda xatolik yuz berdi")
    }
  }

  // Izohni tahrirlash uchun state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [editCommentLoading, setEditCommentLoading] = useState(false)

  // Izohni tahrirlashni boshlash
  const startEditingComment = (comment: any) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.comment)
  }

  // Izohni tahrirlashni saqlash
  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) return
    
    try {
      setEditCommentLoading(true)
      const res = await userAPI.updateLessonComment(commentId, editCommentText)
      
      const updatedComment = res.data.data
      
      setCurrentLesson(prev => {
        if (!prev) return prev
        return {
          ...prev,
          comments: prev.comments?.map(c => c.id === commentId ? updatedComment : c) || []
        }
      })
      
      setAllLessons(prev => prev.map(l => {
        if (l.id === currentLesson?.id) {
          return {
             ...l,
             comments: l.comments?.map(c => c.id === commentId ? updatedComment : c) || []
          }
        }
        return l
      }))
      
      setEditingCommentId(null)
      toast.success("Izoh yangilandi")
    } catch (error) {
      toast.error("Izohni yangilashda xatolik yuz berdi")
    } finally {
      setEditCommentLoading(false)
    }
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

  // Sanani chiroyli formatlash uchun
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("uz-UZ", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex justify-center">
        <div className="w-full max-w-7xl space-y-8">
          <Skeleton className="h-16 w-full" />
          <div className="flex flex-col lg:flex-row gap-8">
            <Skeleton className="h-[60vh] flex-1 rounded-3xl" />
            <Skeleton className="h-[60vh] w-full lg:w-[400px] rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!levelData || allLessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <BackButton />
        <h2 className="mt-8 text-2xl font-bold">Darslar topilmadi</h2>
        <p className="text-slate-500">Hozircha bu bo'limga video darslar qo'shilmagan.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      
      {/* HEADER */}
      <div className="border-b bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 h-14 md:h-16 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-widest">{getTranslated(levelData.title, locale)}</span>
            <ChevronRight className="h-3 w-3 md:h-4 text-slate-400" />
            <span className="text-[10px] md:text-sm font-bold text-slate-900 dark:text-white">Video Darslar</span>
          </div>
          <div className="hidden md:block w-10" /> 
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CHAP TOMON: Video Player va Ma'lumotlar */}
          <div className="flex-1 space-y-6">
            
            {/* VIDEO PLAYER */}
            <div className="relative aspect-video w-full overflow-hidden rounded-[24px] md:rounded-[32px] bg-[#0F172A] shadow-xl border border-slate-800">
              {currentLesson ? (
                (!isPremium && !currentLesson.is_free) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-6">
                    <div className="h-16 w-16 md:h-20 md:w-20 mb-4 md:mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Lock className="h-8 w-8 md:h-10 md:w-10 text-amber-500" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Premium obuna zarur</h3>
                    <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                      Ushbu darsni ko'rish uchun premium obuna bo'lishingiz kerak. Barcha videolarni cheklovsiz tomosha qiling!
                    </p>
                    <Button 
                      className="mt-6 md:mt-8 h-12 md:h-14 px-6 md:px-8 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0 font-bold text-sm md:text-base rounded-2xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105" 
                      onClick={() => router.push("/dashboard/premium")}
                    >
                      <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Premium sotib olish
                    </Button>
                  </div>
                ) : currentLesson.video_url?.startsWith("/storage") ? (
                  <video 
                    src={getAvatarUrl(currentLesson.video_url)} 
                    controls 
                    className="absolute inset-0 w-full h-full object-contain"
                  ></video>
                ) : (
                  <iframe 
                    src={getEmbedUrl(currentLesson.video_url)} 
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-blue-600 flex items-center justify-center shadow-3xl shadow-blue-500/50">
                    <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO HAQIDA */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {getTranslated(currentLesson?.title, locale) || "Nomsiz"}
                </h1>
                
                <button 
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                    currentLesson?.is_favorite 
                      ? "bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-100" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                  title="Saqlab qo'yish"
                >
                  {currentLesson?.is_favorite ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {currentLesson?.duration && (
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Play className="h-3.5 w-3.5 text-blue-500" /> {currentLesson.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> {currentLesson?.comments?.length || 0} ta izoh
                  </span>
                </div>
                
                {/* DARSNI TUGATDIM TUGMASI */}
                <Button 
                  onClick={handleMarkCompleted}
                  disabled={currentLesson?.is_completed || completeLoading || (!isPremium && !currentLesson?.is_free)}
                  variant={currentLesson?.is_completed ? "outline" : "default"}
                  className={`text-sm font-bold gap-2 ${
                    currentLesson?.is_completed 
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${currentLesson?.is_completed ? "text-emerald-500" : ""}`} />
                  {currentLesson?.is_completed ? "O'rganildi" : "Darsni tugatdim"}
                </Button>
              </div>

              {currentLesson?.content && (
                <div className="mt-6 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {typeof currentLesson.content === 'string' ? currentLesson.content : (currentLesson.content as any)?.uz || ""}
                </div>
              )}
            </div>

            {/* IZOHLAR (COMMENTS) SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Fikr va savollar
              </h3>

              {/* Fikr yozish formasi */}
              <form onSubmit={handleAddComment} className="mb-8 flex gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase">
                  U
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Dars yuzasidan savol yoki fikringizni yozing..."
                    className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 pr-12 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Fikrlar ro'yxati */}
              <div className="space-y-6">
                {currentLesson?.comments && currentLesson.comments.length > 0 ? (
                  currentLesson.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-700/50">
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                      <div className="flex-1 w-full relative">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {comment.user?.name || "Foydalanuvchi"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          
                          {editingCommentId === comment.id ? (
                            <div className="mt-2">
                              <textarea 
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                                rows={2}
                              ></textarea>
                              <div className="flex justify-end gap-2 mt-2">
                                <button 
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                  Bekor qilish
                                </button>
                                <button 
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={editCommentLoading}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                  Saqlash
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {comment.comment}
                            </p>
                          )}
                        </div>
                        
                        {/* Edit / Delete tugmalari */}
                        {currentUserId === comment.user_id && editingCommentId !== comment.id && (
                          <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button 
                              onClick={() => startEditingComment(comment)}
                              className="p-1.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                              title="Tahrirlash"
                            >
                              <FileText className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                              title="O'chirish"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Hozircha izohlar yo'q. Birinchi bo'lib fikr bildiring!
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* O'NG TOMON: Playlist */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm sticky top-6">
              <div className="p-6 border-b dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Kurs mazmuni</h3>
                <p className="text-xs text-slate-500 mt-1">Jami {allLessons.length} ta dars</p>
              </div>
              
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {levelData.modules.map((mod: Module) => (
                  <div key={mod.id} className="mb-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                      {getTranslated(mod.title, locale)}
                    </div>
                    
                    {mod.lessons?.map((lesson) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isLocked = !isPremium && !lesson.is_free;
                      return (
                        <div 
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`flex items-center justify-between p-4 border-b last:border-0 dark:border-slate-800 cursor-pointer transition-colors ${
                            isActive ? 'bg-blue-50/50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {isLocked ? (
                                <Lock className="h-3.5 w-3.5 text-slate-400" />
                              ) : (
                                <Play className={`h-3 w-3 ${isActive ? 'fill-white' : 'fill-slate-400'}`} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {getTranslated(lesson.title, locale) || "Nomsiz"}
                                </h4>
                                {lesson.is_free && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center whitespace-nowrap">
                                    Tekin
                                  </span>
                                )}
                              </div>
                              {lesson.duration && (
                                <span className="text-[10px] text-slate-400">{lesson.duration}</span>
                              )}
                            </div>
                          </div>
                          {isActive && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 ml-2" />}
                          {!isActive && lesson.is_completed && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default WatchLevelPage