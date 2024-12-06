import Image from 'next/image'
import BookingButton from '../components/BookingButton'

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Stage de récupération de points à Saint-Maur</h1>
      <p className="mb-4">
        Bienvenue sur notre page dédiée au centre de récupération de points de Saint-Maur. 
        Nous proposons des stages agréés par la préfecture, destinés aux conducteurs souhaitant 
        récupérer des points sur leur permis de conduire.
      </p>

      <div className="mb-6">
        <Image 
          src="/images/saint-maur-center.jpg" 
          alt="Centre de récupération de points à Saint-Maur" 
          width={800}
          height={400}
          className="rounded shadow"
        />
      </div>

      <h2 className="text-2xl font-semibold mb-2">Pourquoi choisir notre centre à Saint-Maur ?</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Stages agréés par la préfecture</li>
        <li>Formateurs expérimentés et pédagogues</li>
        <li>Possibilité de récupérer jusqu’à 4 points</li>
        <li>Réservation et paiement en ligne sécurisés</li>
      </ul>

      <p className="mb-6">
        Notre centre est situé au cœur de Saint-Maur, facilement accessible en transport en commun 
        ou en voiture. Les sessions ont lieu régulièrement, et les places sont limitées 
        (maximum 20 participants).
      </p>

      <BookingButton />

      <h2 className="text-2xl font-semibold mt-8 mb-2">Informations pratiques</h2>
      <p className="mb-2"><strong>Adresse : </strong>123 rue de la République, 94100 Saint-Maur</p>
      <p className="mb-2"><strong>Tarif :</strong> 230 € (incluant les frais de dossier)</p>
      <p className="mb-2"><strong>Durée du stage :</strong> 2 jours (16 heures de formation)</p>
      <p className="mb-6">
        À l’issue du stage, une attestation vous sera remise, permettant la récupération de points 
        sur votre permis (sous réserve d’éligibilité).
      </p>
    </div>
  )
}
