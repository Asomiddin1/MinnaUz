import { AxiosResponse } from "axios"
import apiClient from "./axios" // Asosiy axios sozlamasini chaqiramiz

export const userAPI = {
  // ✅ TO'G'RILANDI: /user/profile ga o'zgartirildi
  getProfile: (): Promise<AxiosResponse> => apiClient.get("/user/profile"),

  // ✅ TO'G'RILANDI: /user/streaks prefix ichida
  getStreaks: (year?: number, month?: number): Promise<AxiosResponse> =>
    apiClient.get("/user/streaks", { params: { year, month } }),

  // Kunlik check-in (har kuni 1 marta chaqiriladi)
  checkIn: (): Promise<AxiosResponse> => apiClient.post("/user/check-in"),

  // ==========================================
  // AVATAR
  // ==========================================
  uploadAvatar: (formData: FormData): Promise<AxiosResponse> => 
    apiClient.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    
  revertAvatar: (): Promise<AxiosResponse> => 
    apiClient.post("/user/avatar/default"),

  updateName: (name: string): Promise<AxiosResponse> => 
    apiClient.patch("/user/name", { name }),

  getTests: (level?: string): Promise<AxiosResponse> =>
    apiClient.get("/user/tests", { params: { level } }),

  getTestDetails: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/user/tests/${id}`),

  submitExam: (
    testId: number,
    answers: any,
    timeSpent?: number
  ): Promise<AxiosResponse> =>
    apiClient.post(`/user/tests/${testId}/submit`, {
      answers,
      time_spent: timeSpent || 0,
    }),

  getTestResult: (resultId: number): Promise<AxiosResponse> =>
    apiClient.get(`/user/results/${resultId}`),

  getMyResults: (): Promise<AxiosResponse> => apiClient.get("/user/results"),

  // ==========================================
  // QURILMALARNI BOSHQARISH (DEVICE MANAGER)
  // ==========================================

  // Faol qurilmalar ro'yxatini olish
  getDevices: (): Promise<AxiosResponse> => apiClient.get("/user/devices"),

  // Aniq bitta qurilmadan chiqish (id = token id)
  logoutDevice: (tokenId: number): Promise<AxiosResponse> =>
    apiClient.delete(`/user/devices/${tokenId}`),

  // Boshqa barcha qurilmalardan chiqish
  logoutOtherDevices: (): Promise<AxiosResponse> =>
    apiClient.delete("/user/devices/logout-others"),

  // ==========================================
  // YANGI L.M.S (O'QUV KURS) API LARI
  // ==========================================

  // Barcha darajalarni olish (N5, N4, Hira-kata ro'yxati)
  getLevels: (): Promise<AxiosResponse> => apiClient.get("/levels"),

  // Bitta daraja haqida to'liq ma'lumot
  getLevelBySlug: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/levels/${slug}`),

  // ==========================================
  // MATERIALLAR VA QIDIRUV (Auth talab qilinadi)
  // ==========================================

  // Daraja uchun barcha grammatikalarni olish
  getLevelGrammars: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/levels/${slug}/grammars`),

  // Daraja uchun barcha kanjilarni olish
  getLevelKanjis: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/levels/${slug}/kanjis`),

  // Daraja uchun barcha lug'atlarni olish
  getLevelVocabularies: (slug: string): Promise<AxiosResponse> =>
    apiClient.get(`/levels/${slug}/vocabularies`),

  // Baza bo'ylab so'z va namunalardan qidirish
  searchMaterials: (query: string): Promise<AxiosResponse> =>
    apiClient.get("/search", { params: { q: query } }),

  // ==========================================
  // VIDEO DARSLAR (USER)
  // ==========================================

  // Barcha videolarni olish (Kategoriya va tillar bo'yicha filterlash mumkin)
  getVideos: (category?: string, lang?: string): Promise<AxiosResponse> =>
    apiClient.get("/videos", { params: { category, lang } }),

  // Bitta videoni o'qish (Kerakli tillarni vergul bilan yuborish mumkin: 'uz,ja')
  getVideoById: (id: number, lang?: string): Promise<AxiosResponse> =>
    apiClient.get(`/videos/${id}`, { params: { lang } }),

  // ==========================================
  // USER INTERAKSIYALARI (Faqat ro'yxatdan o'tganlar uchun)
  // ==========================================

  // Darsni saqlash yoki saqlanganlardan olib tashlash (Like/Unlike)
  toggleLessonLike: (lessonId: number): Promise<AxiosResponse> =>
    apiClient.post(`/user/lessons/${lessonId}/like`),

  // Darsga izoh qoldirish
  addLessonComment: (
    lessonId: number,
    comment: string
  ): Promise<AxiosResponse> =>
    apiClient.post(`/user/lessons/${lessonId}/comments`, { comment }),

  // ==========================================
  // DOKKAI (MAQOLALAR) API LARI
  // ==========================================

  // Article dokkai ro'yxati
  getArticles: (page = 1, search = "", level = ""): Promise<AxiosResponse> =>
    apiClient.get("/articles", { params: { page, search, level } }),

  // Bitta maqolani to'liq ma'lumoti bilan ochish (Views oshadi)
  getArticleById: (id: string | number): Promise<AxiosResponse> =>
    apiClient.get(`/articles/${id}`),

  // Maqola oxiridagi Dokkai testini ishlagach, javoblarni jo'natish
  submitArticleQuiz: (
    id: string | number,
    data: { answers: any[] }
  ): Promise<AxiosResponse> =>
    apiClient.post(`/articles/${id}/submit-quiz`, data),

  // AI bilan suhbatlashish (Voice/Text Chat) xabarlarini jo'natish
  sendAiChatMessage: (data: {
    message: string;
    lang: string;
    topic: string;
    level: string;
    history: { role: string; content: string }[];
  }): Promise<AxiosResponse> => 
    apiClient.post("/ai/chat", data),
}