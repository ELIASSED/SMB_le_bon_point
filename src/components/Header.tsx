"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
<header className="bg-teal text-white">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
    {/* Logo et titre */}
    <div className="flex items-center space-x-3">
      <Link href="/">
        <Image
          src="/smblogo.png"
          alt="Logo SMB"
          className="h-12 w-auto"
          width={100}
          height={50}
        />
      </Link>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo Gouvernement"
          className="h-10 w-auto"
          width={100}
          height={50}
        />
        <h6 className="text-xs text-beige mt-1">Agrément R2209400050</h6>
      </Link>
      <div className="text-left">
        <Link href="/" className="text-xl p-8 font-bold leading-tight text-white">
          <span className="block">LE BON POINT</span>
          <span className="block text-sm">CENTRE DE RÉCUPÉRATION DE POINTS</span>
        </Link>
      </div>
    </div>

    {/* Navigation Desktop */}
    <nav className="hidden md:flex space-x-8 text-base font-medium">
      <Link href="/" className="text-white hover:text-yellow">
        Accueil
      </Link>
      <Link href="/stages" className="text-white hover:text-yellow">
        Stages
      </Link>
      <Link href="/contact" className="text-white hover:text-yellow">
        Contact
      </Link>
    </nav>

    {/* Bouton menu mobile */}
    <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu mobile">
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        {menuOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        )}
      </svg>
    </button>
  </div>

  {/* Menu Mobile */}
  {menuOpen && (
    <div className="md:hidden bg-teal border-t border-teal-light">
      <nav className="flex flex-col space-y-2 py-4">
        <Link href="/" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-yellow hover:bg-yellow-dark">
          Accueil
        </Link>
        <Link href="/stages" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-yellow hover:bg-yellow-dark">
          Stages
        </Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-yellow hover:bg-yellow-dark">
          Contact
        </Link>
      </nav>
    </div>
  )}
</header>

  );
}