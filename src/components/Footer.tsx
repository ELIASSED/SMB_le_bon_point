// components/Footer.js
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-xl font-semibold mb-4">À Propos</h4>
          <ul>
            <li className="mb-2"><a href="/contact" className="hover:underline">Contactez-nous</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-semibold mb-4">Liens Utiles</h4>
          <ul>
            <li className="mb-2"><a href="/faq" className="hover:underline">FAQ</a></li>
            <li className="mb-2"><a href="/conditions" className="hover:underline">Conditions Générales</a></li>
            <li className="mb-2"><a href="/confidentialite" className="hover:underline">Politique de Confidentialité</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-semibold mb-4">Suivez-nous</h4>
          <div className="flex space-x-8">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Image src="" alt="Facebook" className="w-6 h-6 hover:opacity-75" />
            </a>
            
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm">
        &copy; {new Date().getFullYear()} SMB le bon point. Tous droits réservés.
      </div>
    </footer>
  )
}
