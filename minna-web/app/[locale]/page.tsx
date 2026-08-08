import Navbar from "@/components/intro/Navbar"
import Hero from "@/components/intro/Hero"
import Levels from "@/components/intro/Levels"
import Practice from "@/components/intro/Practice"
import Kids from "@/components/intro/Kids"
import Premium from "@/components/intro/Premium"
import Schools from "@/components/intro/Schools"
import Footer from "@/components/intro/Footer"

export const metadata = {
  title: "MinnaUz - JLPT | Yapon tili o'rganish platformasi",
  description:
    "MinnaUz orqali yapon tili va JLPT (N5-N2) imtihonlariga interaktiv testlar, lug'atlar va darslar bilan tayyorlaning.",
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans">
       <Navbar />
        <main>
        <Hero />
        <Levels />
        <Practice />
        <Kids />
        <Premium />
        <Schools />
      </main>
      <Footer />
    </div>
  )
}
