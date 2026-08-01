import Navbar from "@/components/intro/Navbar"
import Hero from "@/components/intro/Hero"
import Herotap from "@/components/intro/Herotap"
import LanguageStrip from "@/components/intro/LanguageStrip"
import Features from "@/components/intro/Features"
import SuperDuolingo from "@/components/intro/SuperDuolingo"
import EnglishTest from "@/components/intro/EnglishTest"
import DuolingoABC from "@/components/intro/DuolingoABC"
import AppDownload from "@/components/intro/AppDownload"
import Footer from "@/components/intro/Footer"
import Mentors from "@/components/intro/Mentors"

export const metadata = {
  title: "MinnaUz - JLPT | Yapon tili o'rganish platformasi",
  description:
    "MinnaUz orqali yapon tili va JLPT (N5-N2) imtihonlariga interaktiv testlar, lug'atlar va darslar bilan tayyorlaning.",
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans">
      <Navbar />
      <Hero />
      <LanguageStrip />
      <Features />

      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>

      <div id="pricing">
        <SuperDuolingo />
      </div>

      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>

      <div id="results">
        <EnglishTest />
      </div>

      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>
      <div className="mx-auto w-full max-w-5xl border-t-2 border-gray-100"></div>

      <DuolingoABC />

      <div id="contact">
        <AppDownload />
      </div>

      <div id="mentors">
        <Mentors />
      </div>

      <div className="bg-white pb-20">
        <Herotap />
      </div>

      <Footer />
    </div>
  )
}
