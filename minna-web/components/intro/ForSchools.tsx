"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForSchools() {
  return (
    <section className="w-full flex justify-center py-32 px-6 bg-[#f8fafc] overflow-hidden relative">
      {/* Fon bezaklari (Grid pattern) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0213cc 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-20">
        
        {/* 1. VIZUAL QISM: REALISTIK O'QITUVCHI DASHBOARDI */}
        <div className="w-full lg:w-[55%] flex justify-center relative order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[600px] h-[450px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden"
          >
            {/* Sidebar Simulyatsiyasi */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-slate-50 border-r border-slate-100 hidden sm:flex flex-col items-center py-8 gap-6">
              <div className="w-8 h-8 bg-[#0213cc] rounded-lg shadow-lg shadow-blue-200" />
              <div className="w-6 h-6 bg-slate-200 rounded-md" />
              <div className="w-6 h-6 bg-slate-200 rounded-md" />
              <div className="w-6 h-6 bg-slate-200 rounded-md mt-auto" />
            </div>

            {/* Asosiy Kontent */}
            <div className="sm:ml-16 p-8 w-full h-full">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">Guruh: N3 Intensive</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jonli dars jarayoni</p>
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {i===4 ? '+12' : ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* Jonli Reyting Varaqasi */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: "Sardor Mirzayev", xp: "1,240 XP", progress: 95, status: "Active" },
                  { name: "Malika Abdullayeva", xp: "980 XP", progress: 78, status: "Active" },
                  { name: "Azizbek Baxtiyorov", xp: "850 XP", progress: 62, status: "Offline" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">👤</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-700">{item.name}</span>
                        <span className="text-[10px] font-bold text-[#0213cc]">{item.xp}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.progress}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className={`h-full rounded-full ${item.progress > 80 ? 'bg-[#58cc02]' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Stats Card */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute right-6 top-24 bg-[#0213cc] p-6 rounded-3xl shadow-2xl text-white z-20 hidden md:block"
            >
              <div className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Sinf O'rtachasi</div>
              <div className="text-3xl font-[1000]">88.4%</div>
              <div className="mt-2 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-md text-center">📈 +5.2% bugun</div>
            </motion.div>
          </motion.div>
        </div>

        {/* 2. MATN QISMI: ENTERPRISE CONTENT */}
        <div className="w-full lg:w-[45%] text-center lg:text-left order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#0213cc] text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-[#58cc02] animate-pulse" />
              Minna for Education
            </div>
            
            <h2 className="text-5xl md:text-7xl font-[1000] text-slate-900 leading-[0.9] tracking-tighter mb-8">
              Boshqaruv endi <br />
              <span className="text-[#0213cc]">yagona qo'lda</span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 leading-relaxed">
              O'quv markazlari va maktablar uchun <span className="text-slate-900 font-bold underline decoration-blue-200 decoration-4">bepul LMS platformasi.</span> O'quvchilar natijalarini kuzatib boring, uyga vazifalarni avtomatlashtiring.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <Link href={'/dashboard'}>
              <button className="w-full sm:w-auto bg-[#0213cc] text-white font-black py-6 px-12 rounded-[2.5rem] text-sm uppercase tracking-widest border-b-[8px] border-[#0a0b80] active:border-b-0 active:translate-y-2 transition-all shadow-2xl shadow-blue-200 group">
                HAMKORLIKNI BOSHLASH
              </button>
              </Link>
              
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-black text-slate-800">0%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yashirin to'lovlar</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}