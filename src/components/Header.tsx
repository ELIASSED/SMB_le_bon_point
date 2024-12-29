"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative bg-white shadow-lg rounded-lg max-w-6xl mx-auto mt-9">
      {/* Bande supérieure avec menu burger et titre */}
      <div className="bg-yellow-dark py-6 px-9 flex items-center justify-between rounded-t-lg">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white bg-yellow p-2 rounded-md md:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className="text-left md:ml-6">
          <Link href="/" className="text-xl font-semibold text-gray-dark">
            <span className="block text-2xl">Sécurité Routière Formation</span>
            <span className="block text-base text-gray-600">
              Stages de Récupération de Points
            </span>
            <span className="block text-sm text-gray-500 mt-1">
              Agrément R2209400050
            </span><div className="hidden md:block">
          <img
            src="/logo.png"
            alt="Exemple Banner"
            className="h-16 w-auto"
          />
        </div>
          </Link>
        </div>
        <div className="hidden md:block">
          <img
            src="/smblogo.png"
            alt="Exemple Banner"
            className="h-20 w-auto"
          />
        </div>
      </div>

      {/* Bande noire avec navigation principale */}
      <div className={`bg-beige font-bold text-white rounded-b-lg ${menuOpen ? '' : 'hidden'} md:flex`}>
        <nav className="flex flex-col md:flex-row justify-end px-9 py-3 md:space-x-8">
          <Link href="/" className="text-base uppercase">
            Accueil
          </Link>
          <Link href="/stages" className="text-base uppercase">
            Trouver un stage
          </Link>
          <Link href="/contact" className="text-base uppercase">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}