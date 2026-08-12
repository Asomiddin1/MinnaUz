"use client"

import React, { useEffect, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCheckIn } from '@/hooks/useCheckIn'
import { userAPI } from '@/lib/api/user'

type Banner = {
  id: number
  title: string | null
  description: string | null
  image: string
}

const BannerCarousel = () => {
  useCheckIn()

  const [banners, setBanners] = useState<Banner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await userAPI.getBanners()
        if (res.data?.data) {
          setBanners(res.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch banners", err)
      }
    }
    fetchBanners()
  }, [])

  const handleBannerClick = (banner: Banner) => {
    setSelectedBanner(banner)
    setIsModalOpen(true)
  }

  if (banners.length === 0) return null

  return (
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <div 
                className="relative w-full overflow-hidden rounded-[24px] shadow-sm cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => handleBannerClick(banner)}
              >
                <img 
                  src={banner.image} 
                  alt={banner.title || "Banner"}
                  className="w-full h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px] object-cover object-center rounded-[24px]" 
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle>{selectedBanner?.title || "Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 pb-6 overflow-y-auto">
            {selectedBanner?.image && (
              <img 
                src={selectedBanner.image} 
                alt={selectedBanner.title || "Banner"} 
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-xl object-cover object-center"
              />
            )}
            {selectedBanner?.description && (
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {selectedBanner.description}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BannerCarousel