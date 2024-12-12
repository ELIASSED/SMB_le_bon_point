'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white">   
    
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center space-x-3">
          {/* Logo principal */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo Sécurité Routière"
              className="bg-transparent h-10 w-auto"
              width={100} 
              height={50}
            />
          </Link>
          {/* Logo SMB */}
          <Link href="/">
            <Image
              src="/smblogo.png"
              alt="Logo SMB"
              className="h-12 w-auto bg-white"
              width={100} 
              height={50}
            />
          </Link>
          {/* Texte principal */}
          <Link href="/" className="text-xl font-bold leading-tight">
            SECURITE ROUTIERE <br /> CENTRE DE RECUPERATION DE POINTS
          </Link>
        </div>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex space-x-4 text-base font-medium">
          <Link href="/" className="hover:text-gray-400">
            Accueil
          </Link>
          <Link href="/stages" className="hover:text-gray-400">
            Stages
          </Link>
          <Link href="/contact" className="hover:text-gray-400">
            Contact
          </Link>
        </nav>

        {/* Bouton menu mobile */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu mobile"
        >
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-secondary border-t border-gray-700">
          <nav className="flex flex-col space-y-2 py-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 text-white hover:bg-gray-700"
            >
              Accueil
            </Link>
            <Link
              href="/stages"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 text-white hover:bg-gray-700"
            >
              Stages
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-2 text-white hover:bg-gray-700"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
