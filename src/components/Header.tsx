import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <Link href="/">
        <Image src="/images/logo.png" alt="Logo" width={120} height={40} />
      </Link>
      <nav>
        <ul className="flex space-x-4 text-sm">
          <li><Link href="/">Accueil</Link></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/stages">Réservation</a></li>
        </ul>
      </nav>
    </header>
  )
}
