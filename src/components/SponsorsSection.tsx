'use client';

import React from 'react';
import Image from 'next/image';

const sponsors = [
  { name: 'Alatau City Bank', logo: '/sponsors/alatau-city-bank.webp', url: '#' },
  { name: 'Sport+', logo: '/sponsors/sport-plus.webp', url: '#' },
  { name: 'QazSport', logo: '/sponsors/qazsport.webp', url: '#' },
  { name: 'Kinopoisk', logo: '/sponsors/kinopoisk.webp', url: '#' },
];

export const SponsorsSection = React.memo(function SponsorsSection() {
  return (
    <section className="bg-white dark:bg-dark-surface py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-6 md:gap-8 lg:gap-12">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.url}
              className="transition-transform duration-300 hover:scale-105 px-3 py-2 rounded-lg dark:bg-white/10"
              title={sponsor.name}
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={128}
                height={48}
                className="h-8 md:h-10 lg:h-12 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});
