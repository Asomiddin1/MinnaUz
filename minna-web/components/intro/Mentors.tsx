"use client";
import { useTranslations } from "next-intl";

const teamData = [
  {
    id: 1,
    name: "",
    role: "Founder & CEO",
    experience: "5+ years",
    skills: "Project Visionary",
    image: "/images/azizbek.png",
    bgColor: "bg-[#FBBF24]",
  },
  {
    id: 2,
    name: "",
    role: "Frontend Developer",
    experience: "3+ years",
    skills: "Next.js & React",
    image: "/images/sardor.png",
    bgColor: "bg-[#67E8F9]",
  },
  {
    id: 3,
    name: "",
    role: "Content Creator",
    experience: "4 years",
    skills: "Copywriting & SEO",
    image: "/images/malika.png",
    bgColor: "bg-[#7DD3FC]",
  },
  {
    id: 4,
    name: "",
    role: "UI/UX Designer",
    experience: "3 years",
    skills: "Figma Pro",
    image: "/images/shahnoza.png",
    bgColor: "bg-[#F9A8D4]",
  },
  {
    id: 5,
    name: "",
    role: "Backend Developer",
    experience: "4+ years",
    skills: "Node.js & Database",
    image: "/images/alisher.png",
    bgColor: "bg-[#FBBF24]",
  },
];

export default function Team() {
  const t = useTranslations("Mentors");

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto font-sans">
      {/* Sarlavha */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2E1065] mb-4">
          {t("title")}
        </h2>
        <p className="text-[#4C1D95] font-semibold text-lg max-w-3xl mx-auto leading-relaxed">
          {t("desc")}
        </p>
      </div>

      {/* Kartalar */}
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory justify-start lg:justify-center scrollbar-hide">
        {teamData.map((member) => (
          <div
            key={member.id}
            className={`relative w-[280px] h-[420px] rounded-[2rem] overflow-hidden shrink-0 snap-center shadow-lg ${member.bgColor}`}
          >
            <div className="absolute top-12 left-0 w-full text-center opacity-10 text-6xl font-black italic transform -rotate-12 whitespace-nowrap overflow-hidden z-0 tracking-widest text-black uppercase">
              minna
            </div>

            <div className="absolute bottom-0 w-full h-[85%] z-10 flex justify-center items-end">
              <img
                src={member.image}
                alt={member.name}
                className="object-contain w-[90%] h-auto drop-shadow-2xl"
              />
            </div>

            <div className="absolute bottom-0 w-full h-[55%] bg-gradient-to-t from-black via-black/90 to-transparent z-20"></div>

            <div className="absolute bottom-0 w-full pb-6 px-2 flex flex-col items-center z-30">
              <h3 className="text-white text-[28px] font-black uppercase tracking-tighter mb-0 text-center leading-none">
                {member.name}
              </h3>
              <p className="text-gray-200 text-sm font-medium mb-3">{member.role}</p>
              <div className={`text-black text-xs font-bold px-3 py-1 rounded-full mb-1.5 ${member.bgColor}`}>
                Experience: {member.experience}
              </div>
              <div className={`text-black text-[11px] font-bold px-3 py-1 rounded-full ${member.bgColor}`}>
                Skills: {member.skills}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
