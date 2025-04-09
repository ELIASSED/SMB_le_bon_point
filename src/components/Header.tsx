"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="relative bg-white shadow-lg rounded-lg max-w-6xl mx-auto mt-2">
      {/* Upper band with logo, title and menu toggle */}
      <div className="bg-[#F6B732] py-4 px-6 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
           
            <Link href="/" className="text-xl font-semibold">
              <Image
                src="/smblogo.png"
                width={100}
                height={50}
                alt="SMB Logo"
                className="h-14 w-auto object-contain"
              />
              <div className="mt-1">
                <span className="block text-base font-bold text-gray-700">
                  Stages de Récupération de Points
                </span>
                <span className="block text-sm font-bold text-blue-700">
                  Agrément R2209400050
                </span>
              </div>
            </Link>
          </div>
         
        </div> <Image
              src="/logo.png"
              width={100}
              height={50}
              alt="Logo principal"
              className="h-20 w-auto object-contain"
            />
      </div>
      
  
    </header>
  );
}