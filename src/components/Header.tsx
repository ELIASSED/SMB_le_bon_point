"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative bg-white shadow-lg rounded-lg max-w-6xl mx-auto mt-9">
      {/* Bande supérieure avec logo et titre */}
      <div className="bg-yellow-dark py-6 px-9 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <img
              src="/smblogo.png"
              alt="Logo SMB"
              className="h-16 w-auto"
              width={150}
              height={75}
            />
          </Link>
          <div className="text-left">
            <Link href="/" className="text-xl font-semibold text-gray-dark">
              <span className="block text-2xl">Sécurité Routière Formation</span>
              <span className="block text-base text-gray-600">
                Stages de Récupération de Points
              </span>
              <span className="block text-sm text-gray-500 mt-1">
                Agrément R2209400050
              </span>
            </Link>
          </div>
        </div>
        <div>
          <img
            src="/logo.png"
            alt="Exemple Banner"
            className="h-24 w-auto"
          />
        </div>
      </div>

      {/* Bande noire avec navigation principale */}
      <div className="bg-beige font-bold text-white rounded-b-lg">
        <nav className="flex justify-end px-9 py-3 space-x-8">
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

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="bg-teal text-white md:hidden rounded-b-lg">
          <nav className="flex flex-col space-y-3 py-6 px-9">
            <Link
              href="/stages"
              onClick={() => setMenuOpen(false)}
              className="py-3"
            >
              Trouver un stage
            </Link>
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="py-3"
            >
              Accueil
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="py-3"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
