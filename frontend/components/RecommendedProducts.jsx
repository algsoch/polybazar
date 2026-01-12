'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheckIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function RecommendedProducts({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [productId]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/ml/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, top_k: 4 }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.recommendations || []);
      }
    } catch {
      // Mock data for demo
      setProducts([
        { id: '101', name: 'HDPE Granules - Prime', grade: 'A', pricePerKg: 88, location: 'Ahmedabad', images: ['https://via.placeholder.com/400x300'], verified: true, co2Saved: 14 },
        { id: '102', name: 'PP Recycled Pellets', grade: 'B+', pricePerKg: 65, location: 'Delhi', images: ['https://via.placeholder.com/400x300'], verified: true, co2Saved: 20 },
        { id: '103', name: 'HDPE Regrind Blue', grade: 'B', pricePerKg: 55, location: 'Mumbai', images: ['https://via.placeholder.com/400x300'], verified: false, co2Saved: 18 },
        { id: '104', name: 'LLDPE Film Grade', grade: 'A', pricePerKg: 72, location: 'Chennai', images: ['https://via.placeholder.com/400x300'], verified: true, co2Saved: 15 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="h-48 bg-neutral-bg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-neutral-bg rounded w-3/4" />
              <div className="h-6 bg-neutral-bg rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`} className="card group overflow-hidden hover:-translate-y-1 transition-transform">
          <div className="relative h-40 bg-gradient-to-br from-primary-50 to-accent-50">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            {product.verified && (
              <div className="absolute top-2 left-2 badge-accent flex items-center gap-1 text-[10px]">
                <ShieldCheckIcon className="w-3 h-3" />
                Verified
              </div>
            )}
            <div className="absolute top-2 right-2 badge-primary text-[10px]">
              Grade {product.grade}
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="font-medium text-small text-gray-900 mb-1 truncate group-hover:text-primary transition-colors">
              {product.name}
            </h4>
            
            <div className="flex items-center justify-between">
              <span className="text-h4 text-primary font-bold">₹{product.pricePerKg}/kg</span>
              <div className="flex items-center gap-1 text-[10px] text-neutral-muted">
                <MapPinIcon className="w-3 h-3" />
                {product.location}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
