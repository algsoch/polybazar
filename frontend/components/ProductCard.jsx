'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheckIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function ProductCard({ product }) {
  const handleContact = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open contact modal
    console.log('Contact seller for:', product.id);
  };

  const handleOffer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open offer modal
    console.log('Make offer for:', product.id);
  };

  return (
    <Link href={`/products/${product.id}`} className="card group overflow-hidden hover:-translate-y-1 transition-transform">
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            📦
          </div>
        )}
        {product.verified && (
          <div className="absolute top-3 left-3 badge-accent flex items-center gap-1">
            <ShieldCheckIcon className="w-3 h-3" />
            Verified
          </div>
        )}
        <div className="absolute top-3 right-3 badge-primary">
          Grade {product.grade}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-h4 text-primary font-bold">₹{product.pricePerKg}/kg</span>
          <div className="flex items-center gap-1 text-tiny text-neutral-muted">
            <MapPinIcon className="w-3 h-3" />
            {product.location}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
          <div className="flex items-center gap-1 text-accent text-tiny">
            <SparklesIcon className="w-3 h-3" />
            {product.co2Saved} kg CO₂ saved
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleContact}
              className="px-3 py-1 text-tiny font-medium text-primary bg-primary-50 rounded-button hover:bg-primary-100 transition-colors"
            >
              Contact
            </button>
            <button 
              onClick={handleOffer}
              className="px-3 py-1 text-tiny font-medium text-accent bg-accent-50 rounded-button hover:bg-accent-100 transition-colors"
            >
              Offer
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
