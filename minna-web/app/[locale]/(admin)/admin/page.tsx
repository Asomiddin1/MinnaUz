"use client"

import React, { useEffect, useState } from "react"
import { adminAPI } from "@/lib/api/admin"
import { 
  Users, 
  Crown, 
  BookOpen, 
  Video, 
  TrendingUp, 
  FileText,
  AlertCircle
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

interface DashboardStats {
  summary: {
    totalUsers: number
    premiumUsers: number
    freeUsers: number
    adminUsers: number
    teacherUsers: number
    standardUsers: number
    totalTests: number
    totalVideos: number
  }
  userGrowth: { name: string; foydalanuvchi: number }[]
  materialsDistribution: { name: string; value: number }[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats()
        if (response.data && response.data.data) {
          setStats(response.data.data)
        }
      } catch (err) {
        console.error("Dashboard yuklashda xatolik:", err)
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Statistika yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="h-10 w-10" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const { summary, userGrowth, materialsDistribution } = stats

  // 1-grafik: Rol bo'yicha
  const rolesData = [
    { name: 'Admin', value: summary.adminUsers || 0 },
    { name: "O'qituvchi", value: summary.teacherUsers || 0 },
    { name: 'Foydalanuvchi', value: summary.standardUsers || 0 }
  ].filter(item => item.value > 0);

  // 2-grafik: Obuna bo'yicha
  const premiumData = [
    { name: 'Premium', value: summary.premiumUsers || 0 },
    { name: 'Oddiy', value: summary.freeUsers || 0 }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Platforma Statistikasi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">MinnaUz loyihasining barcha joriy ko'rsatkichlari</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Foydalanuvchi</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalUsers}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Premium A'zolar</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.premiumUsers}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Testlar</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalTests}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Video Darslar</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalVideos}</h3>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LINE CHART: User Growth */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Oylik Ro'yxatdan O'tishlar</h3>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <Line type="monotone" dataKey="foydalanuvchi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8884d8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8884d8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE & BAR CHARTS (Side by side on large, stacked on mobile) */}
        <div className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lavozimlar</h3>
              </div>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rolesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rolesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={24} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Obunalar</h3>
              </div>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={premiumData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {premiumData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={24} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Materiallar Taqsimoti</h3>
              <BookOpen className="h-5 w-5 text-slate-400" />
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialsDistribution} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8884d8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8884d8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {materialsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}