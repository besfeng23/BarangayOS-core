
'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const billboardSlides = [
  {
    type: 'captain',
    imageUrl: 'https://picsum.photos/seed/captain/800/600',
    imageHint: 'portrait man',
    title: 'OFFICE OF THE PUNONG BARANGAY',
    subtitle: 'Office Hours: 8:00 AM - 5:00 PM, Mon-Fri',
  },
  {
    type: 'hotlines',
    bgColor: 'bg-red-700',
    title: 'EMERGENCY HOTLINES',
    items: [
      { label: 'PNP (Police)', value: '0917-123-4567' },
      { label: 'BFP (Fire)', value: '0918-765-4321' },
      { label: 'MDRRMO (Health)', value: '(045) 123-4567' },
    ],
  },
  {
    type: 'transparency',
    bgColor: 'bg-green-700',
    title: 'FINANCIAL TRANSPARENCY',
    subtitle: 'Collections for the Month of July 2024',
    amount: '₱ 42,550.00',
  },
  {
    type: 'qr',
    title: 'DIGITAL SERVICES',
    subtitle: 'Scan to Request a Barangay Clearance',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://barangayos.com/request',
  },
];

export default function BayanihanBillboard() {
  const router = useRouter();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const handleWakeUp = () => {
    // Navigate to the login screen to force re-authentication
    router.push('/login');
  };

  return (
    <div
      className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center cursor-pointer"
      onClick={handleWakeUp}
    >
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="w-full h-full">
          {billboardSlides.map((slide, index) => (
            <CarouselItem key={index} className="w-full h-full relative overflow-hidden">
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover animate-ken-burns"
                  data-ai-hint={slide.imageHint}
                />
              )}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8 ${
                  slide.bgColor || 'bg-black/50'
                }`}
              >
                <h1 className="text-6xl font-bold tracking-tight">{slide.title}</h1>
                <p className="text-3xl mt-4">{slide.subtitle}</p>

                {slide.items && (
                  <div className="mt-8 space-y-4 text-4xl">
                    {slide.items.map((item, i) => (
                      <div key={i}>
                        <span className="font-semibold">{item.label}: </span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {slide.amount && <p className="text-8xl font-bold mt-8">{slide.amount}</p>}
                {slide.qrUrl && (
                  <div className="mt-8 p-4 bg-white rounded-lg">
                    <Image src={slide.qrUrl} alt="QR Code" width={250} height={250} />
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-10 text-white text-2xl font-semibold animate-pulse">
        TAP SCREEN TO START SERVICE
      </div>
    </div>
  );
}
