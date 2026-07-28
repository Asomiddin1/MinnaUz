"use client"

import React from 'react'
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Banner1 from "./images/banner2.png"
import { useCheckIn } from '@/hooks/useCheckIn'

const BannerCarousel = () => {
  useCheckIn()

  const banners = [
    { 
      id: 1, 
      imageUrl: Banner1, 
      alt: "Banner2" 
    }
  ]

  return (
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative w-full overflow-hidden rounded-2xl shadow-sm">
                <Image 
                  src={banner.imageUrl} 
                  alt={banner.alt} 
                  width={1200}
                  height={600}
                  className="w-full h-auto object-contain rounded-2xl" 
                  priority={banner.id === 1}
                  placeholder="blur"
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
  )
}

export default BannerCarousel