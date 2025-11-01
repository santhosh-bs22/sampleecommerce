// src/components/AuthLayout.tsx

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

// --- Asset Path Utility (Matches logic in Home.tsx) ---
const ASSET_BASE_PATH = '/EcomX-website/'; 
const getAssetPath = (path: string) => {
    let url = ASSET_BASE_PATH;
    if (path.startsWith('/')) {
        url += path.substring(1);
    } else {
        url += path;
    }
    return url;
};

// Hero Slide Data using relevant mock images
const authSlides = [
    { id: 1, img: getAssetPath("images/promos/mobile.jpg"), alt: "Mobile Phone" },
    { id: 2, img: getAssetPath("images/promos/laptop.jpg"), alt: "Laptop" },
    { id: 3, img: getAssetPath("images/promos/handbags.jpg"), alt: "Handbag" },
    { id: 4, img: getAssetPath("images/categories/men.jpg"), alt: "Men's Fashion" },
    { id: 5, img: getAssetPath("images/categories/women.jpg"), alt: "Women's Fashion" },
];

const cardVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 } as Transition },
};

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-0 flex items-center justify-center min-h-[calc(100vh-64px)]">
      {/* ADDED: border border-border for the main container */}
      <div className="w-full max-w-6xl flex shadow-2xl rounded-xl overflow-hidden min-h-[600px] bg-card border border-border">
        
        {/* Left Side: Image Slider (Visible on medium screens and up) */}
        {/* ADDED: md:border-r md:border-border for the vertical separator */}
        <motion.div 
            className="hidden md:block md:w-1/2 relative bg-gray-900 overflow-hidden md:border-r md:border-border"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Swiper
                modules={[Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={800}
                className="w-full h-full"
            >
                {authSlides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative w-full h-full">
                            <img
                                src={slide.img}
                                alt={slide.alt}
                                className="absolute inset-0 z-0 w-full h-full object-cover opacity-100"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/35 z-5"></div>
                            <div className="absolute inset-0 flex items-center justify-center z-10 p-8">
                              
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </motion.div>

        {/* Right Side: Form Content */}
        <motion.div
          className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-card"
          variants={cardVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-full max-w-sm">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;