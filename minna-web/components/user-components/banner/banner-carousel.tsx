"use client"

import React from 'react'
import Image from "next/image" // <-- 1. Next.js Image import qilindi
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Banner1 from "./images/banner1.jpg"
import { StreakCalendar } from '../streak-calendar'
import { useCheckIn } from '@/hooks/useCheckIn'

const BannerCarousel = () => {
  // Kunlik check-in — dashboard ochilganda 1 marta ishlaydi
  useCheckIn()

  const banners = [
    { 
      id: 1, 
      imageUrl: Banner1, // <-- Import qilingan rasmni o'zini beramiz
      alt: "Banner 1" 
    }
  ]

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
        <div className="lg:col-span-7 w-full">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="h-full">
                  {/* min-h-[200px] karusel balandligini ushlab turadi */}
                  <div className="relative w-full h-full min-h-[200px] md:min-h-[300px] overflow-hidden rounded-xl shadow-md">
                    
                    {/* 2. Oddiy <img> o'rniga Next.js <Image /> ishlatildi */}
                    <Image 
                      src={banner.imageUrl} 
                      alt={banner.alt} 
                      fill // <-- absolute inset-0 w-full h-full o'rnini bosadi
                      className="object-cover" 
                      priority={banner.id === 1} // Birinchi rasm tez yuklanishi uchun priority beramiz
                      placeholder="blur" // Rasm yuklanguncha xira fon chiqib turishi uchun
                    />

                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </div>
          </Carousel>
        </div>

        {/* O'NG TARAF: Calendar (Katta ekranda 30% yoki 3 ta ustunни egallaydi) */}
        <div className="hidden lg:block lg:col-span-3 w-full">
          <StreakCalendar />
        </div>

      </div>
    </div>
  )
}

export default BannerCarousel