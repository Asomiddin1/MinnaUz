import { AxiosResponse } from "axios"
import apiClient from "./axios"

export const adminAPI = {
  /* --- DASHBOARD --- */
  getDashboardStats: (): Promise<AxiosResponse> => apiClient.get("/admin/dashboard/stats"),

  /* --- USERS MANAGEMENT --- */
  getAllUsers: (page = 1, search = "", role = ""): Promise<AxiosResponse> =>
    apiClient.get(`/admin/users`, { params: { page, search, role } }),

  updateUser: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/users/${id}`, data),

  deleteUser: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/users/${id}`),

  togglePremium: (id: number): Promise<AxiosResponse> =>
    apiClient.post(`/admin/users/${id}/toggle-premium`),

  /* --- JLPT TESTS MANAGEMENT --- */
  getTests: (): Promise<AxiosResponse> => apiClient.get("/admin/tests"),

  getTestById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/tests/${id}`),

  createTest: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/tests", data),

  updateTest: (id: number, data: any): Promise<AxiosResponse> => {
    if (data instanceof FormData) {
      data.append("_method", "PUT")
      return apiClient.post(`/admin/tests/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    }
    return apiClient.put(`/admin/tests/${id}`, data)
  },

  deleteTest: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/tests/${id}`),

  getTestQuestions: (testId: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/tests/${testId}/questions`),

  /* --- QUESTIONS MANAGEMENT --- */
  createQuestion: (data: FormData): Promise<AxiosResponse> =>
    apiClient.post("/admin/questions", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateQuestion: (id: number, data: FormData): Promise<AxiosResponse> => {
    if (data instanceof FormData) {
      data.append("_method", "PUT")
    }
    return apiClient.post(`/admin/questions/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  deleteQuestion: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/questions/${id}`),

  /* ==========================================
     LMS (O'QUV KURS) MANAGEMENT
     ========================================== */

  /* --- LEVELS (Darajalar) --- */
  getLevels: (): Promise<AxiosResponse> => apiClient.get("/admin/levels"),

  getLevelById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/levels/${id}`),

  createLevel: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/levels", data),

  updateLevel: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/levels/${id}`, data),

  deleteLevel: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/levels/${id}`),

  /* --- MODULES (Bo'limlar) --- */
  getModules: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/modules", { params: { level_id: levelId } }),

  getModuleById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/modules/${id}`),

  createModule: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/modules", data),

  updateModule: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/modules/${id}`, data),

  deleteModule: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/modules/${id}`),

  /* --- LESSONS (Video darslar) --- */
  getLessons: (moduleId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/lessons", { params: { module_id: moduleId } }),

  getLessonById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/lessons/${id}`),

  createLesson: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/lessons", data),

  updateLesson: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/lessons/${id}`, data),

  deleteLesson: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/lessons/${id}`),

  /* ==========================================
     MATERIALLAR MANAGEMENT (YANGI QO'SHILDI)
     ========================================== */

  /* --- GRAMMARS (Grammatikalar) --- */
  getGrammars: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/grammars", { params: { level_id: levelId } }),

  getGrammarById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/grammars/${id}`),

  createGrammar: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/grammars", data),

  updateGrammar: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/grammars/${id}`, data),

  deleteGrammar: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/grammars/${id}`),
  bulkDeleteGrammars: (ids: number[]): Promise<AxiosResponse> =>
    apiClient.post("/admin/grammars/bulk-delete", { ids }),

  /* --- KANJIS (Kanjilar) --- */
  getKanjis: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/kanjis", { params: { level_id: levelId } }),

  getKanjiById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/kanjis/${id}`),

  createKanji: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/kanjis", data),

  updateKanji: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/kanjis/${id}`, data),

  deleteKanji: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/kanjis/${id}`),

  /* --- VOCABULARIES (Lug'atlar) --- */
  getVocabularies: (levelId?: number): Promise<AxiosResponse> =>
    apiClient.get("/admin/vocabularies", { params: { level_id: levelId } }),

  getVocabularyById: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/admin/vocabularies/${id}`),

  createVocabulary: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/vocabularies", data),

  updateVocabulary: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/vocabularies/${id}`, data),

  deleteVocabulary: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/vocabularies/${id}`),

  /* ==========================================
     VIDEO DARSLAR (ADMIN)
     ========================================== */

  // Barcha videolarni olish (Ixtiyoriy tillar bo'yicha filterlash mumkin)
  getVideos: (lang?: string): Promise<AxiosResponse> =>
    apiClient.get("/admin/videos", { params: { lang } }),

  // Bitta videoni olish (Ixtiyoriy tillar bo'yicha: masalan 'uz' yoki 'uz,ja')
  getVideoById: (id: number, lang?: string): Promise<AxiosResponse> =>
    apiClient.get(`/admin/videos/${id}`, { params: { lang } }),

  createVideo: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/videos", data),

  // Admin yangilayotganda transcriptni butun boshli obyekt shaklida yuboradi
  updateVideo: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/videos/${id}`, data),

  deleteVideo: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/videos/${id}`),

  // YOUTUBE DAN AVTOMAT MA'LUMOT OLISH
  fetchYoutubeData: (url: string): Promise<AxiosResponse> =>
    apiClient.post("/admin/videos/fetch-youtube", { url }),

  // Groq API orqali grammatika yaratish
  // Groq API orqali grammatika yaratish
  generateGrammarWithGroq: (
    grammarTitle: string,
    levelTitle: string
  ): Promise<AxiosResponse> =>
    apiClient.post("/admin/groq/grammar", { grammarTitle, levelTitle }),

  generateGrammarExamplesWithGroq: (
    grammarTitle: string,
    levelTitle: string
  ): Promise<AxiosResponse> =>
    apiClient.post("/admin/groq/grammar/examples", {
      grammarTitle,
      levelTitle,
    }),

  fillGrammarWithGroq: (
    grammarTitle: string,
    levelTitle: string
  ): Promise<AxiosResponse> =>
    apiClient.post("/admin/groq/grammar/fill", { grammarTitle, levelTitle }),

  /* ==========================================
     DOKKAI / ARTICLES (MAQOLALAR) MANAGEMENT
     ========================================== */

  getArticles: (page = 1, search = "", level = ""): Promise<AxiosResponse> =>
    apiClient.get("/admin/articles", { params: { page, search, level } }),

  getArticleById: (id: number | string): Promise<AxiosResponse> =>
    apiClient.get(`/admin/articles/${id}`),

  createArticle: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/admin/articles", data),

  updateArticle: (id: number | string, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/admin/articles/${id}`, data),

  deleteArticle: (id: number | string): Promise<AxiosResponse> =>
    apiClient.delete(`/admin/articles/${id}`),
  generateDokkaiContent: (data: { text: string }): Promise<AxiosResponse> =>
    apiClient.post("/admin/groq/dokkai-generate", data),
}
