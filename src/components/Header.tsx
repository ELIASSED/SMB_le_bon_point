// src/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between"> 
        <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo Sécurité Routière" className="h-12 w-auto" />

        <Link href="/">
            <img src="/smblogo.png" alt="Logo SMB "     className="h-12 w-auto bg-white" />
          </Link>
          <Link href="/" className="text-lg font-bold break-words">
  SECURITE ROUTIERE <br/> CENTRE DE RECUPERATION DE POINTS
</Link>


        </div>
       
        <nav>
          <ul className="flex space-x-4 text-base font-medium">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/stages">Stages</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
