// components/Hero.js

import Image from 'next/image'
import BookingButton from './BookingButton'

export default function Hero() {
  return (
    <section className="relative bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center">
          <div className="lg:w-1/2 mt-6 lg:mt-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Récupérez Vos Points à Saint-Maur-des-Fossés
            </h1>
            <p className="text-lg text-gray-800 mb-6">
              Participez à nos stages agréés et reprenez confiance au volant.
            </p>
            <BookingButton />
          </div>
          <div className="lg:w-1/2 relative">
            <Image
              src="/images/volant.png"
              alt="Stage de récupération de points"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-black opacity-10"></div>
    </section>
  )
}
