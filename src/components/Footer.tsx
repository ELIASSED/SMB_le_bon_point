import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bloc logo */}
          <div className="flex flex-col items-center md:items-start">
            <Image
              src="/gov-logo.png" // Remplacez par le chemin de votre logo
              alt="Logo SMB Le Bon Point"
              width={120}
              height={60}
              className="mb-4"
            />
            <p className="text-sm text-center md:text-left">
              SMB Le Bon Point — Votre partenaire pour récupérer des points de permis.
            </p>
          </div>

          {/* Bloc liens utiles */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Utiles</h4>
            <ul>
              <li className="mb-2">
                <a
                  href="/faq"
                  className="hover:underline"
                >
                  FAQ
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/conditions"
                  className="hover:underline"
                >
                  Conditions Générales
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/confidentialite"
                  className="hover:underline"
                >
                  Politique de Confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Bloc contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Nous Contacter</h4>
            <ul>
              <li className="mb-2">
                <a
                  href="/contact"
                  className="hover:underline"
                >
                  Contactez-nous
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="mailto:contact@smblebonpoint.com"
                  className="hover:underline"
                >
smblebonpoint@gmail.com                </a>
              </li>
              <li>
                <span>+33 6 19 77 47 82</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne horizontale */}
        <div className="border-t border-gray-700 mt-8"></div>

        {/* Copyright */}
        <div className="mt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} SMB Le Bon Point. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
