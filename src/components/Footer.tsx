// Modification de Footer.tsx
import Image from "next/image";
import ExternalLinkButton from "./ExternalLinkButton";

export default function Footer() {
  return (
    <footer className="bg-teal text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bloc logo */}
          <div className="flex flex-col items-center md:items-start">
            <Image
              src="/logo.png"
              alt="Logo SMB Le Bon Point"
              width={120}
              height={60}
              className="mb-4"
            />
               {/* Copyright */}
        <div className="mt-4 text-center text-sm text-beige">
          &copy; {new Date().getFullYear()} SMB Le Bon Point. Tous droits réservés.
        </div>
          </div>

          {/* Bloc liens utiles */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow">Liens Utiles</h4>
            <ul>
            <li className="mb-2">
                <a
                  href="/stages"
                  className="text-beige hover:text-yellow-dark transition duration-200"
                >
                  S'inscrire à un stage
                </a>
              </li>    <li className="mb-2">
                <a
                  href="/conditions-générales-de-ventes.pdf" target="_blank" rel="noopener noreferrer"
                  className="text-beige hover:text-yellow-dark transition duration-200"
                >
                  Conditions Générales
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/confidentialite"
                  className="text-beige hover:text-yellow-dark transition duration-200"
                >
                  Politique de Confidentialité
                </a>
              </li>
              <li className="mb-2"> <ExternalLinkButton />
</li>
             
            </ul>
          </div>

          {/* Bloc contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow">Nous Contacter</h4>
            <ul>
              <li className="mb-2">
                <a
                  href="/contact"
                  className="text-beige hover:text-yellow-dark transition duration-200"
                >
                  Contactez-nous
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="mailto:smblebonpoint@gmail.com"
                  className="text-beige hover:text-yellow-dark transition duration-200"
                >
smblebonpoint@gmail.com
                </a>
              </li>
              <li>
                <span className="text-beige">+33 6 19 77 47 82</span>
              </li>
              <li>
                <span className="text-beige">+33 7 86 00 34 31</span>
              </li> 
            </ul>
          </div>
        </div>

    
     
      </div>
    </footer>
  );
}