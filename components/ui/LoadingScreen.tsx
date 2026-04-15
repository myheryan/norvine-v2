"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    // Overlay Full Screen: Background semi-transparan & Efek Blur (backdrop-blur)
    <div className="min-h-[500px] relative flex flex-col items-center justify-center backdrop-blur-lg">
      <div className="relative flex flex-col items-center">
        
        {/* Kontainer Utama - DIBUAT LEBIH KECIL (h-16 w-16) */}
        <div className="relative h-16 w-16 flex items-center justify-center">
          
          {/* Ring yang Berputar (Border Luar) - TIPIS (border) */}
          <div className="absolute inset-0 border-[2px] border-zinc-100 border-t-black rounded-full animate-logo-rotate" />
          
          {/* Logo N di Tengah yang berdenyut (Pulse) - DIBUAT LEBIH KECIL (w-8 h-8) */}
          <div className="animate-n-pulse flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-12 h-12 fill-black"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bentuk N Tajam khas Norvine */}
              <path d="M25 75V25H38L62 60V25H75V75H62L38 40V75H25Z" />
              
              {/* Simbol V / Checkmark Merah */}
              <path 
                d="M45 55L52 62L70 38" 
                fill="none" 
                stroke="#E11D48" 
                strokeWidth="5" 
                strokeLinecap="square"
              />
            </svg>
          </div>
        </div>


        {/* Status Text Tipis - DIBUAT LEBIH KECIL */}
        <p className="mt-1.5 text-[7px] uppercase tracking-widest text-zinc-400 font-medium">
          LOADING
        </p>
      </div>
    </div>
  );
}