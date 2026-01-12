import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShieldCheckIcon, SparklesIcon, MapPinIcon, PhoneIcon, ChatBubbleLeftRightIcon, ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import ChatWidget from '@/components/ChatWidget';
import RecommendedProducts from '@/components/RecommendedProducts';
import PricePrediction from '@/components/PricePrediction';

async function getProduct(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch');
    }
    return res.json();
  } catch {
    // Mock data for demo
    return {
      id,
      name: 'HDPE Granules - Virgin Grade A',
      description: 'High-quality virgin HDPE granules suitable for injection molding and extrusion. Excellent mechanical properties with high impact resistance. MFI: 0.3-0.5 g/10min. Density: 0.954 g/cm³. Perfect for industrial containers, pipes, and packaging applications.',
      grade: 'A',
      category: 'HDPE',
      pricePerKg: 85,
      minOrderQuantity: 500,
      availableQuantity: 5000,
      location: 'Mumbai, Maharashtra',
      images: [
        'https://via.placeholder.com/800x600?text=HDPE+Granules+1',
        'https://via.placeholder.com/800x600?text=HDPE+Granules+2',
        'https://via.placeholder.com/800x600?text=HDPE+Granules+3',
      ],
      verified: true,
      co2Saved: 12,
      specifications: {
        mfi: '0.3-0.5 g/10min',
        density: '0.954 g/cm³',
        tensileStrength: '25 MPa',
        elongation: '600%',
        color: 'Natural/White',
        form: 'Granules',
      },
      seller: {
        id: 'seller-1',
        name: 'Maharashtra Polymers Pvt Ltd',
        verified: true,
        rating: 4.8,
        reviewCount: 156,
        memberSince: '2020',
        responseTime: '< 2 hours',
      },
      createdAt: '2024-01-15T10:30:00Z',
    };
  }
}

async function getRecommendations(productId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/products/${productId}/recommendations`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  if (!product) return { title: 'Product Not Found | PolyBazar' };
  
  return {
    title: `${product.name} | PolyBazar`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-bg py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-small">
          <Link href="/products" className="flex items-center gap-1 text-primary hover:underline">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Products
          </Link>
          <span className="text-neutral-muted">/</span>
          <span className="text-neutral-muted">{product.category}</span>
          <span className="text-neutral-muted">/</span>
          <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
        </nav>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="grid grid-cols-4 gap-2 p-4">
                <div className="col-span-4 md:col-span-3 relative aspect-[4/3] rounded-lg overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                  {product.verified && (
                    <div className="absolute top-4 left-4 badge-accent flex items-center gap-1">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Verified Listing
                    </div>
                  )}
                </div>
                <div className="hidden md:flex flex-col gap-2">
                  {product.images?.slice(1, 4).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="card p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-primary">Grade {product.grade}</span>
                  <span className="badge-neutral">{product.category}</span>
                  <div className="flex items-center gap-1 text-accent text-small">
                    <SparklesIcon className="w-4 h-4" />
                    {product.co2Saved} kg CO₂ saved/ton
                  </div>
                </div>
                <h1 className="text-h2 text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 text-neutral-muted">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{product.location}</span>
                </div>
              </div>
              
              <p className="text-body text-neutral-text leading-relaxed">
                {product.description}
              </p>
              
              {/* Specifications */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <div key={key} className="bg-neutral-bg rounded-lg p-3">
                      <p className="text-tiny text-neutral-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Price Prediction */}
            <PricePrediction
              category={product.category}
              grade={product.grade}
              location={product.location}
              currentPrice={product.pricePerKg}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="card p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-small text-neutral-muted">Price per kg</p>
                <p className="text-display text-primary font-bold">₹{product.pricePerKg}</p>
                <p className="text-small text-neutral-muted">
                  Min. order: {product.minOrderQuantity} kg
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-neutral-bg rounded-lg p-3 text-center">
                  <p className="text-tiny text-neutral-muted">Available</p>
                  <p className="font-semibold text-gray-900">{product.availableQuantity?.toLocaleString()} kg</p>
                </div>
                <div className="bg-neutral-bg rounded-lg p-3 text-center">
                  <p className="text-tiny text-neutral-muted">Grade</p>
                  <p className="font-semibold text-gray-900">{product.grade}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Start Negotiation
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <PhoneIcon className="w-5 h-5" />
                  Contact Seller
                </button>
              </div>
            </div>
            
            {/* Seller Card */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-h4">
                  {product.seller?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{product.seller?.name}</p>
                    {product.seller?.verified && (
                      <ShieldCheckIcon className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-small">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{product.seller?.rating}</span>
                    <span className="text-neutral-muted">({product.seller?.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-small">
                <div className="flex justify-between">
                  <span className="text-neutral-muted">Member since</span>
                  <span className="text-gray-900">{product.seller?.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-muted">Response time</span>
                  <span className="text-accent font-medium">{product.seller?.responseTime}</span>
                </div>
              </div>
              
              <Link href={`/sellers/${product.seller?.id}`} className="btn-ghost w-full mt-4 text-primary">
                View Seller Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <section className="mt-12">
          <h2 className="text-h3 text-gray-900 mb-6">Similar Products</h2>
          <RecommendedProducts productId={params.id} />
        </section>
      </div>
      
      {/* Chat Widget */}
      <ChatWidget
        productId={params.id}
        sellerId={product.seller?.id}
        productName={product.name}
      />
    </div>
  );
}
