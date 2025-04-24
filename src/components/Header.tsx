"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ExternalLinkButton from './ExternalLinkButton';

export default function Header() {
  return (
    <header className="relative bg-white shadow-lg w-full max-w-8xl mx-auto">
      {/* Upper band with logo, title and menu toggle */}
      <div className="bg-[#F6B732] py-2 px-6 flex items-center justify-between ">
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
       
        </div>
        <Image
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