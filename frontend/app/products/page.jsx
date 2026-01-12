import Link from 'next/link';
import { Suspense } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/ProductCard';

// Server-side pagination for SEO
export const dynamic = 'force-dynamic';

async function getProducts(searchParams) {
  const params = new URLSearchParams({
    page: searchParams.page || '0',
    size: searchParams.size || '12',
    ...(searchParams.q && { q: searchParams.q }),
    ...(searchParams.category && { category: searchParams.category }),
    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
    ...(searchParams.location && { location: searchParams.location }),
    ...(searchParams.grade && { grade: searchParams.grade }),
  });

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/products?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch {
    // Mock data for demo
    return {
      content: Array.from({ length: 12 }, (_, i) => ({
        id: String(i + 1),
        name: ['HDPE Granules', 'PP Recycled Pellets', 'PET Flakes', 'LDPE Film Grade', 'ABS Regrind', 'PC Clear'][i % 6] + ` - Batch ${i + 1}`,
        grade: ['A', 'A', 'B+', 'B', 'A+', 'B'][i % 6],
        pricePerKg: 45 + Math.floor(Math.random() * 60),
        location: ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Ahmedabad', 'Pune'][i % 6],
        images: [], // No external images
        verified: i % 3 !== 0,
        co2Saved: 10 + Math.floor(Math.random() * 20),
        category: ['HDPE', 'PP', 'PET', 'LDPE', 'ABS', 'PC'][i % 6],
        seller: { name: `Seller ${i + 1}`, rating: 4.0 + Math.random() },
      })),
      totalElements: 100,
      totalPages: 9,
      number: parseInt(searchParams.page) || 0,
      size: 12,
    };
  }
}

function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-bg" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-bg rounded w-3/4" />
        <div className="h-6 bg-neutral-bg rounded w-1/2" />
        <div className="h-3 bg-neutral-bg rounded w-full" />
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }) {
  const products = await getProducts(searchParams);

  return (
    <div className="min-h-screen bg-neutral-bg py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-gray-900 mb-2">Polymer Products</h1>
          <p className="text-body text-neutral-muted">
            Browse {products.totalElements?.toLocaleString() || '100+'} verified polymer listings
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <FunnelIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>
              <Filters />
            </div>
          </aside>
          
          {/* Products Grid */}
          <main className="flex-1">
            {/* Search & Sort */}
            <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full sm:max-w-md">
                <input
                  type="search"
                  placeholder="Search products..."
                  defaultValue={searchParams.q}
                  className="input pl-10"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-small text-neutral-muted whitespace-nowrap">
                  {products.totalElements} results
                </span>
                <select className="input py-2 px-3 w-full sm:w-auto" defaultValue="relevance">
                  <option value="relevance">Most Relevant</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            
            {/* Products */}
            <Suspense fallback={
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }>
              {products.content?.length > 0 ? (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.content.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <Pagination
                    currentPage={products.number}
                    totalPages={products.totalPages}
                    totalElements={products.totalElements}
                  />
                </>
              ) : (
                <div className="card p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-h4 text-gray-900 mb-2">No products found</h3>
                  <p className="text-body text-neutral-muted mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Link href="/products" className="btn-primary">
                    Clear Filters
                  </Link>
                </div>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Polymer Products | PolyBazar',
  description: 'Browse thousands of verified polymer granules, recycled plastics, and industrial polymers from trusted suppliers across India.',
};
